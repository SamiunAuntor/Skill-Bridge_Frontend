"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import ReviewCard from "@/Components/Reviews/ReviewCard";
import { BookingApiError, getMyTutorReviews } from "@/lib/booking-api";
import type { SessionReview } from "@/types/tutor";

function toFriendlyError(error: unknown): string {
  if (error instanceof BookingApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "We couldn't load tutor reviews right now.";
}

export default function TutorDashboardReviewsPage() {
  const [reviews, setReviews] = useState<SessionReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await getMyTutorReviews();

        if (!cancelled) {
          setReviews(result.reviews);
        }
      } catch (error) {
        if (!cancelled) {
          await Swal.fire({
            icon: "error",
            title: "Reviews unavailable",
            text: toFriendlyError(error),
            confirmButtonColor: "#1d3b66",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <DashboardPageLoader label="Loading reviews..." />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          Reviews
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          Every published student review connected to your completed sessions appears here.
        </p>
      </header>

      {reviews.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </section>
      ) : (
        <div className="rounded-2xl bg-surface-container-low p-6 text-sm text-on-surface-variant">
          No reviews yet. Once students review completed sessions, they will appear here.
        </div>
      )}
    </div>
  );
}
