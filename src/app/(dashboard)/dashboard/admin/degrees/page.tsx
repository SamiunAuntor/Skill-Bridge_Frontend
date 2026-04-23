"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import {
  AdminApiError,
  getAdminCategories,
  createAdminDegree,
  deleteAdminDegree,
  getAdminDegrees,
  updateAdminDegree,
} from "@/lib/admin-api";
import { buildAdminListUrl, parsePositiveInt } from "@/lib/admin-list-query";
import type {
  AdminDegreeUpsertInput,
  AdminDegreesResponse,
  AdminMasterSortOption,
} from "@/types/admin";
import {
  AdminErrorMessage,
  AdminLoadingMessage,
  AdminPageHeader,
  AdminTableEmpty,
} from "@/Components/Admin/AdminUi";
import { DegreeFilters } from "@/Components/Admin/Degrees/DegreeFilters";
import { DegreeDetailsModal } from "@/Components/Admin/Degrees/DegreeDetailsModal";
import { DegreeFormModal } from "@/Components/Admin/Degrees/DegreeFormModal";
import { DegreeTable } from "@/Components/Admin/Degrees/DegreeTable";

const defaultQuery = {
  q: "",
  categoryId: "all",
  isActive: "all",
  sortBy: "name_asc" as AdminMasterSortOption,
  page: 1,
  limit: 10,
};

const blankForm: AdminDegreeUpsertInput = {
  categoryId: "",
  name: "",
  level: "",
};

function parseQueryParams(searchParams: URLSearchParams) {
  const categoryId = searchParams.get("categoryId");
  const isActive = searchParams.get("isActive");
  const sortBy = searchParams.get("sortBy");

  return {
    q: searchParams.get("q") ?? defaultQuery.q,
    categoryId: categoryId || defaultQuery.categoryId,
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

export default function AdminDegreesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseQueryParams(searchParams), [searchParams]);

  const [data, setData] = useState<AdminDegreesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query.q);
  const [editingDegreeId, setEditingDegreeId] = useState<string | null>(null);
  const [viewingDegree, setViewingDegree] =
    useState<AdminDegreesResponse["degrees"][number] | null>(null);
  const [form, setForm] = useState<AdminDegreeUpsertInput>(blankForm);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
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

  async function loadDegrees() {
    setIsLoading(true);

    try {
      const result = await getAdminDegrees({
        q: query.q || undefined,
        categoryId: query.categoryId === "all" ? undefined : query.categoryId,
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
          : "We couldn't load degrees right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDegrees();
  }, [query]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const result = await getAdminCategories({
          page: 1,
          limit: 100,
          sortBy: "name_asc",
          isActive: true,
        });

        if (!isMounted) {
          return;
        }

        setCategories(
          result.categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))
        );
      } catch {
        if (isMounted) {
          setCategories([]);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  function openCreateModal() {
    setEditingDegreeId(null);
    setForm({
      ...blankForm,
      categoryId: categories[0]?.id ?? "",
    });
    setIsModalOpen(true);
  }

  function openEditModal(degree: AdminDegreesResponse["degrees"][number]) {
    setEditingDegreeId(degree.id);
    setForm({
      categoryId: degree.categoryId,
      name: degree.name,
      level: degree.level ?? "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingDegreeId(null);
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
      if (editingDegreeId) {
        await updateAdminDegree(editingDegreeId, form);
      } else {
        await createAdminDegree(form);
      }

      closeModal();
      await loadDegrees();
      await Swal.fire({
        icon: "success",
        title: editingDegreeId ? "Degree updated" : "Degree created",
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

  async function handleToggleActive(degree: AdminDegreesResponse["degrees"][number]) {
    const nextIsActive = !degree.isActive;
    const confirmation = await Swal.fire({
      icon: "warning",
      title: nextIsActive ? "Activate this degree?" : "Archive this degree?",
      text: nextIsActive
        ? `${degree.name} will become selectable in tutor education setup.`
        : `${degree.name} will be hidden from new education entries, but existing tutor history will remain.`,
      showCancelButton: true,
      confirmButtonText: nextIsActive ? "Activate degree" : "Archive degree",
      cancelButtonText: "Cancel",
      confirmButtonColor: nextIsActive ? "#1d3b66" : "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setRowActionId(degree.id);

    try {
      await updateAdminDegree(degree.id, {
        categoryId: degree.categoryId,
        name: degree.name,
        level: degree.level,
        isActive: nextIsActive,
      });
      await loadDegrees();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Status update failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't update this degree right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setRowActionId(null);
    }
  }

  async function handleDelete(degree: AdminDegreesResponse["degrees"][number]) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this degree?",
      text: `${degree.name} will be removed permanently if it is not referenced by tutor education history.`,
      showCancelButton: true,
      confirmButtonText: "Delete degree",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setRowActionId(degree.id);

    try {
      await deleteAdminDegree(degree.id);
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
    } finally {
      setRowActionId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Manage degrees"
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary"
          >
            <Plus className="h-4 w-4" />
            Add Degree
          </button>
        }
      />

      <DegreeFilters
        searchInput={searchInput}
        categoryId={query.categoryId}
        categories={categories}
        isActive={query.isActive}
        sortBy={query.sortBy}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onCategoryChange={(value) => updateQuery({ categoryId: value, page: 1 })}
        onStatusChange={(value) => updateQuery({ isActive: value, page: 1 })}
        onSortChange={(value) => updateQuery({ sortBy: value, page: 1 })}
      />

      <div className="mt-6">
        {errorMessage ? <AdminErrorMessage message={errorMessage} /> : null}

        {isLoading ? (
          <AdminLoadingMessage label="Loading degrees..." />
        ) : data && data.degrees.length > 0 ? (
          <DegreeTable
            degrees={data.degrees}
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            rowActionId={rowActionId}
            onView={setViewingDegree}
            onEdit={openEditModal}
            onToggleActive={(degree) => {
              void handleToggleActive(degree);
            }}
            onDelete={(degree) => {
              void handleDelete(degree);
            }}
            onPageChange={(page) => updateQuery({ page })}
          />
        ) : (
          <AdminTableEmpty
            title="No degrees match the current filters"
            description="Create a degree option or widen the filters to bring more results into the table."
          />
        )}
      </div>

      <DegreeFormModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        isEditing={Boolean(editingDegreeId)}
        form={form}
        categories={categories}
        onClose={closeModal}
        onChange={setForm}
        onSubmit={handleSubmit}
      />

      <DegreeDetailsModal
        degree={viewingDegree}
        onClose={() => setViewingDegree(null)}
      />
    </div>
  );
}
