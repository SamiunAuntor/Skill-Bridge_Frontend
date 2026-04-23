"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  TriangleAlert,
} from "lucide-react";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import { PaymentApiError, getPaymentStatus } from "@/lib/payment-api";
import { clearPaymentCheckoutSession } from "@/lib/payment-checkout";
import type { PaymentStatusResponse } from "@/types/payment";

type PaymentResultClientProps = {
  paymentIntentId: string;
  bookingId: string;
  processing?: boolean;
  returnTo: string;
};

function formatAmount(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

export default function PaymentResultClient({
  paymentIntentId,
  bookingId,
  processing = false,
  returnTo,
}: PaymentResultClientProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function loadStatus(attempt = 0) {
      let scheduledRetry = false;

      if (attempt === 0) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      try {
        const response = await getPaymentStatus(paymentIntentId);

        if (!isMounted) {
          return;
        }

        if (
          response.status === "cancelled" ||
          response.bookingStatus === "cancelled"
        ) {
          clearPaymentCheckoutSession(bookingId);
          router.replace(
            `/payment/failed?booking=${encodeURIComponent(
              bookingId
            )}&payment_intent=${encodeURIComponent(
              paymentIntentId
            )}&next=${encodeURIComponent(returnTo)}`
          );
          return;
        }

        const isConfirmed =
          response.paymentStatus === "paid" &&
          response.bookingStatus === "confirmed";

        if (!isConfirmed && attempt < 6) {
          scheduledRetry = true;
          retryTimer = setTimeout(() => {
            void loadStatus(attempt + 1);
          }, 1500);
          return;
        }

        if (isConfirmed) {
          clearPaymentCheckoutSession(bookingId);
        }

        setPayment(response);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof PaymentApiError
            ? error.message
            : "We couldn't verify your payment result."
        );
      } finally {
        if (isMounted && !scheduledRetry) {
          setIsLoading(false);
        }
      }
    }

    void loadStatus();

    return () => {
      isMounted = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [bookingId, paymentIntentId, returnTo, router]);

  const subtitle = useMemo(() => {
    if (processing) {
      return "Stripe is still finalizing your payment. This page will reflect the final state as soon as it is available.";
    }

    return "Your tutoring session payment has been received. SkillBridge has confirmed the booking and prepared the session.";
  }, [processing]);

  if (isLoading) {
    return <DashboardPageLoader label="Verifying your payment..." />;
  }

  if (errorMessage || !payment) {
    return (
      <div className="rounded-[1.7rem] border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-[0px_18px_50px_rgba(0,51,88,0.08)]">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-error" />
          <div>
            <h1 className="font-headline text-2xl font-bold text-primary">
              Payment verification failed
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              {errorMessage || "We couldn't verify this payment result."}
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
    payment.paymentStatus !== "paid" ||
    payment.bookingStatus !== "confirmed"
  ) {
    return (
      <div className="rounded-[1.7rem] border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-[0px_18px_50px_rgba(0,51,88,0.08)]">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
            <BadgeCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-headline text-[2.2rem] font-extrabold tracking-tight text-primary">
            Payment verification in progress
          </h1>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            Stripe has responded, but SkillBridge is still finalizing the booking
            confirmation. Please refresh this page in a moment if the status does
            not update automatically.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
            >
              Refresh status
            </button>
            <Link
              href={returnTo}
              className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to tutor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.7rem] border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-[0px_18px_50px_rgba(0,51,88,0.08)]">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <BadgeCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-headline text-[2.4rem] font-extrabold tracking-tight text-primary">
          Payment successful
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          {subtitle}
        </p>

        <div className="mt-8 grid gap-4 rounded-[1.35rem] border border-outline-variant/15 bg-surface p-5 text-left sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              Booking
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">{payment.bookingId}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              Amount
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">
              {formatAmount(payment.amountInCents, payment.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              Payment method
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">
              {payment.cardBrand
                ? `${payment.cardBrand.toUpperCase()} ending in ${payment.last4Digits ?? "****"}`
                : payment.paymentMethod ?? "Card"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              Booking status
            </p>
            <p className="mt-2 text-sm font-semibold capitalize text-primary">
              {payment.bookingStatus.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard/student/sessions"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
          >
            View my sessions
          </Link>
          <Link
            href={returnTo}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tutor
          </Link>
        </div>
      </div>
    </div>
  );
}
