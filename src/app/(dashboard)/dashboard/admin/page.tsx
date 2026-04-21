"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminDashboardData, AdminApiError } from "@/lib/admin-api";
import type { AdminDashboardResponse } from "@/types/admin";
import {
  AdminCard,
  AdminErrorMessage,
  AdminLoadingMessage,
  AdminPageHeader,
  AdminStatCard,
} from "@/Components/Dashboard/AdminUi";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getAdminDashboardData();

        if (!cancelled) {
          setData(result);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof AdminApiError
              ? error.message
              : "We couldn't load the admin dashboard right now."
          );
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Admin Control Center"
        title="Platform overview"
        description="Monitor the health of the tutoring marketplace and jump into the core moderation and catalog-management areas."
      />

      {errorMessage ? <AdminErrorMessage message={errorMessage} /> : null}

      {!data && !errorMessage ? (
        <AdminLoadingMessage label="Loading admin dashboard..." />
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Total Users" value={data.stats.totalUsers} href="/dashboard/admin/users" />
            <AdminStatCard label="Students" value={data.stats.totalStudents} href="/dashboard/admin/users" />
            <AdminStatCard label="Tutors" value={data.stats.totalTutors} href="/dashboard/admin/users" />
            <AdminStatCard label="Bookings" value={data.stats.totalBookings} href="/dashboard/admin/bookings" />
            <AdminStatCard label="Categories" value={data.stats.totalCategories} href="/dashboard/admin/categories" />
            <AdminStatCard label="Subjects" value={data.stats.totalSubjects} href="/dashboard/admin/subjects" />
            <AdminStatCard label="Degrees" value={data.stats.totalDegrees} href="/dashboard/admin/degrees" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <AdminCard title="Operational focus">
              <div className="space-y-3 text-sm leading-relaxed text-on-surface-variant">
                <p>Use the user table to ban or unban tutor and student accounts.</p>
                <p>Use bookings to monitor platform activity and keep payment-related fields visible for the upcoming gateway integration.</p>
                <p>Use categories, subjects, and degrees as the master-data backbone that powers tutor profile setup and public subject discovery.</p>
              </div>
            </AdminCard>

            <AdminCard title="Quick links">
              <div className="grid gap-3">
                {[
                  { href: "/dashboard/admin/users", label: "Manage users" },
                  { href: "/dashboard/admin/bookings", label: "Review bookings" },
                  { href: "/dashboard/admin/categories", label: "Manage categories" },
                  { href: "/dashboard/admin/subjects", label: "Manage subjects" },
                  { href: "/dashboard/admin/degrees", label: "Manage degrees" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary-fixed"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </AdminCard>

            <AdminCard title="Next expansion ready">
              <div className="space-y-3 text-sm leading-relaxed text-on-surface-variant">
                <p>The current schema already keeps booking payment fields ready for gateway integration.</p>
                <p>Once payments land, this dashboard can add revenue cards, payout states, and settlement-level oversight without changing the admin route structure.</p>
              </div>
            </AdminCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
