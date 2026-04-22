"use client";

import type {
  AdminCategoriesResponse,
  AdminSubjectUpsertInput,
} from "@/types/admin";
import { AdminModal, AdminSelectField } from "@/Components/Admin/AdminUi";
import { SubjectIconUploadField } from "@/Components/Admin/Subjects/SubjectIconUploadField";

export function SubjectFormModal({
  isOpen,
  isSubmitting,
  isEditing,
  isUploadingIcon,
  form,
  categories,
  onClose,
  onChange,
  onSubmit,
  onUploadIcon,
  onRemoveIcon,
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  isUploadingIcon: boolean;
  form: AdminSubjectUpsertInput;
  categories: AdminCategoriesResponse["categories"];
  onClose: () => void;
  onChange: (next: AdminSubjectUpsertInput) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUploadIcon: (file: File) => void;
  onRemoveIcon: () => void;
}) {
  return (
    <AdminModal
      isOpen={isOpen}
      title={isEditing ? "Edit subject" : "Add subject"}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <AdminSelectField
          value={form.categoryId ?? ""}
          onChange={(value) =>
            onChange({
              ...form,
              categoryId: value,
            })
          }
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </AdminSelectField>

        <input
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
          value={form.name}
          onChange={(event) =>
            onChange({
              ...form,
              name: event.target.value,
            })
          }
          placeholder="Subject name"
          required
        />

        <textarea
          className="min-h-32 w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
          value={form.description ?? ""}
          onChange={(event) =>
            onChange({
              ...form,
              description: event.target.value,
            })
          }
          placeholder="Description"
        />

        <SubjectIconUploadField
          iconUrl={form.iconUrl}
          isUploading={isUploadingIcon}
          onUpload={onUploadIcon}
          onRemove={onRemoveIcon}
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-5 py-3 text-sm font-semibold text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !form.categoryId || !form.name.trim()}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Update subject"
                : "Create subject"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
