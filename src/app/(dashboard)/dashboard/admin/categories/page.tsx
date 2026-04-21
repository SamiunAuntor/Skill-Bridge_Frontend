"use client";

import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  AdminApiError,
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "@/lib/admin-api";
import type {
  AdminCategoriesResponse,
  AdminCategoryUpsertInput,
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

const blankForm: AdminCategoryUpsertInput = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
  displayOrder: 0,
};

export default function AdminCategoriesPage() {
  const [query, setQuery] = useState({
    q: "",
    isActive: "all",
    sortBy: "display_asc" as AdminMasterSortOption,
    page: 1,
    limit: 10,
  });
  const [data, setData] = useState<AdminCategoriesResponse | null>(null);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadCategories() {
    setIsLoading(true);

    try {
      const result = await getAdminCategories({
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
          : "We couldn't load categories right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
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
        await updateAdminCategory(editingId, form);
      } else {
        await createAdminCategory(form);
      }

      resetForm();
      await loadCategories();
      await Swal.fire({
        icon: "success",
        title: editingId ? "Category updated" : "Category created",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't save this category right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this category?",
      text: `${name} will be removed permanently if it is not linked anywhere.`,
      showCancelButton: true,
      confirmButtonText: "Delete category",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      await deleteAdminCategory(id);
      if (editingId === id) {
        resetForm();
      }
      await loadCategories();
      await Swal.fire({
        icon: "success",
        title: "Category deleted",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't delete this category right now.",
        confirmButtonColor: "#1d3b66",
      });
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Admin Categories"
        title="Control the subject taxonomy"
        description="Categories are the parent grouping for every subject in the platform. Tutors select categories first, then subjects under them."
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
                placeholder="Search categories"
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
            <AdminLoadingMessage label="Loading categories..." />
          ) : data && data.categories.length > 0 ? (
            <AdminCard title="Categories">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-outline-variant/15 text-left">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                      <th className="pb-4 pr-4">Name</th>
                      <th className="pb-4 pr-4">Status</th>
                      <th className="pb-4 pr-4">Subjects</th>
                      <th className="pb-4 pr-4">Tutors</th>
                      <th className="pb-4 pr-4">Display</th>
                      <th className="pb-4 pr-4">Created</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {data.categories.map((category) => (
                      <tr key={category.id}>
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-primary">{category.name}</p>
                          <p className="text-sm text-on-surface-variant">{category.slug}</p>
                        </td>
                        <td className="py-4 pr-4 text-sm">
                          <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-on-secondary-container">
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {category.subjectCount}
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {category.tutorCount}
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {category.displayOrder}
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {formatAdminDate(category.createdAt)}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(category.id);
                                setForm({
                                  name: category.name,
                                  slug: category.slug,
                                  description: category.description,
                                  isActive: category.isActive,
                                  displayOrder: category.displayOrder,
                                });
                              }}
                              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(category.id, category.name)}
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
              title="No categories match the current filters"
              description="Create the first category or clear the filters to show the full catalog."
            />
          )}
        </div>

        <AdminCard title={editingId ? "Edit category" : "Create category"}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Category name"
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
            <textarea
              className="min-h-28 w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Description"
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
                Active category
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update category" : "Create category"}
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
