"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { AdminSubjectsResponse } from "@/types/admin";
import { AdminModal } from "@/Components/Admin/AdminUi";
import { formatAdminDate } from "@/Components/Admin/admin-formatters";

export function SubjectDetailsModal({
  subject,
  onClose,
}: {
  subject: AdminSubjectsResponse["subjects"][number] | null;
  onClose: () => void;
}) {
  return (
    <AdminModal
      isOpen={Boolean(subject)}
      title={subject ? subject.name : "Subject details"}
      onClose={onClose}
    >
      {subject ? (
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-4 rounded-xl bg-surface-container-lowest p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high">
              {subject.iconUrl ? (
                <Image
                  src={subject.iconUrl}
                  alt={`${subject.name} icon`}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
              ) : (
                <BookOpen className="h-5 w-5 text-on-surface-variant" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Category
              </p>
              <p className="mt-2 font-semibold text-primary">{subject.categoryName}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Status
              </p>
              <p className="mt-2 font-semibold text-primary">
                {subject.isActive ? "Active" : "Archived"}
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Tutors
              </p>
              <p className="mt-2 font-semibold text-primary">{subject.tutorCount}</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Created
              </p>
              <p className="mt-2 font-semibold text-primary">
                {formatAdminDate(subject.createdAt)}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              Description
            </p>
            <p className="mt-2 leading-relaxed text-on-surface">
              {subject.description || "No description added yet."}
            </p>
          </div>
        </div>
      ) : null}
    </AdminModal>
  );
}
