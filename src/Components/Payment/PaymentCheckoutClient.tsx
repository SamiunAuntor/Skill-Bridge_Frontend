"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Elements } from "@stripe/react-stripe-js";
import { ArrowLeft, CreditCard, TriangleAlert } from "lucide-react";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import PaymentElementForm from "@/Components/Payment/PaymentElementForm";
import { PaymentApiError, getPaymentStatus } from "@/lib/payment-api";
import {
  clearPaymentCheckoutSession,
  readPaymentCheckoutSession,
} from "@/lib/payment-checkout";
import { stripePromise } from "@/lib/stripe";
import type { PaymentStatusResponse } from "@/types/payment";

type PaymentCheckoutClientProps = {
  bookingId: string;
  paymentIntentId: string;
  returnTo: string;
};

function formatAmount(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PaymentCheckoutClient({
  bookingId,
  paymentIntentId,
  returnTo,
}: PaymentCheckoutClientProps) {
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPaymentStatus() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getPaymentStatus(paymentIntentId);

        if (!isMounted) {
          return;
        }

        const storedCheckoutSession = readPaymentCheckoutSession(bookingId);

        if (
          storedCheckoutSession?.paymentIntentId === paymentIntentId &&
          storedCheckoutSession.clientSecret
        ) {
          setClientSecret(storedCheckoutSession.clientSecret);
        } else if (
          response.status !== "succeeded" &&
          response.paymentStatus !== "paid"
        ) {
          setErrorMessage(
            "This checkout session is no longer available in this tab. Please return to the tutor page and start payment again."
          );
        }

        setPayment(response);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof PaymentApiError
            ? error.message
            : "We couldn't load this checkout session."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPaymentStatus();

    return () => {
      isMounted = false;
    };
  }, [bookingId, paymentIntentId]);

  const formattedHoldExpiry = useMemo(
    () => formatDateTime(payment?.holdExpiresAt ?? null),
    [payment?.holdExpiresAt]
  );

  if (isLoading) {
    return <DashboardPageLoader label="Preparing secure checkout..." />;
  }

  if (errorMessage || !payment) {
    return (
      <div className="rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-[0px_18px_50px_rgba(0,51,88,0.08)]">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-error" />
          <div>
            <h2 className="font-headline text-2xl font-bold text-primary">
              Checkout unavailable
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              {errorMessage || "This checkout session could not be loaded."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={returnTo}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to tutor
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    payment.paymentStatus === "paid" &&
    payment.bookingStatus === "confirmed"
  ) {
    clearPaymentCheckoutSession(bookingId);

    return (
      <div className="rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-[0px_18px_50px_rgba(0,51,88,0.08)]">
        <h2 className="font-headline text-2xl font-bold text-primary">
          Payment already completed
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          This booking has already been paid successfully.
        </p>
        <div className="mt-5">
          <Link
            href={`/payment/success?booking=${encodeURIComponent(
              bookingId
            )}&payment_intent=${encodeURIComponent(
              paymentIntentId
            )}&next=${encodeURIComponent(returnTo)}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
          >
            Continue to confirmation
          </Link>
        </div>
      </div>
    );
  }

  if (payment.status === "cancelled" || payment.bookingStatus === "cancelled") {
    clearPaymentCheckoutSession(bookingId);

    return (
      <div className="rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-[0px_18px_50px_rgba(0,51,88,0.08)]">
        <h2 className="font-headline text-2xl font-bold text-primary">
          Checkout no longer available
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          This payment session was cancelled. Please choose a slot again to
          restart checkout.
        </p>
        <div className="mt-5">
          <Link
            href={returnTo}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tutor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1040px] overflow-hidden rounded-[1.5rem] border border-outline-variant/15 bg-surface-container-lowest shadow-[0px_24px_70px_rgba(15,35,55,0.13)] lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="border-b border-outline-variant/15 bg-[#f7f9fc] p-7 lg:border-b-0 lg:border-r">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
          <CreditCard className="h-3.5 w-3.5" />
          Secure Checkout
        </div>

        <h1 className="mt-6 font-headline text-[2rem] font-extrabold tracking-tight text-primary">
          Pay SkillBridge
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">Tutoring session payment</p>

        <div className="mt-8">
          <p className="text-sm text-on-surface-variant">Total due</p>
          <p className="mt-1 font-headline text-[2.8rem] font-black tracking-tight text-primary">
            {formatAmount(payment.amountInCents, payment.currency)}
          </p>
        </div>

        <div className="mt-8 space-y-4 border-t border-outline-variant/15 pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              Booking reference
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-primary">
              {bookingId}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              Current status
            </p>
            <p className="mt-1 text-sm font-semibold capitalize text-primary">
              {payment.status.replace(/_/g, " ")}
            </p>
          </div>
          {formattedHoldExpiry && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                Hold expires
              </p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {formattedHoldExpiry}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5">
          <Link
            href={returnTo}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tutor page
          </Link>
        </div>
      </aside>

      {clientSecret ? (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#1d3b66",
                colorText: "#17324d",
                borderRadius: "14px",
              },
            },
          }}
        >
          <PaymentElementForm
            bookingId={bookingId}
            paymentIntentId={paymentIntentId}
            returnTo={returnTo}
            amountLabel={formatAmount(payment.amountInCents, payment.currency)}
          />
        </Elements>
      ) : (
        <div className="rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-[0px_18px_50px_rgba(0,51,88,0.08)]">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-error" />
            <div>
              <h2 className="font-headline text-2xl font-bold text-primary">
                Checkout session expired
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Return to the tutor page, select your slot again, and restart secure
                checkout.
              </p>
              <div className="mt-5">
                <Link
                  href={returnTo}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to tutor
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
