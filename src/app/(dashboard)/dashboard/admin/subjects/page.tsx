"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import {
  AdminApiError,
  createAdminSubject,
  deleteAdminSubject,
  getAdminCategories,
  getAdminSubjects,
  updateAdminSubject,
} from "@/lib/admin-api";
import { buildAdminListUrl, parsePositiveInt } from "@/lib/admin-list-query";
import {
  deleteUploadedAsset,
  type UploadedImageResult,
  ImageUploadError,
  uploadImage,
} from "@/lib/upload-image";
import type {
  AdminCategoriesResponse,
  AdminMasterSortOption,
  AdminSubjectUpsertInput,
  AdminSubjectsResponse,
} from "@/types/admin";
import {
  AdminErrorMessage,
  AdminLoadingMessage,
  AdminPageHeader,
  AdminTableEmpty,
} from "@/Components/Admin/AdminUi";
import { SubjectDetailsModal } from "@/Components/Admin/Subjects/SubjectDetailsModal";
import { SubjectFilters } from "@/Components/Admin/Subjects/SubjectFilters";
import { SubjectFormModal } from "@/Components/Admin/Subjects/SubjectFormModal";
import { SubjectTable } from "@/Components/Admin/Subjects/SubjectTable";

const defaultQuery = {
  q: "",
  categoryId: "all",
  isActive: "all",
  sortBy: "name_asc" as AdminMasterSortOption,
  page: 1,
  limit: 10,
};

const blankForm: AdminSubjectUpsertInput = {
  categoryId: "",
  name: "",
  description: "",
  iconUrl: null,
  iconPublicId: null,
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

export default function AdminSubjectsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseQueryParams(searchParams), [searchParams]);

  const [data, setData] = useState<AdminSubjectsResponse | null>(null);
  const [categories, setCategories] = useState<AdminCategoriesResponse["categories"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query.q);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [viewingSubject, setViewingSubject] =
    useState<AdminSubjectsResponse["subjects"][number] | null>(null);
  const [form, setForm] = useState<AdminSubjectUpsertInput>(blankForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rowActionId, setRowActionId] = useState<string | null>(null);
  const [pendingUploadedIcon, setPendingUploadedIcon] = useState<UploadedImageResult | null>(
    null
  );
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

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

  async function loadPageData() {
    setIsLoading(true);

    try {
      const [subjectsResult, categoriesResult] = await Promise.all([
        getAdminSubjects({
          q: query.q || undefined,
          categoryId: query.categoryId === "all" ? undefined : query.categoryId,
          isActive: query.isActive === "all" ? undefined : query.isActive === "true",
          sortBy: query.sortBy,
          page: query.page,
          limit: query.limit,
        }),
        getAdminCategories({
          sortBy: "name_asc",
          page: 1,
          limit: 100,
        }),
      ]);

      setData(subjectsResult);
      setCategories(categoriesResult.categories);
      setErrorMessage(null);
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

  async function rollbackPendingIcon() {
    if (!pendingUploadedIcon) {
      return;
    }

    try {
      await deleteUploadedAsset({
        publicId: pendingUploadedIcon.publicId,
        resourceType: pendingUploadedIcon.resourceType,
        deleteToken: pendingUploadedIcon.deleteToken,
      });
    } catch {
      // Best-effort cleanup only.
    } finally {
      setPendingUploadedIcon(null);
    }
  }

  function openCreateModal() {
    setEditingSubjectId(null);
    setForm({
      ...blankForm,
      categoryId: categories[0]?.id ?? "",
    });
    setIsModalOpen(true);
  }

  function openEditModal(subject: AdminSubjectsResponse["subjects"][number]) {
    setEditingSubjectId(subject.id);
    setForm({
      categoryId: subject.categoryId,
      name: subject.name,
      description: subject.description ?? "",
      iconUrl: subject.iconUrl,
      iconPublicId: subject.iconPublicId,
    });
    setIsModalOpen(true);
  }

  async function closeModal() {
    if (isSubmitting) {
      return;
    }

    await rollbackPendingIcon();
    setIsModalOpen(false);
    setEditingSubjectId(null);
    setForm(blankForm);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({
      q: searchInput,
      page: 1,
    });
  }

  async function handleIconUpload(file: File) {
    setIsUploadingIcon(true);

    try {
      const uploaded = await uploadImage(file);

      if (pendingUploadedIcon) {
        await deleteUploadedAsset({
          publicId: pendingUploadedIcon.publicId,
          resourceType: pendingUploadedIcon.resourceType,
          deleteToken: pendingUploadedIcon.deleteToken,
        }).catch(() => undefined);
      }

      setPendingUploadedIcon(uploaded);
      setForm((current) => ({
        ...current,
        iconUrl: uploaded.secureUrl,
        iconPublicId: uploaded.publicId,
      }));
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Upload failed",
        text:
          error instanceof ImageUploadError
            ? error.message
            : "We couldn't upload this subject icon right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsUploadingIcon(false);
    }
  }

  async function handleRemoveIcon() {
    await rollbackPendingIcon();
    setForm((current) => ({
      ...current,
      iconUrl: null,
      iconPublicId: null,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingSubjectId) {
        await updateAdminSubject(editingSubjectId, form);
      } else {
        await createAdminSubject(form);
      }

      setPendingUploadedIcon(null);
      setIsModalOpen(false);
      setEditingSubjectId(null);
      setForm(blankForm);
      await loadPageData();
      await Swal.fire({
        icon: "success",
        title: editingSubjectId ? "Subject updated" : "Subject created",
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

  async function handleToggleActive(subject: AdminSubjectsResponse["subjects"][number]) {
    const nextIsActive = !subject.isActive;
    const confirmation = await Swal.fire({
      icon: "warning",
      title: nextIsActive ? "Activate this subject?" : "Archive this subject?",
      text: nextIsActive
        ? `${subject.name} will become selectable and visible where active subjects are shown.`
        : `${subject.name} will be hidden from new tutor selections, but existing tutor links will remain.`,
      showCancelButton: true,
      confirmButtonText: nextIsActive ? "Activate subject" : "Archive subject",
      cancelButtonText: "Cancel",
      confirmButtonColor: nextIsActive ? "#1d3b66" : "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setRowActionId(subject.id);

    try {
      await updateAdminSubject(subject.id, {
        categoryId: subject.categoryId,
        name: subject.name,
        description: subject.description,
        iconUrl: subject.iconUrl,
        iconPublicId: subject.iconPublicId,
        isActive: nextIsActive,
      });
      await loadPageData();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Status update failed",
        text:
          error instanceof AdminApiError
            ? error.message
            : "We couldn't update this subject right now.",
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setRowActionId(null);
    }
  }

  async function handleDelete(subject: AdminSubjectsResponse["subjects"][number]) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this subject?",
      text: `${subject.name} will be removed permanently if it is not linked to tutors.`,
      showCancelButton: true,
      confirmButtonText: "Delete subject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#9f1d1d",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setRowActionId(subject.id);

    try {
      await deleteAdminSubject(subject.id);
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
    } finally {
      setRowActionId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Manage subjects"
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary"
          >
            <Plus className="h-4 w-4" />
            Add Subject
          </button>
        }
      />

      <SubjectFilters
        searchInput={searchInput}
        categoryId={query.categoryId}
        isActive={query.isActive}
        sortBy={query.sortBy}
        categories={categories}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onCategoryChange={(value) => updateQuery({ categoryId: value, page: 1 })}
        onStatusChange={(value) => updateQuery({ isActive: value, page: 1 })}
        onSortChange={(value) => updateQuery({ sortBy: value, page: 1 })}
      />

      <div className="mt-6">
        {errorMessage ? <AdminErrorMessage message={errorMessage} /> : null}

        {isLoading ? (
          <AdminLoadingMessage label="Loading subjects..." />
        ) : data && data.subjects.length > 0 ? (
          <SubjectTable
            subjects={data.subjects}
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            rowActionId={rowActionId}
            onView={setViewingSubject}
            onEdit={openEditModal}
            onToggleActive={(subject) => {
              void handleToggleActive(subject);
            }}
            onDelete={(subject) => {
              void handleDelete(subject);
            }}
            onPageChange={(page) => updateQuery({ page })}
          />
        ) : (
          <AdminTableEmpty
            title="No subjects match the current filters"
            description="Create a subject or widen the filters to bring more results into the table."
          />
        )}
      </div>

      <SubjectFormModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        isEditing={Boolean(editingSubjectId)}
        isUploadingIcon={isUploadingIcon}
        form={form}
        categories={categories}
        onClose={() => {
          void closeModal();
        }}
        onChange={setForm}
        onSubmit={handleSubmit}
        onUploadIcon={(file) => {
          void handleIconUpload(file);
        }}
        onRemoveIcon={() => {
          void handleRemoveIcon();
        }}
      />

      <SubjectDetailsModal
        subject={viewingSubject}
        onClose={() => setViewingSubject(null)}
      />
    </div>
  );
}
