"use client";

import { LoaderCircle, Star, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { SessionReview } from "@/types/tutor";

type SessionReviewModalProps = {
  isOpen: boolean;
  mode: "create" | "edit" | "view";
  review: SessionReview | null;
  counterpartName: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit?: (payload: { rating: number; comment: string }) => void;
};

function countWords(value: string): number {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export default function SessionReviewModal({
  isOpen,
  mode,
  review,
  counterpartName,
  isSubmitting = false,
  errorMessage = null,
  onClose,
  onSubmit,
}: SessionReviewModalProps) {
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  const title = useMemo(() => {
    switch (mode) {
      case "edit":
        return "Edit your review";
      case "view":
        return "Review details";
      default:
        return "Leave a review";
    }
  }, [mode]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit() {
    const trimmedComment = comment.trim();
    const words = countWords(trimmedComment);

    if (words < 10) {
      setLocalError("Please write at least 10 words so your review is meaningful.");
      return;
    }

    if (trimmedComment.length > 1000) {
      setLocalError("Review comment must be 1000 characters or fewer.");
      return;
    }

    setLocalError(null);
    onSubmit?.({
      rating,
      comment: trimmedComment,
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0px_24px_60px_rgba(0,0,0,0.22)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-2xl font-bold text-primary">
              {title}
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {mode === "view"
                ? `Review shared for ${counterpartName}.`
                : `Share thoughtful feedback about your session with ${counterpartName}.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close review modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 rounded-2xl border border-outline-variant/15 bg-surface p-5">
          <div>
            <p className="text-sm font-semibold text-primary">Rating</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const currentRating = index + 1;
                const isActive = currentRating <= rating;

                return (
                  <button
                    key={currentRating}
                    type="button"
                    disabled={mode === "view" || isSubmitting}
                    onClick={() => setRating(currentRating)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-surface-container-low text-on-surface-variant"
                    } disabled:cursor-not-allowed disabled:opacity-80`}
                  >
                    <Star className={`h-4 w-4 ${isActive ? "fill-current" : ""}`} />
                    {currentRating}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-primary">Comment</p>
              <span className="text-xs text-on-surface-variant">
                {countWords(comment)} words
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              readOnly={mode === "view"}
              maxLength={1000}
              placeholder="Describe the teaching quality, clarity, communication, and overall experience."
              className="mt-3 min-h-[180px] w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 read-only:cursor-default read-only:bg-surface-container"
            />
            <p className="mt-2 text-xs text-on-surface-variant">
              Write at least 10 words. Short one-line feedback will not be accepted.
            </p>
          </div>
        </div>

        {localError || errorMessage ? (
          <p className="mt-4 text-sm font-medium text-error">
            {localError || errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === "view" ? "Close" : "Cancel"}
          </button>

          {mode !== "view" ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving review...
                </span>
              ) : mode === "edit" ? (
                "Save Changes"
              ) : (
                "Submit Review"
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
