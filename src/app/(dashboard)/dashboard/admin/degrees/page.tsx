"use client";

import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  AdminApiError,
  createAdminDegree,
  deleteAdminDegree,
  getAdminDegrees,
  updateAdminDegree,
} from "@/lib/admin-api";
import type {
  AdminDegreeUpsertInput,
  AdminDegreesResponse,
  AdminMasterSortOption,
} from "@/types/admin";
import {
  AdminCard,
  AdminErrorMessage,
  AdminLoadingMessage,
  AdminPageHeader,
  AdminPaginationControls,
  AdminTableEmpty,
} from "@/Components/Admin/AdminUi";
import { formatAdminDate } from "@/Components/Admin/admin-formatters";

const blankForm: AdminDegreeUpsertInput = {
  name: "",
  slug: "",
  level: "",
  isActive: true,
  displayOrder: 0,
};

export default function AdminDegreesPage() {
  const [query, setQuery] = useState({
    q: "",
    isActive: "all",
    sortBy: "display_asc" as AdminMasterSortOption,
    page: 1,
    limit: 10,
  });
  const [data, setData] = useState<AdminDegreesResponse | null>(null);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadDegrees() {
    setIsLoading(true);

    try {
      const result = await getAdminDegrees({
        q: query.q || undefined,
        isActive:
          query.isActive === "all" ? undefined : query.isActive === "true",
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
          : "We couldn't load degrees right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDegrees();
  }, [query]);

  function resetForm() {
    setForm(blankForm);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateAdminDegree(editingId, form);
      } else {
        await createAdminDegree(form);
      }

      resetForm();
      await loadDegrees();
      await Swal.fire({
        icon: "success",
        title: editingId ? "Degree updated" : "Degree created",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't save this degree right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this degree?",
      text: `${name} will be removed permanently if it is not referenced by tutor education history.`,
      showCancelButton: true,
      confirmButtonText: "Delete degree",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      await deleteAdminDegree(id);
      if (editingId === id) {
        resetForm();
      }
      await loadDegrees();
      await Swal.fire({
        icon: "success",
        title: "Degree deleted",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't delete this degree right now.",
        confirmButtonColor: "#1d3b66",
      });
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Admin Degrees"
        title="Control tutor degree options"
        description="Degrees are master-data values used in tutor academic history, so tutors choose from a platform-approved dropdown instead of typing inconsistent free-form text."
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <AdminCard title="Filters">
            <div className="grid gap-4 md:grid-cols-3">
              <input
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
                value={query.q}
                onChange={(event) =>
                  setQuery((current) => ({ ...current, q: event.target.value, page: 1 }))
                }
                placeholder="Search degrees"
              />
              <select
                className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
                value={query.isActive}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    isActive: event.target.value as typeof current.isActive,
                    page: 1,
                  }))
                }
              >
                <option value="all">Any status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <select
                className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
                value={query.sortBy}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    sortBy: event.target.value as AdminMasterSortOption,
                    page: 1,
                  }))
                }
              >
                <option value="display_asc">Display order ↑</option>
                <option value="display_desc">Display order ↓</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </AdminCard>

          {errorMessage ? <AdminErrorMessage message={errorMessage} /> : null}

          {isLoading ? (
            <AdminLoadingMessage label="Loading degrees..." />
          ) : data && data.degrees.length > 0 ? (
            <AdminCard title="Degrees">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-outline-variant/15 text-left">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                      <th className="pb-4 pr-4">Degree</th>
                      <th className="pb-4 pr-4">Level</th>
                      <th className="pb-4 pr-4">Status</th>
                      <th className="pb-4 pr-4">Usage</th>
                      <th className="pb-4 pr-4">Display</th>
                      <th className="pb-4 pr-4">Created</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {data.degrees.map((degree) => (
                      <tr key={degree.id}>
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-primary">{degree.name}</p>
                          <p className="text-sm text-on-surface-variant">{degree.slug}</p>
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {degree.level || "—"}
                        </td>
                        <td className="py-4 pr-4">
                          <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-on-secondary-container">
                            {degree.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {degree.usageCount}
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {degree.displayOrder}
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {formatAdminDate(degree.createdAt)}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(degree.id);
                                setForm({
                                  name: degree.name,
                                  slug: degree.slug,
                                  level: degree.level,
                                  isActive: degree.isActive,
                                  displayOrder: degree.displayOrder,
                                });
                              }}
                              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(degree.id, degree.name)}
                              className="rounded-xl bg-error-container px-4 py-2 text-sm font-semibold text-on-error-container"
                            >
                              Delete
                            </button>
                          </div>
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
              title="No degrees match the current filters"
              description="Create the first degree option or loosen the filters to show the catalog."
            />
          )}
        </div>

        <AdminCard title={editingId ? "Edit degree" : "Create degree"}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Degree name"
              required
            />
            <input
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
              value={form.slug ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
              placeholder="Slug (optional)"
            />
            <input
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
              value={form.level ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, level: event.target.value }))
              }
              placeholder="Level (e.g. Undergraduate, Graduate)"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="number"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
                value={form.displayOrder ?? 0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    displayOrder: Number(event.target.value),
                  }))
                }
                placeholder="Display order"
              />
              <label className="flex items-center gap-3 rounded-xl bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Active degree
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update degree" : "Create degree"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-5 py-3 text-sm font-semibold text-primary"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </AdminCard>
      </div>
    </div>
  );
}
