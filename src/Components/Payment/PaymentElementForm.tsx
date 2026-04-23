"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { clearPaymentCheckoutSession } from "@/lib/payment-checkout";

type PaymentElementFormProps = {
  bookingId: string;
  paymentIntentId: string;
  returnTo: string;
  amountLabel: string;
};

export default function PaymentElementForm({
  bookingId,
  paymentIntentId,
  returnTo,
  amountLabel,
}: PaymentElementFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements || isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(
        error.message ||
          "We couldn't complete your payment. Please check your payment details and try again."
      );
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      clearPaymentCheckoutSession(bookingId);
      router.replace(
        `/payment/success?booking=${encodeURIComponent(
          bookingId
        )}&payment_intent=${encodeURIComponent(
          paymentIntent.id
        )}&next=${encodeURIComponent(returnTo)}`
      );
      return;
    }

    if (paymentIntent?.status === "processing") {
      router.replace(
        `/payment/success?booking=${encodeURIComponent(
          bookingId
        )}&payment_intent=${encodeURIComponent(
          paymentIntent.id
        )}&processing=1&next=${encodeURIComponent(returnTo)}`
      );
      return;
    }

    setIsSubmitting(false);
    clearPaymentCheckoutSession(bookingId);
    router.replace(
      `/payment/failed?booking=${encodeURIComponent(
        bookingId
      )}&payment_intent=${encodeURIComponent(
        paymentIntentId
      )}&next=${encodeURIComponent(returnTo)}`
    );
  }

  return (
    <form
      className="bg-white p-7"
      onSubmit={handleSubmit}
    >
      <h2 className="font-headline text-xl font-bold text-primary">
        Payment details
      </h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        Enter your card information below. Payments are processed securely by Stripe.
      </p>

      <div className="my-6 flex items-start gap-3 rounded-2xl border border-outline-variant/15 bg-[#f7f9fc] p-4 text-sm text-on-surface-variant">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          Your payment details are handled securely by Stripe. SkillBridge never
          stores your full card information.
        </p>
      </div>

      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {errorMessage ? (
        <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#554ee8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Processing payment...
          </>
        ) : (
          `Pay ${amountLabel}`
        )}
      </button>

      <p className="mt-4 text-center text-xs text-on-surface-variant">
        Powered by Stripe
      </p>
    </form>
  );
}
