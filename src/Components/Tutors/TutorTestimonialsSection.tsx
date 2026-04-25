"use client";

import { MessageSquareQuote } from "lucide-react";
import { useMemo, useState } from "react";
import ReviewCard from "@/Components/Reviews/ReviewCard";
import type { TutorTestimonial } from "@/types/tutor";

export default function TutorTestimonialsSection({
  testimonials,
  totalReviews,
}: {
  testimonials: TutorTestimonial[];
  totalReviews: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleTestimonials = useMemo(
    () => (isExpanded ? testimonials : testimonials.slice(0, 6)),
    [isExpanded, testimonials]
  );

  return (
    <section>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 font-headline text-2xl font-bold text-primary">
          <MessageSquareQuote className="h-5 w-5 text-secondary" />
          Student Testimonials
        </h2>
        {testimonials.length > 6 ? (
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="text-sm font-bold text-secondary hover:underline"
          >
            {isExpanded
              ? "Show fewer reviews"
              : `View all ${totalReviews} reviews`}
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {visibleTestimonials.length > 0 ? (
          visibleTestimonials.map((testimonial) => (
            <ReviewCard key={testimonial.id} review={testimonial} />
          ))
        ) : (
          <article className="rounded-xl bg-surface-container-lowest p-8 shadow-[0px_4px_20px_rgba(0,51,88,0.04)] md:col-span-2">
            <p className="text-sm text-on-surface-variant">
              Students will see testimonials here as soon as reviews are added.
            </p>
          </article>
        )}
      </div>
    </section>
  );
}
