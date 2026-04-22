"use client";

import type { AdminDegreeUpsertInput } from "@/types/admin";
import { AdminModal, AdminSelectField } from "@/Components/Admin/AdminUi";

export function DegreeFormModal({
  isOpen,
  isSubmitting,
  isEditing,
  form,
  onClose,
  onChange,
  onSubmit,
  categories,
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  form: AdminDegreeUpsertInput;
  categories: Array<{ id: string; name: string }>;
  onClose: () => void;
  onChange: (next: AdminDegreeUpsertInput) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AdminModal
      isOpen={isOpen}
      title={isEditing ? "Edit degree" : "Add degree"}
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
          placeholder="Degree name"
          required
        />
        <input
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm"
          value={form.level ?? ""}
          onChange={(event) =>
            onChange({
              ...form,
              level: event.target.value,
            })
          }
          placeholder="Level (optional)"
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
                ? "Update degree"
                : "Create degree"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
