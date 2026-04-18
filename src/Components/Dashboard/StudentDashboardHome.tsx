"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { CalendarClock, Clock3, ReceiptText, UserRound } from "lucide-react";
import { getMySessions, BookingApiError } from "@/lib/booking-api";
import { useAppAuthSession } from "@/lib/auth";
import { DashboardSessionItem } from "@/types/tutor";

function toFriendlyError(error: unknown): string {
  if (error instanceof BookingApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load your dashboard right now.";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function formatTimeRange(start: string, end: string): string {
  const formatter = new Intl.DateTimeFormat("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
}

export default function StudentDashboardHome() {
  const { data: session } = useAppAuthSession();
  const [sessions, setSessions] = useState<DashboardSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const role = session?.user?.role;

  useEffect(() => {
    if (role && role !== "student") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const result = await getMySessions();
        if (!cancelled) {
          setSessions(result.sessions);
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

  const stats = useMemo(() => {
    const upcoming = sessions.filter(
      (item) => item.sessionStatus === "scheduled" || item.sessionStatus === "ongoing"
    );
    const completed = sessions.filter((item) => item.sessionStatus === "completed");
    const totalSpent = sessions.reduce(
      (sum, item) => sum + item.priceAtBooking,
      0
    );

    return {
      upcoming,
      completed,
      totalSpent,
    };
  }, [sessions]);

  if (role && role !== "student") {
    return null;
  }

  const recentSessions = stats.upcoming.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="rounded-[1.5rem] bg-primary px-6 py-6 text-on-primary">
          <p className="text-[13px] font-medium text-on-primary/80">Upcoming Sessions</p>
          <h2 className="mt-2 font-headline text-[2.4rem] font-extrabold">
            {loading ? "--" : stats.upcoming.length}
          </h2>
        </article>

        <article className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <p className="text-[13px] font-medium text-on-surface-variant">Completed Sessions</p>
          <h3 className="mt-2 font-headline text-[2rem] font-bold text-primary">
            {loading ? "--" : stats.completed.length}
          </h3>
        </article>

        <article className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <p className="text-[13px] font-medium text-on-surface-variant">Total Session Value</p>
          <h3 className="mt-2 font-headline text-[2rem] font-bold text-primary">
            {loading ? "--" : `$${stats.totalSpent.toFixed(2)}`}
          </h3>
        </article>
      </section>

      <section className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-2xl font-bold text-primary">
              Recent Sessions
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              A quick overview of your next sessions.
            </p>
          </div>
          <Link
            href="/dashboard/sessions"
            className="text-sm font-bold text-secondary hover:underline"
          >
            View all sessions
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {recentSessions.length > 0 ? (
            recentSessions.map((item) => (
              <article
                key={item.sessionId}
                className="rounded-2xl border border-outline-variant/14 bg-surface-container-low p-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <UserRound className="h-4 w-4" />
                    <span className="font-semibold text-primary">{item.tutor.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <CalendarClock className="h-4 w-4" />
                    <span>{formatDate(item.sessionDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Clock3 className="h-4 w-4" />
                    <span>{formatTimeRange(item.startTime, item.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <ReceiptText className="h-4 w-4" />
                    <span>${item.priceAtBooking.toFixed(2)}</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant">
              No recent sessions yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
