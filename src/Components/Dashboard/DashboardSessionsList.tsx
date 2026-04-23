"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import {
  CircleAlert,
  ExternalLink,
  Video,
  Search,
} from "lucide-react";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import { useAppAuthSession } from "@/lib/auth";
import { formatLongDate, formatTimeRange } from "@/lib/format/date";
import {
  BookingApiError,
  cancelBooking,
  createReview,
  getMySessions,
  joinSession,
} from "@/lib/booking-api";
import {
  DashboardSessionItem,
  DashboardSessionSortOption,
} from "@/types/tutor";
import { UserRole } from "@/types/auth";

function getCounterpartyLabel(role: UserRole, session: DashboardSessionItem): string {
  return role === "tutor" ? session.student.name : session.tutor.name;
}

const sessionSortOptions: DashboardSessionSortOption[] = [
  "time_asc",
  "time_desc",
  "amount_high",
  "amount_low",
  "upcoming_only",
  "completed_only",
  "cancelled_only",
];

function getStatusClasses(status: DashboardSessionItem["sessionStatus"]): string {
  switch (status) {
    case "scheduled":
      return "bg-primary-fixed text-on-primary-fixed-variant";
    case "ongoing":
      return "bg-secondary-container text-on-secondary-container";
    case "completed":
      return "bg-[#d8f6e6] text-[#1f6a43] dark:bg-[#153828] dark:text-[#9ee2ba]";
    case "cancelled":
      return "bg-error-container text-on-error-container";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

function toFriendlyError(error: unknown): string {
  if (error instanceof BookingApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to process this request right now.";
}

export default function DashboardSessionsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useAppAuthSession();
  const [sessions, setSessions] = useState<DashboardSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });

  const role = ((session?.user.role as UserRole | undefined) ?? "student") as UserRole;
  const searchQuery = searchParams.get("q") ?? "";
  const sortBy = sessionSortOptions.includes(
    (searchParams.get("sortBy") as DashboardSessionSortOption | null) ?? "time_asc"
  )
    ? ((searchParams.get("sortBy") as DashboardSessionSortOption | null) ?? "time_asc")
    : "time_asc";
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setLoading(true);
        const result = await getMySessions({
          search: searchQuery,
          sortBy,
        });

        if (!cancelled) {
          setSessions(result.sessions);
          setStats(result.stats);
        }
      } catch (error) {
        if (!cancelled) {
          await Swal.fire({
            icon: "error",
            title: "Unable to load sessions",
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
  }, [searchQuery, sortBy]);

  function updateQueryParams(nextValues: {
    search?: string;
    sortBy?: DashboardSessionSortOption;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValues.search !== undefined) {
      if (nextValues.search.trim()) {
        params.set("q", nextValues.search.trim());
      } else {
        params.delete("q");
      }
    }

    if (nextValues.sortBy !== undefined) {
      if (nextValues.sortBy === "time_asc") {
        params.delete("sortBy");
      } else {
        params.set("sortBy", nextValues.sortBy);
      }
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }

  function handleSearchSubmit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    updateQueryParams({
      search: searchInput,
    });
  }

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
          setSessions((current) =>
            current.map((item) =>
              item.bookingId === bookingId
                ? {
                    ...item,
                    bookingStatus: "cancelled",
                    sessionStatus: "cancelled",
                    canCancel: false,
                  }
                : item
            )
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
          setSessions((current) =>
            current.map((sessionItem) =>
              sessionItem.bookingId === item.bookingId
                ? {
                    ...sessionItem,
                    sessionStatus: result.sessionStatus,
                  }
                : sessionItem
            )
          );

          window.open(result.meetingJoinUrl, "_blank", "noopener,noreferrer");
        } catch (error) {
          await Swal.fire({
            icon: "error",
            title: "Unable to join session",
            text: toFriendlyError(error),
            confirmButtonColor: "#1d3b66",
          });
        }
      })();
    });
  }

  async function handleLeaveReview(item: DashboardSessionItem) {
    const counterpart = getCounterpartyLabel(role, item);

    const result = await Swal.fire({
      title: "Leave a review",
      html: `
        <div style="display:flex;flex-direction:column;gap:12px;text-align:left;">
          <label style="font-size:13px;font-weight:600;color:#1d3b66;">Rating</label>
          <select id="review-rating" class="swal2-select" style="margin:0;width:100%;">
            <option value="5" selected>5 - Excellent</option>
            <option value="4">4 - Very good</option>
            <option value="3">3 - Good</option>
            <option value="2">2 - Fair</option>
            <option value="1">1 - Poor</option>
          </select>
          <label style="font-size:13px;font-weight:600;color:#1d3b66;">Comment (optional, max 1000 characters)</label>
          <textarea id="review-comment" class="swal2-textarea" maxlength="1000" placeholder="Share a few words about your learning experience with ${counterpart}." style="margin:0;width:100%;min-height:120px;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Submit Review",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#1d3b66",
      cancelButtonColor: "#7b8794",
      focusConfirm: false,
      preConfirm: async () => {
        const ratingValue = (document.getElementById("review-rating") as HTMLSelectElement | null)?.value;
        const commentValue = (document.getElementById("review-comment") as HTMLTextAreaElement | null)?.value ?? "";
        const rating = Number(ratingValue);

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          Swal.showValidationMessage("Please select a rating between 1 and 5.");
          return null;
        }

        if (commentValue.trim().length > 1000) {
          Swal.showValidationMessage("Review comment must be 1000 characters or fewer.");
          return null;
        }

        try {
          return await createReview({
            bookingId: item.bookingId,
            rating,
            comment: commentValue.trim() || undefined,
          });
        } catch (error) {
          Swal.showValidationMessage(toFriendlyError(error));
          return null;
        }
      },
    });

    if (!result.isConfirmed || !result.value) {
      return;
    }

    setSessions((current) =>
      current.map((sessionItem) =>
        sessionItem.bookingId === item.bookingId
          ? {
              ...sessionItem,
              reviewId: result.value.review.id,
              canLeaveReview: false,
            }
          : sessionItem
      )
    );

    await Swal.fire({
      icon: "success",
      title: "Review submitted",
      text: "Thanks for sharing your feedback.",
      confirmButtonColor: "#1d3b66",
    });
  }

  if (loading) {
    return <DashboardPageLoader label="Loading sessions..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Upcoming Sessions", count: stats.upcoming },
          { label: "Completed Sessions", count: stats.completed },
          { label: "Cancelled Sessions", count: stats.cancelled },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-outline-variant/16 bg-surface-container px-5 py-4 text-center"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              {stat.label}
            </p>
            <p className="mt-2 font-headline text-3xl font-black text-primary">
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      <section className="space-y-4 rounded-[1.5rem] border border-outline-variant/14 bg-surface-container-lowest p-5 shadow-[0px_18px_40px_rgba(0,51,88,0.08)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={`Search by ${role === "tutor" ? "student" : "tutor"} name, amount, or time`}
                className="w-full rounded-2xl border border-outline-variant/20 bg-surface px-11 py-3 text-[13px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-[13px] font-semibold text-on-primary transition hover:bg-primary/90 sm:min-w-[140px]"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </form>

          <div className="w-full lg:w-auto">
            <select
              value={sortBy}
              onChange={(event) =>
                updateQueryParams({
                  sortBy: event.target.value as DashboardSessionSortOption,
                })
              }
              className="w-full rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3 text-[13px] font-medium text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 lg:min-w-[230px]"
            >
              <option value="time_asc">Time ascending</option>
              <option value="time_desc">Time descending</option>
              <option value="amount_high">Amount high to low</option>
              <option value="amount_low">Amount low to high</option>
              <option value="upcoming_only">Upcoming only</option>
              <option value="completed_only">Completed only</option>
              <option value="cancelled_only">Cancelled only</option>
            </select>
          </div>
        </div>

        {sessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {sessions.map((item) => (
              <article
                key={item.sessionId}
                className="rounded-[1.35rem] border border-outline-variant/18 bg-surface-container-low p-4 shadow-[0px_10px_24px_rgba(0,51,88,0.06)]"
              >
                <div className="flex h-full flex-col space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                        Date
                      </p>
                      <p className="mt-1 text-[14px] font-semibold text-primary">
                        {formatLongDate(item.sessionDate)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${getStatusClasses(
                        item.sessionStatus
                      )}`}
                    >
                      {item.sessionStatus}
                    </span>
                  </div>

                  <div className="space-y-3 border-t border-outline-variant/14 pt-3">
                    <div className="text-[13px] text-on-surface-variant">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface">
                          {role === "tutor" ? "Student Name" : "Tutor Name"}
                        </p>
                        <p className="mt-0.5 font-semibold text-primary">
                          {getCounterpartyLabel(role, item)}
                        </p>
                      </div>
                    </div>

                    <div className="text-[13px] text-on-surface-variant">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface">
                          Time
                        </p>
                        <p className="mt-0.5 font-medium text-primary">
                          {formatTimeRange(item.startTime, item.endTime)}
                        </p>
                      </div>
                    </div>

                    <div className="text-[13px] text-on-surface-variant">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface">
                          Total Amount
                        </p>
                        <p className="mt-0.5 font-semibold text-primary">
                          ${item.priceAtBooking.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {item.meetingProvider === "zoom" ? (
                    <div className="border-t border-outline-variant/14 pt-3">
                      <div className="rounded-xl border border-outline-variant/16 bg-surface-container px-3 py-3 text-[11px] text-on-surface-variant">
                      <div className="font-semibold text-primary">Zoom Meeting</div>
                      <div className="mt-2 space-y-1">
                        <p>
                          Meeting ID:{" "}
                          <span className="font-semibold text-primary">
                            {item.meetingId ?? "Pending"}
                          </span>
                        </p>
                        <p>
                          Passcode:{" "}
                          <span className="font-semibold text-primary">
                            {item.meetingPassword ?? "Not required"}
                          </span>
                        </p>
                      </div>
                      </div>
                    </div>
                  ) : null}

                  {(item.canJoin || item.canCancel) ? (
                    <div className="mt-auto border-t border-outline-variant/14 pt-3">
                      <div className="flex flex-col gap-2">
                        {item.canJoin ? (
                          <button
                            type="button"
                            onClick={() => handleJoin(item)}
                            disabled={isPending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Join Session
                          </button>
                        ) : null}

                        {item.canCancel ? (
                          <button
                            type="button"
                            onClick={() => void handleCancel(item.bookingId)}
                            disabled={isPending}
                            className="rounded-xl border border-error/20 bg-error-container px-4 py-2.5 text-[13px] font-semibold text-on-error-container transition-colors hover:bg-error-container/85 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel Session
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {role === "student" && item.canLeaveReview ? (
                    <div className="mt-auto border-t border-outline-variant/14 pt-3">
                      <button
                        type="button"
                        onClick={() => void handleLeaveReview(item)}
                        disabled={isPending}
                        className="w-full rounded-xl border border-secondary/20 bg-secondary-container px-4 py-2.5 text-[13px] font-semibold text-on-secondary-container transition-colors hover:bg-secondary-container/85 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Leave Review
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-surface-container p-4 text-[13px] text-on-surface-variant">
            <CircleAlert className="h-4 w-4" />
            No sessions match this view. Clear the search or switch the status filter to see more sessions.
          </div>
        )}
      </section>
    </div>
  );
}
