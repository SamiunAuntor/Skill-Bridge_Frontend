"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { AdminApiError, getAdminBookings } from "@/lib/admin-api";
import type { AdminBookingsResponse, AdminBookingSortOption } from "@/types/admin";
import {
  AdminCard,
  AdminErrorMessage,
  AdminLoadingMessage,
  AdminPageHeader,
  AdminPaginationControls,
  AdminTableEmpty,
} from "@/Components/Admin/AdminUi";
import {
  formatAdminCurrency,
  formatAdminDateTime,
} from "@/Components/Admin/admin-formatters";

const defaultQuery = {
  q: "",
  status: "all",
  paymentStatus: "all",
  sortBy: "session_desc" as AdminBookingSortOption,
  page: 1,
  limit: 10,
};

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseQueryParams(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const paymentStatus = searchParams.get("paymentStatus");
  const sortBy = searchParams.get("sortBy");

  return {
    q: searchParams.get("q") ?? defaultQuery.q,
    status:
      status &&
      ["confirmed", "completed", "cancelled", "no_show"].includes(status)
        ? status
        : defaultQuery.status,
    paymentStatus:
      paymentStatus &&
      ["pending", "paid", "failed"].includes(paymentStatus)
        ? paymentStatus
        : defaultQuery.paymentStatus,
    sortBy:
      sortBy &&
      [
        "session_desc",
        "session_asc",
        "amount_high",
        "amount_low",
        "newest",
        "oldest",
      ].includes(sortBy)
        ? (sortBy as AdminBookingSortOption)
        : defaultQuery.sortBy,
    page: parsePositiveInt(searchParams.get("page"), defaultQuery.page),
    limit: 10,
  };
}

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
      <select
        className="w-full appearance-none rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseQueryParams(searchParams), [searchParams]);
  const [data, setData] = useState<AdminBookingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query.q);

  useEffect(() => {
    setSearchInput(query.q);
  }, [query.q]);

  function updateQuery(next: Partial<typeof defaultQuery>) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...query, ...next };

    if (merged.q.trim()) {
      params.set("q", merged.q.trim());
    } else {
      params.delete("q");
    }

    if (merged.status !== "all") {
      params.set("status", merged.status);
    } else {
      params.delete("status");
    }

    if (merged.paymentStatus !== "all") {
      params.set("paymentStatus", merged.paymentStatus);
    } else {
      params.delete("paymentStatus");
    }

    if (merged.sortBy !== defaultQuery.sortBy) {
      params.set("sortBy", merged.sortBy);
    } else {
      params.delete("sortBy");
    }

    if (merged.page > 1) {
      params.set("page", String(merged.page));
    } else {
      params.delete("page");
    }

    params.set("limit", "10");

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }

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

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({
      q: searchInput,
      page: 1,
    });
  }

  return (
    <div>
      <AdminPageHeader title="Monitor every session booking" />

      <AdminCard title="Filters">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by tutor or student"
            />
          </form>

          <SelectField
            value={query.status}
            onChange={(value) =>
              updateQuery({
                status: value as typeof query.status,
                page: 1,
              })
            }
          >
            <option value="all">All booking states</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No show</option>
          </SelectField>

          <SelectField
            value={query.paymentStatus}
            onChange={(value) =>
              updateQuery({
                paymentStatus: value as typeof query.paymentStatus,
                page: 1,
              })
            }
          >
            <option value="all">All payment states</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </SelectField>

          <SelectField
            value={query.sortBy}
            onChange={(value) =>
              updateQuery({
                sortBy: value as AdminBookingSortOption,
                page: 1,
              })
            }
          >
            <option value="session_desc">Latest session first</option>
            <option value="session_asc">Earliest session first</option>
            <option value="amount_high">Highest amount</option>
            <option value="amount_low">Lowest amount</option>
            <option value="newest">Newest booking record</option>
            <option value="oldest">Oldest booking record</option>
          </SelectField>
        </div>
      </AdminCard>

      <div className="mt-6">
        {errorMessage ? <AdminErrorMessage message={errorMessage} /> : null}

        {isLoading ? (
          <AdminLoadingMessage label="Loading bookings..." />
        ) : data && data.bookings.length > 0 ? (
          <AdminCard title="All bookings">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-outline-variant/20 text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    <th className="border border-outline-variant/20 px-4 py-4">Participants</th>
                    <th className="border border-outline-variant/20 px-4 py-4">Session Time</th>
                    <th className="border border-outline-variant/20 px-4 py-4">Booking Status</th>
                    <th className="border border-outline-variant/20 px-4 py-4">Payment</th>
                    <th className="border border-outline-variant/20 px-4 py-4">Amount</th>
                    <th className="border border-outline-variant/20 px-4 py-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="border border-outline-variant/20 px-4 py-4">
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
                      <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                        <div>{formatAdminDateTime(booking.startTime)}</div>
                        <div className="mt-1">to {formatAdminDateTime(booking.endTime)}</div>
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4">
                        <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-on-tertiary-fixed-variant">
                          {booking.bookingStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4">
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
                      <td className="border border-outline-variant/20 px-4 py-4 font-semibold text-primary">
                        {formatAdminCurrency(booking.priceAtBooking)}
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
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
              onChange={(page) => updateQuery({ page })}
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
