"use client";

import Image from "next/image";
import { Archive, BookOpen, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { AdminSubjectsResponse } from "@/types/admin";
import {
  AdminCard,
  AdminIconActionButton,
  AdminPaginationControls,
} from "@/Components/Admin/AdminUi";
import { formatAdminDate } from "@/Components/Admin/admin-formatters";

export function SubjectTable({
  subjects,
  page,
  totalPages,
  rowActionId,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
  onPageChange,
}: {
  subjects: AdminSubjectsResponse["subjects"];
  page: number;
  totalPages: number;
  rowActionId: string | null;
  onView: (subject: AdminSubjectsResponse["subjects"][number]) => void;
  onEdit: (subject: AdminSubjectsResponse["subjects"][number]) => void;
  onToggleActive: (subject: AdminSubjectsResponse["subjects"][number]) => void;
  onDelete: (subject: AdminSubjectsResponse["subjects"][number]) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <AdminCard title="Subject directory">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-outline-variant/20 text-left">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              <th className="border border-outline-variant/20 px-4 py-4">Subject</th>
              <th className="border border-outline-variant/20 px-4 py-4">Category</th>
              <th className="border border-outline-variant/20 px-4 py-4">Status</th>
              <th className="border border-outline-variant/20 px-4 py-4">Tutors</th>
              <th className="border border-outline-variant/20 px-4 py-4">Created</th>
              <th className="border border-outline-variant/20 px-4 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td className="border border-outline-variant/20 px-4 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-container-high">
                      {subject.iconUrl ? (
                        <Image
                          src={subject.iconUrl}
                          alt={`${subject.name} icon`}
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <BookOpen className="h-5 w-5 text-on-surface-variant" />
                      )}
                    </div>
                    <p className="font-semibold text-primary">{subject.name}</p>
                  </div>
                </td>
                <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                  {subject.categoryName}
                </td>
                <td className="border border-outline-variant/20 px-4 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                      subject.isActive
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {subject.isActive ? "Active" : "Archived"}
                  </span>
                </td>
                <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                  {subject.tutorCount}
                </td>
                <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                  {formatAdminDate(subject.createdAt)}
                </td>
                <td className="border border-outline-variant/20 px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <AdminIconActionButton
                      icon={<Eye className="h-4 w-4" />}
                      label="View subject"
                      onClick={() => onView(subject)}
                    />
                    <AdminIconActionButton
                      icon={<Pencil className="h-4 w-4" />}
                      label="Edit subject"
                      variant="primary"
                      onClick={() => onEdit(subject)}
                    />
                    <AdminIconActionButton
                      icon={
                        subject.isActive ? (
                          <Archive className="h-4 w-4" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )
                      }
                      label={subject.isActive ? "Archive subject" : "Activate subject"}
                      disabled={rowActionId === subject.id}
                      onClick={() => onToggleActive(subject)}
                    />
                    <AdminIconActionButton
                      icon={<Trash2 className="h-4 w-4" />}
                      label="Delete subject"
                      variant="danger"
                      disabled={rowActionId === subject.id}
                      onClick={() => onDelete(subject)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPaginationControls
        page={page}
        totalPages={totalPages}
        onChange={onPageChange}
      />
    </AdminCard>
  );
}
