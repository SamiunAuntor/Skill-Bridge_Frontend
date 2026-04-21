"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  AdminApiError,
  createAdminSubject,
  deleteAdminSubject,
  getAdminCategories,
  getAdminSubjects,
  updateAdminSubject,
} from "@/lib/admin-api";
import { subjectIconOptions } from "@/lib/subject-icons";
import type {
  AdminCategoriesResponse,
  AdminMasterSortOption,
  AdminSubjectUpsertInput,
  AdminSubjectsResponse,
} from "@/types/admin";
import {
  AdminCard,
  AdminErrorMessage,
  AdminLoadingMessage,
  AdminPageHeader,
  AdminPaginationControls,
  AdminTableEmpty,
  formatAdminDate,
} from "@/Components/Dashboard/AdminUi";

const blankForm: AdminSubjectUpsertInput = {
  categoryId: "",
  name: "",
  slug: "",
  shortDescription: "",
  longDescription: "",
  iconKey: "",
  heroImageUrl: "",
  isActive: true,
  displayOrder: 0,
};

export default function AdminSubjectsPage() {
  const [query, setQuery] = useState({
    q: "",
    categoryId: "all",
    isActive: "all",
    sortBy: "display_asc" as AdminMasterSortOption,
    page: 1,
    limit: 10,
  });
  const [data, setData] = useState<AdminSubjectsResponse | null>(null);
  const [categoryData, setCategoryData] = useState<AdminCategoriesResponse | null>(null);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryOptions = categoryData?.categories ?? [];

  const canSubmit = useMemo(
    () => form.categoryId.trim().length > 0 && form.name.trim().length > 0,
    [form.categoryId, form.name]
  );

  async function loadPageData() {
    setIsLoading(true);

    try {
      const [subjectsResult, categoriesResult] = await Promise.all([
        getAdminSubjects({
          q: query.q || undefined,
          categoryId: query.categoryId === "all" ? undefined : query.categoryId,
          isActive:
            query.isActive === "all" ? undefined : query.isActive === "true",
          sortBy: query.sortBy,
          page: query.page,
          limit: query.limit,
        }),
        getAdminCategories({
          sortBy: "display_asc",
          page: 1,
          limit: 100,
        }),
      ]);

      setData(subjectsResult);
      setCategoryData(categoriesResult);
      setErrorMessage(null);
      if (!form.categoryId && categoriesResult.categories[0]) {
        setForm((current) => ({
          ...current,
          categoryId: categoriesResult.categories[0]?.id ?? "",
        }));
      }
    } catch (error) {
      setErrorMessage(
        error instanceof AdminApiError
          ? error.message
          : "We couldn't load subjects right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPageData();
  }, [query]);

  function resetForm() {
    setForm({
      ...blankForm,
      categoryId: categoryOptions[0]?.id ?? "",
    });
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateAdminSubject(editingId, form);
      } else {
        await createAdminSubject(form);
      }

      resetForm();
      await loadPageData();
      await Swal.fire({
        icon: "success",
        title: editingId ? "Subject updated" : "Subject created",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't save this subject right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this subject?",
      text: `${name} will be removed permanently if it is not linked to tutors.`,
      showCancelButton: true,
      confirmButtonText: "Delete subject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      await deleteAdminSubject(id);
      if (editingId === id) {
        resetForm();
      }
      await loadPageData();
      await Swal.fire({
        icon: "success",
        title: "Subject deleted",
        confirmButtonColor: "#1d3b66",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't delete this subject right now.",
        confirmButtonColor: "#1d3b66",
      });
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Admin Subjects"
        title="Manage subjects under categories"
        description="Subjects are the actual teaching units tutors choose from inside selected categories. They also power the landing marquee and public subject pages."
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          <AdminCard title="Filters">
            <div className="grid gap-4 lg:grid-cols-4">
              <input
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
                value={query.q}
                onChange={(event) =>
                  setQuery((current) => ({ ...current, q: event.target.value, page: 1 }))
                }
                placeholder="Search subjects"
              />
              <select
                className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
                value={query.categoryId}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    categoryId: event.target.value,
                    page: 1,
                  }))
                }
              >
                <option value="all">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
            <AdminLoadingMessage label="Loading subjects..." />
          ) : data && data.subjects.length > 0 ? (
            <AdminCard title="Subjects">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-outline-variant/15 text-left">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                      <th className="pb-4 pr-4">Subject</th>
                      <th className="pb-4 pr-4">Category</th>
                      <th className="pb-4 pr-4">Status</th>
                      <th className="pb-4 pr-4">Tutors</th>
                      <th className="pb-4 pr-4">Display</th>
                      <th className="pb-4 pr-4">Created</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {data.subjects.map((subject) => (
                      <tr key={subject.id}>
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-primary">{subject.name}</p>
                          <p className="text-sm text-on-surface-variant">{subject.slug}</p>
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {subject.categoryName}
                        </td>
                        <td className="py-4 pr-4">
                          <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-on-secondary-container">
                            {subject.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {subject.tutorCount}
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {subject.displayOrder}
                        </td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">
                          {formatAdminDate(subject.createdAt)}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(subject.id);
                                setForm({
                                  categoryId: subject.categoryId,
                                  name: subject.name,
                                  slug: subject.slug,
                                  shortDescription: subject.shortDescription,
                                  longDescription: subject.longDescription,
                                  iconKey: subject.iconKey,
                                  heroImageUrl: subject.heroImageUrl,
                                  isActive: subject.isActive,
                                  displayOrder: subject.displayOrder,
                                });
                              }}
                              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(subject.id, subject.name)}
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
              title="No subjects match the current filters"
              description="Create the first subject or widen the filters to show the catalog."
            />
          )}
        </div>

        <AdminCard title={editingId ? "Edit subject" : "Create subject"}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <select
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
              value={form.categoryId}
              onChange={(event) =>
                setForm((current) => ({ ...current, categoryId: event.target.value }))
              }
              required
            >
              <option value="">Select category</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Subject name"
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
              className="min-h-24 w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
              value={form.shortDescription ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  shortDescription: event.target.value,
                }))
              }
              placeholder="Short description"
            />
            <textarea
              className="min-h-32 w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
              value={form.longDescription ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  longDescription: event.target.value,
                }))
              }
              placeholder="Long description"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <select
                className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
                value={form.iconKey ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, iconKey: event.target.value }))
                }
              >
                <option value="">Default icon</option>
                {subjectIconOptions.map((iconKey) => (
                  <option key={iconKey} value={iconKey}>
                    {iconKey}
                  </option>
                ))}
              </select>
              <input
                className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
                value={form.heroImageUrl ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    heroImageUrl: event.target.value,
                  }))
                }
                placeholder="Hero image URL (optional)"
              />
            </div>
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
                Active subject
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update subject" : "Create subject"}
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
