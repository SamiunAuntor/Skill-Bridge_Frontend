"use client";

import type { AdminCategoriesResponse } from "@/types/admin";
import { AdminModal } from "@/Components/Admin/AdminUi";
import { formatAdminDate } from "@/Components/Admin/admin-formatters";

export function CategoryDetailsModal({
  category,
  onClose,
}: {
  category: AdminCategoriesResponse["categories"][number] | null;
  onClose: () => void;
}) {
  return (
    <AdminModal
      isOpen={Boolean(category)}
      title={category ? category.name : "Category details"}
      onClose={onClose}
    >
      {category ? (
        <div className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Status
              </p>
              <p className="mt-2 font-semibold text-primary">
                {category.isActive ? "Active" : "Archived"}
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Created
              </p>
              <p className="mt-2 font-semibold text-primary">
                {formatAdminDate(category.createdAt)}
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Linked Subjects
              </p>
              <p className="mt-2 font-semibold text-primary">{category.subjectCount}</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Linked Tutors
              </p>
              <p className="mt-2 font-semibold text-primary">{category.tutorCount}</p>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              Description
            </p>
            <p className="mt-2 leading-relaxed text-on-surface">
              {category.description || "No description added yet."}
            </p>
          </div>
        </div>
      ) : null}
    </AdminModal>
  );
}
