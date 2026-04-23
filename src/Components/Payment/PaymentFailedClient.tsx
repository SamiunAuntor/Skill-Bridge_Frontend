"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import { PaymentApiError, getPaymentStatus } from "@/lib/payment-api";
import { readPaymentCheckoutSession } from "@/lib/payment-checkout";
import type { PaymentStatusResponse } from "@/types/payment";

type PaymentFailedClientProps = {
  bookingId: string;
  paymentIntentId: string;
  returnTo: string;
};

function isHoldActive(payment: PaymentStatusResponse | null): boolean {
  if (!payment?.holdExpiresAt) {
    return false;
  }

  return new Date(payment.holdExpiresAt).getTime() > Date.now();
}

export default function PaymentFailedClient({
  bookingId,
  paymentIntentId,
  returnTo,
}: PaymentFailedClientProps) {
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(paymentIntentId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPaymentStatus() {
      if (!paymentIntentId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPaymentStatus(paymentIntentId);

        if (isMounted) {
          setPayment(response);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof PaymentApiError
            ? error.message
            : "We couldn't verify whether this payment can be retried."
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
  }, [paymentIntentId]);

  const canRetry = useMemo(() => {
    const storedCheckout = bookingId
      ? readPaymentCheckoutSession(bookingId)
      : null;

    return (
      Boolean(bookingId) &&
      Boolean(paymentIntentId) &&
      storedCheckout?.paymentIntentId === paymentIntentId &&
      isHoldActive(payment) &&
      payment?.bookingStatus === "pending_payment"
    );
  }, [bookingId, payment, paymentIntentId]);

  if (isLoading) {
    return <DashboardPageLoader label="Checking payment retry status..." />;
  }

  return (
    <div className="rounded-[1.7rem] border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-[0px_18px_50px_rgba(0,51,88,0.08)]">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-on-error-container">
          <TriangleAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-headline text-[2.4rem] font-extrabold tracking-tight text-primary">
          Payment not completed
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          {canRetry
            ? "Your slot is still held for you. You can retry payment with another card before the hold expires."
            : "Your payment was not completed or the checkout hold is no longer available. Please choose a slot again to restart securely."}
        </p>

        {errorMessage ? (
          <div className="mt-5 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {canRetry ? (
            <Link
              href={`/payment/checkout/${encodeURIComponent(
                bookingId
              )}?payment_intent=${encodeURIComponent(
                paymentIntentId
              )}&next=${encodeURIComponent(returnTo)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
            >
              <RotateCcw className="h-4 w-4" />
              Retry payment
            </Link>
          ) : null}
          <Link
            href={returnTo}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
              Back to previous page
          </Link>
          <Link
            href="/dashboard/student/sessions"
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm font-semibold text-primary"
          >
            View my sessions
          </Link>
        </div>
      </div>
    </div>
  );
}
