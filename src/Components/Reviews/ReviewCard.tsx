"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import avatarImage from "@/assets/avatar.png";
import type { SessionReview, TutorTestimonial } from "@/types/tutor";

type ReviewCardItem = SessionReview | TutorTestimonial;

function formatRelativeDate(isoDate: string): string {
  const createdAt = new Date(isoDate);
  const differenceInDays = Math.max(
    0,
    Math.round((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  );

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "1 day ago";
  }

  if (differenceInDays < 30) {
    return `${differenceInDays} days ago`;
  }

  const weeks = Math.round(differenceInDays / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ReviewCard({
  review,
}: {
  review: ReviewCardItem;
}) {
  const comment = review.comment || "A highly recommended tutoring experience.";

  return (
    <article className="rounded-xl bg-surface-container-lowest p-8 shadow-[0px_4px_20px_rgba(0,51,88,0.04)]">
      <div className="mb-4 flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface-container-high">
          {review.student.avatarUrl ? (
            <Image
              src={review.student.avatarUrl}
              alt={review.student.name}
              fill
              sizes="48px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <>
              <Image
                src={avatarImage}
                alt=""
                fill
                sizes="48px"
                className="object-cover opacity-20"
              />
              <span className="relative z-10 flex h-full items-center justify-center text-sm font-black text-primary">
                {getInitials(review.student.name)}
              </span>
            </>
          )}
        </div>
        <div>
          <h4 className="font-bold text-primary">{review.student.name}</h4>
          <div className="flex gap-1 text-amber-500">
            {Array.from({ length: review.rating }).map((_, index) => (
              <Star key={index} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
        </div>
        <time className="ml-auto text-xs font-medium text-on-surface-variant">
          {formatRelativeDate(review.createdAt)}
        </time>
      </div>
      <p className="italic leading-relaxed text-on-surface-variant">
        &quot;{comment}&quot;
      </p>
    </article>
  );
}
