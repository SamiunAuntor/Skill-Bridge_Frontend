"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { getMySessions, BookingApiError } from "@/lib/booking-api";
import { useAppAuthSession } from "@/lib/auth";
import { getRoleDashboardPath } from "@/lib/dashboard-routes";
import { DashboardSessionItem } from "@/types/tutor";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import DashboardSessionCard from "@/Components/Dashboard/DashboardSessionCard";

function toFriendlyError(error: unknown): string {
  if (error instanceof BookingApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load your dashboard right now.";
}

export default function StudentDashboardHome() {
  const { data: session, isPending } = useAppAuthSession();
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

  if (isPending || loading) {
    return <DashboardPageLoader label="Loading student dashboard..." />;
  }

  const recentSessions = stats.upcoming.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="rounded-[1.5rem] bg-primary px-6 py-6 text-on-primary">
          <p className="text-[13px] font-medium text-on-primary/80">Upcoming Sessions</p>
          <h2 className="mt-2 font-headline text-[2.4rem] font-extrabold">
            {stats.upcoming.length}
          </h2>
        </article>

        <article className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <p className="text-[13px] font-medium text-on-surface-variant">Completed Sessions</p>
          <h3 className="mt-2 font-headline text-[2rem] font-bold text-primary">
            {stats.completed.length}
          </h3>
        </article>

        <article className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
          <p className="text-[13px] font-medium text-on-surface-variant">Total Session Value</p>
          <h3 className="mt-2 font-headline text-[2rem] font-bold text-primary">
            {`$${stats.totalSpent.toFixed(2)}`}
          </h3>
        </article>
      </section>

      <section className="rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-2xl font-bold text-primary">
              Upcoming Sessions
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              A quick overview of your next confirmed sessions.
            </p>
          </div>
          <Link
            href={getRoleDashboardPath("student", "sessions")}
            className="text-sm font-bold text-secondary hover:underline"
          >
            View all sessions
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {recentSessions.length > 0 ? (
            recentSessions.map((item) => (
              <DashboardSessionCard
                key={item.sessionId}
                item={item}
                role="student"
                variant="compact"
              />
            ))
          ) : (
            <div className="rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant xl:col-span-3">
              No upcoming sessions . Find a tutor, choose an available slot, and complete bookings.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
