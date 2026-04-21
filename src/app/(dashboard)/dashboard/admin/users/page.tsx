"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
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
  formatAdminDate,
} from "@/Components/Dashboard/AdminUi";

const defaultQuery = {
  q: "",
  role: "all",
  banned: "all",
  verified: "all",
  sortBy: "newest" as AdminUserSortOption,
  page: 1,
  limit: 10,
};

export default function AdminUsersPage() {
  const [query, setQuery] = useState(defaultQuery);
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

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
      <AdminPageHeader
        eyebrow="Admin Users"
        title="Manage students and tutors"
        description="Filter by role, verification state, or ban state, then take moderation actions without leaving the dashboard."
      />

      <AdminCard title="Filters">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
          <input
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none"
            value={query.q}
            onChange={(event) =>
              setQuery((current) => ({ ...current, q: event.target.value, page: 1 }))
            }
            placeholder="Search by name or email"
          />
          <select
            className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
            value={query.role}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                role: event.target.value as typeof current.role,
                page: 1,
              }))
            }
          >
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="tutor">Tutors</option>
          </select>
          <select
            className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
            value={query.banned}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                banned: event.target.value as typeof current.banned,
                page: 1,
              }))
            }
          >
            <option value="all">Any ban state</option>
            <option value="true">Banned</option>
            <option value="false">Active</option>
          </select>
          <select
            className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
            value={query.verified}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                verified: event.target.value as typeof current.verified,
                page: 1,
              }))
            }
          >
            <option value="all">Any verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <select
            className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
            value={query.sortBy}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                sortBy: event.target.value as AdminUserSortOption,
                page: 1,
              }))
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="email_asc">Email A-Z</option>
            <option value="email_desc">Email Z-A</option>
          </select>
        </div>
      </AdminCard>

      <div className="mt-6">
        {errorMessage ? <AdminErrorMessage message={errorMessage} /> : null}

        {isLoading ? (
          <AdminLoadingMessage label="Loading users..." />
        ) : data && data.users.length > 0 ? (
          <AdminCard title="User directory">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/15 text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    <th className="pb-4 pr-4">User</th>
                    <th className="pb-4 pr-4">Role</th>
                    <th className="pb-4 pr-4">Verification</th>
                    <th className="pb-4 pr-4">Status</th>
                    <th className="pb-4 pr-4">Joined</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {data.users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-4 pr-4">
                        <div>
                          <p className="font-semibold text-primary">{user.name}</p>
                          <p className="text-sm text-on-surface-variant">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-sm capitalize text-on-surface-variant">
                        {user.role}
                      </td>
                      <td className="py-4 pr-4">
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
                      <td className="py-4 pr-4">
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
                      <td className="py-4 pr-4 text-sm text-on-surface-variant">
                        {formatAdminDate(user.createdAt)}
                      </td>
                      <td className="py-4 text-right">
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
              onChange={(page) => setQuery((current) => ({ ...current, page }))}
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
