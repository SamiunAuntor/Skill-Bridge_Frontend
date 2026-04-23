"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAdminDashboardData, AdminApiError } from "@/lib/admin-api";
import type { AdminDashboardResponse } from "@/types/admin";
import {
  AdminCard,
  AdminErrorMessage,
  AdminLoadingMessage,
  AdminStatCard,
} from "@/Components/Admin/AdminUi";

const chartPalette = {
  primary: "#1d3b66",
  primarySoft: "#c6d7f3",
  secondary: "#2f6e64",
  secondarySoft: "#bff4e6",
  accent: "#7b6ef6",
  accentSoft: "#d8d3ff",
  warning: "#d97706",
  warningSoft: "#fde3b3",
  danger: "#b42318",
  dangerSoft: "#f7d3cf",
};

const bookingStatusColors: Record<string, string> = {
  confirmed: chartPalette.primary,
  completed: chartPalette.secondary,
  cancelled: chartPalette.danger,
  no_show: chartPalette.warning,
};

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function AdminChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <AdminCard>
      <div className="mb-5">
        <h2 className="font-headline text-xl font-bold text-primary">{title}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
      </div>
      <div className="h-72">{children}</div>
    </AdminCard>
  );
}

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

  const bookingStatusChartData = useMemo(
    () =>
      data?.charts.bookingStatusBreakdown.map((item) => ({
        ...item,
        label: formatStatusLabel(item.status),
      })) ?? [],
    [data]
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          Platform overview
        </h1>
      </header>

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
            <AdminStatCard
              label="Categories"
              value={`${data.stats.activeCategories}/${data.stats.totalCategories}`}
              helper={`${data.stats.inactiveCategories} inactive`}
              href="/dashboard/admin/categories"
            />
            <AdminStatCard
              label="Subjects"
              value={`${data.stats.activeSubjects}/${data.stats.totalSubjects}`}
              helper={`${data.stats.inactiveSubjects} inactive`}
              href="/dashboard/admin/subjects"
            />
            <AdminStatCard
              label="Degrees"
              value={`${data.stats.activeDegrees}/${data.stats.totalDegrees}`}
              helper={`${data.stats.inactiveDegrees} inactive`}
              href="/dashboard/admin/degrees"
            />
            <AdminStatCard label="Banned Users" value={data.stats.bannedUsers} href="/dashboard/admin/users" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AdminChartCard
              title="Student registration trend"
              subtitle="Student sign-ups over the last 6 months."
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.studentRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8e2ef" />
                  <XAxis dataKey="label" stroke="#5f6d7f" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="#5f6d7f" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={chartPalette.primary}
                    fill={chartPalette.primarySoft}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </AdminChartCard>

            <AdminChartCard
              title="Tutor registration trend"
              subtitle="Tutor sign-ups over the last 6 months."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.tutorRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8e2ef" />
                  <XAxis dataKey="label" stroke="#5f6d7f" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="#5f6d7f" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={chartPalette.secondary}
                    strokeWidth={3}
                    dot={{ r: 4, fill: chartPalette.secondary }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </AdminChartCard>

            <AdminChartCard
              title="Booking activity trend"
              subtitle="New bookings created over the last 6 months."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.bookingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8e2ef" />
                  <XAxis dataKey="label" stroke="#5f6d7f" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="#5f6d7f" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} fill={chartPalette.accent} />
                </BarChart>
              </ResponsiveContainer>
            </AdminChartCard>

            <AdminChartCard
              title="Booking status breakdown"
              subtitle="Current booking distribution across platform states."
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusChartData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {bookingStatusChartData.map((item) => (
                      <Cell
                        key={item.status}
                        fill={bookingStatusColors[item.status] ?? chartPalette.primary}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </AdminChartCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
