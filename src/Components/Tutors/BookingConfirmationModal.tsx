"use client";

import { LoaderCircle, WalletCards, X } from "lucide-react";

type BookingConfirmationModalProps = {
  isOpen: boolean;
  subjectLabel: string;
  dateLabel: string;
  timeLabel: string;
  amountLabel: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function BookingConfirmationModal({
  isOpen,
  subjectLabel,
  dateLabel,
  timeLabel,
  amountLabel,
  isSubmitting = false,
  onClose,
  onConfirm,
}: BookingConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0px_24px_60px_rgba(0,0,0,0.22)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-2xl font-bold text-primary">
              Continue to payment
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Review the selected session details before moving to secure checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close booking confirmation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 rounded-2xl border border-outline-variant/15 bg-surface p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-on-surface-variant">Subject</span>
            <span className="text-sm font-semibold text-primary">{subjectLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-on-surface-variant">Date</span>
            <span className="text-sm font-semibold text-primary">{dateLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-on-surface-variant">Time</span>
            <span className="text-sm font-semibold text-primary">{timeLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-on-surface-variant">Amount</span>
            <span className="font-headline text-2xl font-black text-primary">
              {amountLabel}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-primary-fixed/55 p-4 text-sm text-on-primary-fixed-variant">
          <div className="flex items-start gap-3">
            <WalletCards className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              You will be redirected to Stripe-powered secure checkout. Your
              booking becomes confirmed only after the payment succeeds.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Preparing checkout...
              </span>
            ) : (
              "Proceed to Payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
