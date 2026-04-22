"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import {
  AdminApiError,
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "@/lib/admin-api";
import { buildAdminListUrl, parsePositiveInt } from "@/lib/admin-list-query";
import type {
  AdminCategoriesResponse,
  AdminCategoryUpsertInput,
  AdminMasterSortOption,
} from "@/types/admin";
import {
  AdminErrorMessage,
  AdminLoadingMessage,
  AdminPageHeader,
  AdminTableEmpty,
} from "@/Components/Admin/AdminUi";
import { CategoryFilters } from "@/Components/Admin/Categories/CategoryFilters";
import { CategoryDetailsModal } from "@/Components/Admin/Categories/CategoryDetailsModal";
import { CategoryFormModal } from "@/Components/Admin/Categories/CategoryFormModal";
import { CategoryTable } from "@/Components/Admin/Categories/CategoryTable";

const defaultQuery = {
  q: "",
  isActive: "all",
  sortBy: "name_asc" as AdminMasterSortOption,
  page: 1,
  limit: 10,
};

const blankForm: AdminCategoryUpsertInput = {
  name: "",
  description: "",
};

function parseQueryParams(searchParams: URLSearchParams) {
  const isActive = searchParams.get("isActive");
  const sortBy = searchParams.get("sortBy");

  return {
    q: searchParams.get("q") ?? defaultQuery.q,
    isActive:
      isActive === "true" || isActive === "false" ? isActive : defaultQuery.isActive,
    sortBy:
      sortBy && ["name_asc", "name_desc", "newest", "oldest"].includes(sortBy)
        ? (sortBy as AdminMasterSortOption)
        : defaultQuery.sortBy,
    page: parsePositiveInt(searchParams.get("page"), defaultQuery.page),
    limit: 10,
  };
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseQueryParams(searchParams), [searchParams]);

  const [data, setData] = useState<AdminCategoriesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query.q);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [viewingCategory, setViewingCategory] =
    useState<AdminCategoriesResponse["categories"][number] | null>(null);
  const [form, setForm] = useState<AdminCategoryUpsertInput>(blankForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rowActionId, setRowActionId] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(query.q);
  }, [query.q]);

  function updateQuery(next: Partial<typeof defaultQuery>) {
    const merged = { ...query, ...next, limit: 10 };
    const nextUrl = buildAdminListUrl({
      pathname,
      searchParams,
      values: merged,
      defaults: defaultQuery,
    });
    router.replace(nextUrl, { scroll: false });
  }

  async function loadCategories() {
    setIsLoading(true);

    try {
      const result = await getAdminCategories({
        q: query.q || undefined,
        isActive: query.isActive === "all" ? undefined : query.isActive === "true",
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

  function openCreateModal() {
    setEditingCategoryId(null);
    setForm(blankForm);
    setIsModalOpen(true);
  }

  function openEditModal(category: AdminCategoriesResponse["categories"][number]) {
    setEditingCategoryId(category.id);
    setForm({
      name: category.name,
      description: category.description ?? "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingCategoryId(null);
    setForm(blankForm);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({
      q: searchInput,
      page: 1,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCategoryId) {
        await updateAdminCategory(editingCategoryId, form);
      } else {
        await createAdminCategory(form);
      }

      closeModal();
      await loadCategories();
      await Swal.fire({
        icon: "success",
        title: editingCategoryId ? "Category updated" : "Category created",
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

  async function handleToggleActive(
    category: AdminCategoriesResponse["categories"][number]
  ) {
    setRowActionId(category.id);

    try {
      await updateAdminCategory(category.id, {
        name: category.name,
        description: category.description,
        isActive: !category.isActive,
      });
      await loadCategories();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Status update failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't update this category right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setRowActionId(null);
    }
  }

  async function handleDelete(category: AdminCategoriesResponse["categories"][number]) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this category?",
      text: `${category.name} will be removed permanently if it is not linked anywhere.`,
      showCancelButton: true,
      confirmButtonText: "Delete category",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setRowActionId(category.id);

    try {
      await deleteAdminCategory(category.id);
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
    } finally {
      setRowActionId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Manage categories"
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        }
      />

      <CategoryFilters
        searchInput={searchInput}
        isActive={query.isActive}
        sortBy={query.sortBy}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onStatusChange={(value) => updateQuery({ isActive: value, page: 1 })}
        onSortChange={(value) => updateQuery({ sortBy: value, page: 1 })}
      />

      <div className="mt-6">
        {errorMessage ? <AdminErrorMessage message={errorMessage} /> : null}

        {isLoading ? (
          <AdminLoadingMessage label="Loading categories..." />
        ) : data && data.categories.length > 0 ? (
          <CategoryTable
            categories={data.categories}
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            rowActionId={rowActionId}
            onView={setViewingCategory}
            onEdit={openEditModal}
            onToggleActive={(category) => {
              void handleToggleActive(category);
            }}
            onDelete={(category) => {
              void handleDelete(category);
            }}
            onPageChange={(page) => updateQuery({ page })}
          />
        ) : (
          <AdminTableEmpty
            title="No categories match the current filters"
            description="Create a category or widen the filters to bring more results into the table."
          />
        )}
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        isEditing={Boolean(editingCategoryId)}
        form={form}
        onClose={closeModal}
        onChange={setForm}
        onSubmit={handleSubmit}
      />

      <CategoryDetailsModal
        category={viewingCategory}
        onClose={() => setViewingCategory(null)}
      />
    </div>
  );
}
