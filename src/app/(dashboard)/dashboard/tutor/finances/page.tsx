"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { CalendarClock, CircleDollarSign, Clock3, ReceiptText } from "lucide-react";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import { BookingApiError, getMySessions } from "@/lib/booking-api";
import { getRoleDashboardPath } from "@/lib/dashboard-routes";
import type { DashboardSessionItem } from "@/types/tutor";

function toFriendlyError(error: unknown): string {
  if (error instanceof BookingApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "We couldn't load your finance summary right now.";
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function calculateHours(start: string, end: string): number {
  return Math.max(
    0,
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60)
  );
}

export default function TutorDashboardFinancesPage() {
  const [sessions, setSessions] = useState<DashboardSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFinances() {
      try {
        const result = await getMySessions({ sortBy: "time_desc" });

        if (!cancelled) {
          setSessions(result.sessions);
        }
      } catch (error) {
        if (!cancelled) {
          await Swal.fire({
            icon: "error",
            title: "Finances unavailable",
            text: toFriendlyError(error),
            confirmButtonColor: "#1d3b66",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadFinances();

    return () => {
      cancelled = true;
    };
  }, []);

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.sessionStatus === "completed"),
    [sessions]
  );

  const upcomingSessions = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.sessionStatus === "scheduled" || session.sessionStatus === "ongoing"
      ),
    [sessions]
  );

  const totals = useMemo(() => {
    return completedSessions.reduce(
      (accumulator, session) => {
        accumulator.earned += session.priceAtBooking;
        accumulator.hours += calculateHours(session.startTime, session.endTime);
        return accumulator;
      },
      { earned: 0, hours: 0 }
    );
  }, [completedSessions]);

  if (isLoading) {
    return <DashboardPageLoader label="Loading finances..." />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          Finances
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          Track completed-session earnings now. Payouts, refunds, and gateway
          settlement reporting can plug into this page later.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="rounded-[1.5rem] bg-primary px-6 py-6 text-on-primary">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="h-5 w-5" />
            <p className="text-[13px] font-medium text-on-primary/80">
              Completed Earnings
            </p>
          </div>
          <h2 className="mt-3 font-headline text-[2.25rem] font-extrabold">
            {formatMoney(totals.earned)}
          </h2>
          <p className="mt-2 text-xs text-on-primary/80">
            Based on completed sessions only.
          </p>
        </article>

        <article className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <ReceiptText className="h-5 w-5" />
            <p className="text-[13px] font-medium">Completed Sessions</p>
          </div>
          <h3 className="mt-3 font-headline text-[2rem] font-bold text-primary">
            {completedSessions.length}
          </h3>
          <p className="mt-2 text-xs text-on-surface-variant">
            Sessions eligible for earnings summary.
          </p>
        </article>

        <article className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <Clock3 className="h-5 w-5" />
            <p className="text-[13px] font-medium">Hours Taught</p>
          </div>
          <h3 className="mt-3 font-headline text-[2rem] font-bold text-primary">
            {totals.hours.toFixed(2)}
          </h3>
          <p className="mt-2 text-xs text-on-surface-variant">
            {upcomingSessions.length} upcoming session
            {upcomingSessions.length === 1 ? "" : "s"} not counted yet.
          </p>
        </article>
      </section>

      <section className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-headline text-2xl font-bold text-primary">
              Completed session ledger
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              A simple earning record until the payout module is added.
            </p>
          </div>
          <Link
            href={getRoleDashboardPath("tutor", "sessions")}
            className="text-sm font-bold text-secondary hover:underline"
          >
            View sessions
          </Link>
        </div>

        {completedSessions.length > 0 ? (
          <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-outline-variant/20 pb-2">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-surface-container-low">
                <tr className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  <th className="border border-outline-variant/20 px-4 py-4">Student</th>
                  <th className="border border-outline-variant/20 px-4 py-4">Date</th>
                  <th className="border border-outline-variant/20 px-4 py-4">Hours</th>
                  <th className="border border-outline-variant/20 px-4 py-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {completedSessions.map((session) => (
                  <tr key={session.sessionId} className="bg-surface">
                    <td className="border border-outline-variant/20 px-4 py-4 font-semibold text-primary">
                      {session.student.name}
                    </td>
                    <td className="border border-outline-variant/20 px-4 py-4 text-on-surface-variant">
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        {formatDate(session.sessionDate)}
                      </span>
                    </td>
                    <td className="border border-outline-variant/20 px-4 py-4 text-on-surface-variant">
                      {calculateHours(session.startTime, session.endTime).toFixed(2)}
                    </td>
                    <td className="border border-outline-variant/20 px-4 py-4 font-semibold text-primary">
                      {formatMoney(session.priceAtBooking)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface-container-low p-6 text-sm text-on-surface-variant">
            No completed sessions yet. Earnings will appear here after sessions
            are completed.
          </div>
        )}
      </section>
    </div>
  );
}
