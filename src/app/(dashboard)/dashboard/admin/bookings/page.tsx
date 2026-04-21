"use client";

import { useEffect, useState } from "react";
import { AdminApiError, getAdminBookings } from "@/lib/admin-api";
import type { AdminBookingsResponse, AdminBookingSortOption } from "@/types/admin";
import {
  AdminCard,
  AdminErrorMessage,
  AdminLoadingMessage,
  AdminPageHeader,
  AdminPaginationControls,
  AdminTableEmpty,
  formatAdminCurrency,
  formatAdminDateTime,
} from "@/Components/Dashboard/AdminUi";

const defaultQuery = {
  q: "",
  status: "all",
  paymentStatus: "all",
  sortBy: "session_desc" as AdminBookingSortOption,
  page: 1,
  limit: 10,
};

export default function AdminBookingsPage() {
  const [query, setQuery] = useState(defaultQuery);
  const [data, setData] = useState<AdminBookingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      try {
        const result = await getAdminBookings({
          q: query.q || undefined,
          status:
            query.status === "all"
              ? undefined
              : (query.status as "confirmed" | "completed" | "cancelled" | "no_show"),
          paymentStatus:
            query.paymentStatus === "all"
              ? undefined
              : (query.paymentStatus as "pending" | "paid" | "failed"),
          sortBy: query.sortBy,
          page: query.page,
          limit: query.limit,
        });

        if (!cancelled) {
          setData(result);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof AdminApiError
              ? error.message
              : "We couldn't load bookings right now."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Admin Bookings"
        title="Monitor every session booking"
        description="Track booking lifecycle, session timing, and payment status in one table so the upcoming payment gateway work has the right operational home."
      />

      <AdminCard title="Filters">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <input
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none"
            value={query.q}
            onChange={(event) =>
              setQuery((current) => ({ ...current, q: event.target.value, page: 1 }))
            }
            placeholder="Search by tutor or student"
          />
          <select
            className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
            value={query.status}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                status: event.target.value as typeof current.status,
                page: 1,
              }))
            }
          >
            <option value="all">All booking states</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No show</option>
          </select>
          <select
            className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
            value={query.paymentStatus}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                paymentStatus: event.target.value as typeof current.paymentStatus,
                page: 1,
              }))
            }
          >
            <option value="all">All payment states</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
          <select
            className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
            value={query.sortBy}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                sortBy: event.target.value as AdminBookingSortOption,
                page: 1,
              }))
            }
          >
            <option value="session_desc">Latest session first</option>
            <option value="session_asc">Earliest session first</option>
            <option value="amount_high">Highest amount</option>
            <option value="amount_low">Lowest amount</option>
            <option value="newest">Newest booking record</option>
            <option value="oldest">Oldest booking record</option>
          </select>
        </div>
      </AdminCard>

      <div className="mt-6">
        {errorMessage ? <AdminErrorMessage message={errorMessage} /> : null}

        {isLoading ? (
          <AdminLoadingMessage label="Loading bookings..." />
        ) : data && data.bookings.length > 0 ? (
          <AdminCard title="All bookings">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/15 text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    <th className="pb-4 pr-4">Participants</th>
                    <th className="pb-4 pr-4">Session Time</th>
                    <th className="pb-4 pr-4">Booking Status</th>
                    <th className="pb-4 pr-4">Payment</th>
                    <th className="pb-4 pr-4">Amount</th>
                    <th className="pb-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {data.bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="py-4 pr-4">
                        <div>
                          <p className="font-semibold text-primary">{booking.student.name}</p>
                          <p className="text-sm text-on-surface-variant">
                            Student • {booking.student.email}
                          </p>
                        </div>
                        <div className="mt-2">
                          <p className="font-semibold text-primary">{booking.tutor.name}</p>
                          <p className="text-sm text-on-surface-variant">
                            Tutor • {booking.tutor.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-sm text-on-surface-variant">
                        <div>{formatAdminDateTime(booking.startTime)}</div>
                        <div className="mt-1">to {formatAdminDateTime(booking.endTime)}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-on-tertiary-fixed-variant">
                          {booking.bookingStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                            booking.paymentStatus === "paid"
                              ? "bg-secondary-container text-on-secondary-container"
                              : booking.paymentStatus === "failed"
                                ? "bg-error-container text-on-error-container"
                                : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 pr-4 font-semibold text-primary">
                        {formatAdminCurrency(booking.priceAtBooking)}
                      </td>
                      <td className="py-4 text-sm text-on-surface-variant">
                        {formatAdminDateTime(booking.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPaginationControls
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onChange={(page) => setQuery((current) => ({ ...current, page }))}
            />
          </AdminCard>
        ) : (
          <AdminTableEmpty
            title="No bookings match the current filters"
            description="Try loosening the status, payment, or search filters to see more booking records."
          />
        )}
      </div>
    </div>
  );
}
