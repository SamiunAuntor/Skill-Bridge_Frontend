"use client";

import type { AdminDegreesResponse } from "@/types/admin";
import { AdminModal } from "@/Components/Admin/AdminUi";
import { formatAdminDate } from "@/Components/Admin/admin-formatters";

export function DegreeDetailsModal({
  degree,
  onClose,
}: {
  degree: AdminDegreesResponse["degrees"][number] | null;
  onClose: () => void;
}) {
  return (
    <AdminModal
      isOpen={Boolean(degree)}
      title={degree ? degree.name : "Degree details"}
      onClose={onClose}
    >
      {degree ? (
        <div className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Status
              </p>
              <p className="mt-2 font-semibold text-primary">
                {degree.isActive ? "Active" : "Archived"}
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Category
              </p>
              <p className="mt-2 font-semibold text-primary">{degree.categoryName}</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Created
              </p>
              <p className="mt-2 font-semibold text-primary">
                {formatAdminDate(degree.createdAt)}
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Usage Count
              </p>
              <p className="mt-2 font-semibold text-primary">{degree.usageCount}</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Level
              </p>
              <p className="mt-2 font-semibold text-primary">
                {degree.level || "No level specified."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </AdminModal>
  );
}
