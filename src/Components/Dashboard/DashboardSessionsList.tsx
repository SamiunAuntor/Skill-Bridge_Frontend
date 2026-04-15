"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Swal from "sweetalert2";
import {
  CalendarClock,
  CircleAlert,
  Clock3,
  ExternalLink,
  UserRound,
  Video,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  BookingApiError,
  cancelBooking,
  getMySessions,
  joinSession,
} from "@/lib/booking-api";
import { DashboardSessionItem } from "@/types/tutor";
import { UserRole } from "@/types/auth";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTimeRange(start: string, end: string): string {
  const formatter = new Intl.DateTimeFormat("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
}

function getCounterpartyLabel(role: UserRole, session: DashboardSessionItem): string {
  return role === "tutor" ? session.student.name : session.tutor.name;
}

function getStatusClasses(status: DashboardSessionItem["sessionStatus"]): string {
  switch (status) {
    case "scheduled":
      return "bg-primary-fixed text-on-primary-fixed-variant";
    case "ongoing":
      return "bg-secondary-container text-on-secondary-container";
    case "completed":
      return "bg-surface-container-high text-on-surface-variant";
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
  const { data: session } = authClient.useSession();
  const [sessions, setSessions] = useState<DashboardSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const role = ((session?.user.role as UserRole | undefined) ?? "student") as UserRole;

  const grouped = useMemo(() => {
    const upcoming = sessions.filter(
      (item) => item.sessionStatus === "scheduled" || item.sessionStatus === "ongoing"
    );
    const completed = sessions.filter((item) => item.sessionStatus === "completed");
    const cancelled = sessions.filter((item) => item.sessionStatus === "cancelled");

    return { upcoming, completed, cancelled };
  }, [sessions]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setLoading(true);
        const result = await getMySessions();

        if (!cancelled) {
          setSessions(result.sessions);
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
  }, []);

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

  function renderSection(title: string, items: DashboardSessionItem[]) {
    return (
      <section className="space-y-4 rounded-[1.75rem] border border-outline-variant/14 bg-surface-container-lowest p-6 shadow-[0px_18px_40px_rgba(0,51,88,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-headline text-xl font-bold text-primary">{title}</h2>
          <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface-variant">
            {items.length}
          </span>
        </div>

        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.sessionId}
                className="rounded-2xl border border-outline-variant/16 bg-surface-container-low p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${getStatusClasses(item.sessionStatus)}`}>
                        {item.sessionStatus}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {formatDate(item.sessionDate)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <UserRound className="h-4 w-4" />
                        <span>{role === "tutor" ? "Student" : "Tutor"}:</span>
                        <span className="font-semibold text-primary">
                          {getCounterpartyLabel(role, item)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <CalendarClock className="h-4 w-4" />
                        <span>{formatTimeRange(item.startTime, item.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <Clock3 className="h-4 w-4" />
                        <span>Amount: ${item.priceAtBooking.toFixed(2)}</span>
                      </div>
                      {item.meetingProvider === "zoom" ? (
                        <div className="rounded-xl border border-outline-variant/16 bg-surface-container px-3 py-3 text-xs text-on-surface-variant">
                          <div className="flex items-center gap-2 font-semibold text-primary">
                            <Video className="h-4 w-4" />
                            Zoom Meeting
                          </div>
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
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {item.canJoin ? (
                      <button
                        type="button"
                        onClick={() => handleJoin(item)}
                        disabled={isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="rounded-xl border border-error/20 bg-error-container px-4 py-2.5 text-sm font-semibold text-on-error-container transition-colors hover:bg-error-container/85 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel Session
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-surface-container p-5 text-sm text-on-surface-variant">
            <CircleAlert className="h-4 w-4" />
            No sessions in this section yet.
          </div>
        )}
      </section>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-outline-variant/14 bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-[0px_18px_40px_rgba(0,51,88,0.08)]">
        Loading sessions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderSection("Upcoming Sessions", grouped.upcoming)}
      {renderSection("Completed Sessions", grouped.completed)}
      {renderSection("Cancelled Sessions", grouped.cancelled)}
    </div>
  );
}
