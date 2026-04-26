"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { CircleAlert, Search } from "lucide-react";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import { useAppAuthSession } from "@/lib/auth";
import {
  BookingApiError,
  cancelBooking,
  createReview,
  getMySessions,
  getReviewById,
  joinSession,
  updateReview,
} from "@/lib/booking-api";
import {
  DashboardSessionItem,
  DashboardSessionSortOption,
  SessionReview,
} from "@/types/tutor";
import { UserRole } from "@/types/auth";
import DashboardSessionCard from "@/Components/Dashboard/DashboardSessionCard";
import SessionReviewModal from "@/Components/Reviews/SessionReviewModal";

const sessionSortOptions: DashboardSessionSortOption[] = [
  "time_asc",
  "time_desc",
  "amount_high",
  "amount_low",
  "upcoming_only",
  "completed_only",
  "cancelled_only",
];

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
  const [isReviewSubmitting, startReviewTransition] = useTransition();
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    sessionItem: DashboardSessionItem | null;
    review: SessionReview | null;
    errorMessage: string | null;
  }>({
    isOpen: false,
    mode: "create",
    sessionItem: null,
    review: null,
    errorMessage: null,
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

  function closeReviewModal() {
    setReviewModalState({
      isOpen: false,
      mode: "create",
      sessionItem: null,
      review: null,
      errorMessage: null,
    });
  }

  async function openCreateReview(item: DashboardSessionItem) {
    setReviewModalState({
      isOpen: true,
      mode: "create",
      sessionItem: item,
      review: null,
      errorMessage: null,
    });
  }

  async function openExistingReview(
    item: DashboardSessionItem,
    mode: "edit" | "view"
  ) {
    if (!item.reviewId) {
      return;
    }

    try {
      const result = await getReviewById(item.reviewId);
      setReviewModalState({
        isOpen: true,
        mode,
        sessionItem: item,
        review: result.review,
        errorMessage: null,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: mode === "view" ? "Unable to load review" : "Unable to edit review",
        text: toFriendlyError(error),
        confirmButtonColor: "#1d3b66",
      });
    }
  }

  function handleReviewSubmit(payload: { rating: number; comment: string }) {
    const currentSessionItem = reviewModalState.sessionItem;
    const currentMode = reviewModalState.mode;
    const currentReview = reviewModalState.review;

    if (!currentSessionItem) {
      return;
    }

    startReviewTransition(() => {
      void (async () => {
        try {
          if (currentMode === "edit" && currentReview) {
            const result = await updateReview(currentReview.id, payload);

            setReviewModalState((current) => ({
              ...current,
              review: result.review,
              errorMessage: null,
            }));

            await Swal.fire({
              icon: "success",
              title: "Review updated",
              text: "Your feedback has been updated successfully.",
              confirmButtonColor: "#1d3b66",
            });
          } else {
            const result = await createReview({
              bookingId: currentSessionItem.bookingId,
              rating: payload.rating,
              comment: payload.comment,
            });

            setSessions((current) =>
              current.map((sessionItem) =>
                sessionItem.bookingId === currentSessionItem.bookingId
                  ? {
                      ...sessionItem,
                      reviewId: result.review.id,
                      canLeaveReview: false,
                    }
                  : sessionItem
              )
            );

            setReviewModalState((current) => ({
              ...current,
              review: result.review,
              mode: "edit",
              errorMessage: null,
            }));

            await Swal.fire({
              icon: "success",
              title: "Review submitted",
              text: "Thanks for sharing your feedback.",
              confirmButtonColor: "#1d3b66",
            });
          }

          closeReviewModal();
        } catch (error) {
          setReviewModalState((current) => ({
            ...current,
            errorMessage: toFriendlyError(error),
          }));
        }
      })();
    });
  }

  if (loading) {
    return <DashboardPageLoader label="Loading sessions..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {sessions.map((item) => (
              <DashboardSessionCard
                key={item.sessionId}
                item={item}
                role={role}
                variant="full"
                isPending={isPending}
                onJoin={handleJoin}
                onCancel={(bookingId) => void handleCancel(bookingId)}
                reviewActionLabel={
                  role === "student"
                    ? item.reviewId
                      ? "Edit Review"
                      : item.canLeaveReview
                      ? "Leave Review"
                      : undefined
                    : item.reviewId
                    ? "View Review"
                    : undefined
                }
                onReviewAction={(sessionItem) =>
                  void (
                    role === "student"
                      ? sessionItem.reviewId
                        ? openExistingReview(sessionItem, "edit")
                        : openCreateReview(sessionItem)
                      : openExistingReview(sessionItem, "view")
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-surface-container p-4 text-[13px] text-on-surface-variant">
            <CircleAlert className="h-4 w-4" />
            No sessions match this view. Clear the search or switch the status filter to see more sessions.
          </div>
        )}
      </section>

      <SessionReviewModal
        key={`${reviewModalState.mode}-${reviewModalState.review?.id ?? reviewModalState.sessionItem?.bookingId ?? "empty"}`}
        isOpen={reviewModalState.isOpen}
        mode={reviewModalState.mode}
        review={reviewModalState.review}
        counterpartName={
          reviewModalState.sessionItem
            ? role === "student"
              ? reviewModalState.sessionItem.tutor.name
              : reviewModalState.sessionItem.student.name
            : "this session"
        }
        isSubmitting={isReviewSubmitting}
        errorMessage={reviewModalState.errorMessage}
        onClose={closeReviewModal}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
