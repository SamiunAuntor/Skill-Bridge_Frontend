"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { ChevronDown, Search } from "lucide-react";
import {
  getAdminUsers,
  updateAdminUserStatus,
  AdminApiError,
} from "@/lib/admin-api";
import type { AdminUsersResponse, AdminUserSortOption } from "@/types/admin";
import {
  AdminCard,
  AdminErrorMessage,
  AdminLoadingMessage,
  AdminPageHeader,
  AdminPaginationControls,
  AdminTableEmpty,
} from "@/Components/Admin/AdminUi";
import { formatAdminDate } from "@/Components/Admin/admin-formatters";

const defaultQuery = {
  q: "",
  role: "all",
  banned: "all",
  verified: "all",
  sortBy: "newest" as AdminUserSortOption,
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
  const role = searchParams.get("role");
  const banned = searchParams.get("banned");
  const verified = searchParams.get("verified");
  const sortBy = searchParams.get("sortBy");

  return {
    q: searchParams.get("q") ?? defaultQuery.q,
    role:
      role === "student" || role === "tutor" ? role : defaultQuery.role,
    banned:
      banned === "true" || banned === "false" ? banned : defaultQuery.banned,
    verified:
      verified === "true" || verified === "false"
        ? verified
        : defaultQuery.verified,
    sortBy:
      sortBy &&
      [
        "newest",
        "oldest",
        "name_asc",
        "name_desc",
        "email_asc",
        "email_desc",
      ].includes(sortBy)
        ? (sortBy as AdminUserSortOption)
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

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(
    () => parseQueryParams(searchParams),
    [searchParams]
  );
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
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

    if (merged.role !== "all") {
      params.set("role", merged.role);
    } else {
      params.delete("role");
    }

    if (merged.banned !== "all") {
      params.set("banned", merged.banned);
    } else {
      params.delete("banned");
    }

    if (merged.verified !== "all") {
      params.set("verified", merged.verified);
    } else {
      params.delete("verified");
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

  async function loadUsers() {
    setIsLoading(true);

    try {
      const result = await getAdminUsers({
        q: query.q || undefined,
        role:
          query.role === "all"
            ? undefined
            : (query.role as "student" | "tutor"),
        banned:
          query.banned === "all" ? undefined : query.banned === "true",
        verified:
          query.verified === "all" ? undefined : query.verified === "true",
        sortBy: query.sortBy,
        page: query.page,
        limit: query.limit,
      });

      setData(result);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof AdminApiError
          ? error.message
          : "We couldn't load users right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, [query]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({
      q: searchInput,
      page: 1,
    });
  }

  async function handleToggleBan(userId: string, isBanned: boolean, name: string) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: isBanned ? "Unban this user?" : "Ban this user?",
      text: isBanned
        ? `${name} will regain access to the platform.`
        : `${name} will be signed out and blocked from future logins until unbanned.`,
      showCancelButton: true,
      confirmButtonText: isBanned ? "Unban user" : "Ban user",
      cancelButtonText: "Cancel",
      confirmButtonColor: isBanned ? "#1d3b66" : "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setActionUserId(userId);

    try {
      await updateAdminUserStatus(userId, !isBanned);
      await loadUsers();
      await Swal.fire({
        icon: "success",
        title: isBanned ? "User unbanned" : "User banned",
        text: isBanned
          ? `${name} can sign in again.`
          : `${name} has been restricted from the platform.`,
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Action failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't update this user right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setActionUserId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Manage students and tutors" />

      <AdminCard title="Filters">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email"
            />
          </form>
          <SelectField
            value={query.role}
            onChange={(value) =>
              updateQuery({
                role: value as typeof query.role,
                page: 1,
              })
            }
          >
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="tutor">Tutors</option>
          </SelectField>
          <SelectField
            value={query.banned}
            onChange={(value) =>
              updateQuery({
                banned: value as typeof query.banned,
                page: 1,
              })
            }
          >
            <option value="all">Any ban state</option>
            <option value="true">Banned</option>
            <option value="false">Active</option>
          </SelectField>
          <SelectField
            value={query.verified}
            onChange={(value) =>
              updateQuery({
                verified: value as typeof query.verified,
                page: 1,
              })
            }
          >
            <option value="all">Any verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </SelectField>
          <SelectField
            value={query.sortBy}
            onChange={(value) =>
              updateQuery({
                sortBy: value as AdminUserSortOption,
                page: 1,
              })
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="email_asc">Email A-Z</option>
            <option value="email_desc">Email Z-A</option>
          </SelectField>
        </div>
      </AdminCard>

      <div className="mt-6">
        {errorMessage ? <AdminErrorMessage message={errorMessage} /> : null}

        {isLoading ? (
          <AdminLoadingMessage label="Loading users..." />
        ) : data && data.users.length > 0 ? (
          <AdminCard title="User directory">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-outline-variant/20 text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    <th className="border border-outline-variant/20 px-4 py-4">User</th>
                    <th className="border border-outline-variant/20 px-4 py-4">Role</th>
                    <th className="border border-outline-variant/20 px-4 py-4">Verification</th>
                    <th className="border border-outline-variant/20 px-4 py-4">Status</th>
                    <th className="border border-outline-variant/20 px-4 py-4">Joined</th>
                    <th className="border border-outline-variant/20 px-4 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr key={user.id}>
                      <td className="border border-outline-variant/20 px-4 py-4">
                        <div>
                          <p className="font-semibold text-primary">{user.name}</p>
                          <p className="text-sm text-on-surface-variant">{user.email}</p>
                        </div>
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4 text-sm capitalize text-on-surface-variant">
                        {user.role}
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                            user.emailVerified
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {user.emailVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                            user.isBanned
                              ? "bg-error-container text-on-error-container"
                              : "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                          }`}
                        >
                          {user.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                        {formatAdminDate(user.createdAt)}
                      </td>
                      <td className="border border-outline-variant/20 px-4 py-4 text-right">
                        <button
                          type="button"
                          disabled={actionUserId === user.id}
                          onClick={() =>
                            void handleToggleBan(user.id, user.isBanned, user.name)
                          }
                          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                            user.isBanned
                              ? "bg-primary text-on-primary"
                              : "bg-error-container text-on-error-container"
                          } disabled:opacity-60`}
                        >
                          {actionUserId === user.id
                            ? "Updating..."
                            : user.isBanned
                              ? "Unban"
                              : "Ban"}
                        </button>
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
            title="No users match the current filters"
            description="Try widening the filters or clearing the search to bring more users back into the table."
          />
        )}
      </div>
    </div>
  );
}
