"use client";

import type { AdminCategoryUpsertInput } from "@/types/admin";
import { AdminModal } from "@/Components/Admin/AdminUi";

export function CategoryFormModal({
  isOpen,
  isSubmitting,
  isEditing,
  form,
  onClose,
  onChange,
  onSubmit,
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  form: AdminCategoryUpsertInput;
  onClose: () => void;
  onChange: (next: AdminCategoryUpsertInput) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AdminModal
      isOpen={isOpen}
      title={isEditing ? "Edit category" : "Add category"}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
          value={form.name}
          onChange={(event) =>
            onChange({
              ...form,
              name: event.target.value,
            })
          }
          placeholder="Category name"
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
            disabled={isSubmitting}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Update category"
                : "Create category"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
