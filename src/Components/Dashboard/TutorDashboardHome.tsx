"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  CalendarClock,
  Clock3,
  ExternalLink,
  ReceiptText,
  Star,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  BookingApiError,
  cancelBooking,
  getTutorDashboardSummary,
  joinSession,
} from "@/lib/booking-api";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import { DashboardSessionItem } from "@/types/tutor";

function toFriendlyError(error: unknown): string {
  if (error instanceof BookingApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load the tutor dashboard right now.";
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatSessionDate(value: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatSessionTime(start: string, end: string): string {
  const formatter = new Intl.DateTimeFormat("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
}

export default function TutorDashboardHome() {
  const { data: session } = authClient.useSession();
  const role = session?.user?.role;
  const [summary, setSummary] = useState<{
    stats: {
      totalEarnings: number;
      totalHours: number;
      averageRating: number | null;
      totalReviews: number;
    };
    upcomingSessions: DashboardSessionItem[];
    recentFeedback: Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
      student: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (role !== "tutor") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const result = await getTutorDashboardSummary();
        if (!cancelled) {
          setSummary(result);
        }
      } catch (error) {
        if (!cancelled) {
          await Swal.fire({
            icon: "error",
            title: "Unable to load dashboard",
            text: toFriendlyError(error),
            confirmButtonColor: "#1d3b66",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role]);

  if (role !== "tutor") {
    return null;
  }

  if (loading) {
    return <DashboardPageLoader label="Loading tutor dashboard..." />;
  }

  const totalEarnings = summary?.stats.totalEarnings ?? 0;
  const totalHours = summary?.stats.totalHours ?? 0;
  const averageRating = summary?.stats.averageRating ?? null;
  const totalReviews = summary?.stats.totalReviews ?? 0;
  const upcomingSessions = summary?.upcomingSessions ?? [];
  const recentFeedback = summary?.recentFeedback ?? [];

  async function handleCancel(bookingId: string) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Cancel this session?",
      text: "The booking will be cancelled and the slot will become available again if it is still in the future.",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "Keep session",
      confirmButtonColor: "#9f1d1d",
      cancelButtonColor: "#1d3b66",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          await cancelBooking(bookingId);
          setSummary((current) =>
            current
              ? {
                  ...current,
                  upcomingSessions: current.upcomingSessions
                    .map((item) =>
                      item.bookingId === bookingId
                        ? {
                            ...item,
                            bookingStatus: "cancelled" as const,
                            sessionStatus: "cancelled" as const,
                            canCancel: false,
                          }
                        : item
                    )
                    .filter(
                      (item) =>
                        item.sessionStatus === "scheduled" ||
                        item.sessionStatus === "ongoing"
                    ),
                }
              : current
          );

          await Swal.fire({
            icon: "success",
            title: "Session cancelled",
            text: "Both tutor and student have been notified.",
            confirmButtonColor: "#1d3b66",
          });
        } catch (error) {
          await Swal.fire({
            icon: "error",
            title: "Cancellation failed",
            text: toFriendlyError(error),
            confirmButtonColor: "#1d3b66",
          });
        }
      })();
    });
  }

  function handleJoin(item: DashboardSessionItem) {
    if (!item.canJoin) {
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const result = await joinSession(item.bookingId);
          setSummary((current) =>
            current
              ? {
                  ...current,
                  upcomingSessions: current.upcomingSessions.map((sessionItem) =>
                    sessionItem.bookingId === item.bookingId
                      ? {
                          ...sessionItem,
                          sessionStatus: result.sessionStatus,
                        }
                      : sessionItem
                  ),
                }
              : current
          );

          window.open(result.meetingJoinUrl, "_blank", "noopener,noreferrer");
        } catch (error) {
          void Swal.fire({
            icon: "error",
            title: "Unable to join session",
            text: toFriendlyError(error),
            confirmButtonColor: "#1d3b66",
          });
        }
      })();
    });
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="rounded-[1.5rem] bg-primary px-6 py-6 text-on-primary">
          <p className="text-[13px] font-medium text-on-primary/80">Total Earnings</p>
          <h2 className="mt-2 font-headline text-[2.25rem] font-extrabold">
            ${totalEarnings.toFixed(2)}
          </h2>
          <p className="mt-2 text-xs text-on-primary/80">
            Sum of all completed session amounts
          </p>
        </article>

        <article className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <p className="text-[13px] font-medium text-on-surface-variant">Total Hours</p>
          <h3 className="mt-2 font-headline text-[2rem] font-bold text-primary">
            {totalHours.toFixed(2)}
          </h3>
          <p className="mt-2 text-xs text-on-surface-variant">
            Counted from completed sessions only
          </p>
        </article>

        <article className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <p className="text-[13px] font-medium text-on-surface-variant">Average Rating</p>
          <h3 className="mt-2 font-headline text-[2rem] font-bold text-primary">
            {averageRating !== null ? averageRating.toFixed(2) : "--"}
          </h3>
          <p className="mt-2 text-xs text-on-surface-variant">
            {totalReviews > 0
              ? `Based on ${totalReviews} review${totalReviews > 1 ? "s" : ""}`
              : "No ratings yet"}
          </p>
        </article>
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-headline text-[1.55rem] font-bold text-primary">
                Upcoming Sessions
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                The next few confirmed sessions on your schedule.
              </p>
            </div>
            <Link
              href="/dashboard/sessions"
              className="text-sm font-bold text-secondary hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((sessionItem) => (
                <article
                  key={sessionItem.sessionId}
                  className="rounded-2xl border border-outline-variant/14 bg-surface-container-low p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <UserRound className="h-4 w-4" />
                        <span className="font-semibold text-primary">
                          {sessionItem.student.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <CalendarClock className="h-4 w-4" />
                        <span>{formatSessionDate(sessionItem.sessionDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <Clock3 className="h-4 w-4" />
                        <span>
                          {formatSessionTime(sessionItem.startTime, sessionItem.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <ReceiptText className="h-4 w-4" />
                        <span>${sessionItem.priceAtBooking.toFixed(2)}</span>
                      </div>
                    </div>

                    {(sessionItem.canJoin || sessionItem.canCancel) ? (
                      <div className="flex shrink-0 flex-col gap-2 lg:min-w-[170px]">
                        {sessionItem.canJoin ? (
                          <button
                            type="button"
                            onClick={() => handleJoin(sessionItem)}
                            disabled={isPending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Join Session
                          </button>
                        ) : null}

                        {sessionItem.canCancel ? (
                          <button
                            type="button"
                            onClick={() => void handleCancel(sessionItem.bookingId)}
                            disabled={isPending}
                            className="rounded-xl border border-error/20 bg-error-container px-4 py-2.5 text-[13px] font-semibold text-on-error-container transition-colors hover:bg-error-container/85 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel Session
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant">
                No upcoming sessions yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <div>
            <h2 className="font-headline text-[1.55rem] font-bold text-primary">
              Recent Feedback
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Your latest published student reviews.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {recentFeedback.length > 0 ? (
              recentFeedback.map((review) => (
                <article
                  key={review.id}
                  className="space-y-4 rounded-2xl border border-outline-variant/14 bg-surface-container-low p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-black text-on-primary">
                        {getInitials(review.student.name)}
                      </div>
                      <div>
                        <h3 className="font-headline text-sm font-bold text-on-surface">
                          {review.student.name}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                          {new Intl.DateTimeFormat("en-BD", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(review.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-secondary">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm italic text-on-surface-variant">
                    &quot;{review.comment || "Great learning experience."}&quot;
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant">
                Reviews from students will appear here after completed sessions receive feedback.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
