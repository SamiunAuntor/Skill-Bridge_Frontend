"use client";

import { Archive, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { AdminCategoriesResponse } from "@/types/admin";
import {
  AdminCard,
  AdminIconActionButton,
  AdminPaginationControls,
} from "@/Components/Admin/AdminUi";
import { formatAdminDate } from "@/Components/Admin/admin-formatters";

export function CategoryTable({
  categories,
  page,
  totalPages,
  rowActionId,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
  onPageChange,
}: {
  categories: AdminCategoriesResponse["categories"];
  page: number;
  totalPages: number;
  rowActionId: string | null;
  onView: (category: AdminCategoriesResponse["categories"][number]) => void;
  onEdit: (category: AdminCategoriesResponse["categories"][number]) => void;
  onToggleActive: (category: AdminCategoriesResponse["categories"][number]) => void;
  onDelete: (category: AdminCategoriesResponse["categories"][number]) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <AdminCard title="Category directory">
      <div className="w-full overflow-x-auto overscroll-x-contain pb-2">
        <table className="min-w-[760px] border border-outline-variant/20 text-left">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              <th className="border border-outline-variant/20 px-4 py-4">Category</th>
              <th className="border border-outline-variant/20 px-4 py-4">Status</th>
              <th className="border border-outline-variant/20 px-4 py-4">Subjects</th>
              <th className="border border-outline-variant/20 px-4 py-4">Tutors</th>
              <th className="border border-outline-variant/20 px-4 py-4">Created</th>
              <th className="border border-outline-variant/20 px-4 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="border border-outline-variant/20 px-4 py-4 font-semibold text-primary">
                  {category.name}
                </td>
                <td className="border border-outline-variant/20 px-4 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                      category.isActive
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {category.isActive ? "Active" : "Archived"}
                  </span>
                </td>
                <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                  {category.subjectCount}
                </td>
                <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                  {category.tutorCount}
                </td>
                <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                  {formatAdminDate(category.createdAt)}
                </td>
                <td className="border border-outline-variant/20 px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <AdminIconActionButton
                      icon={<Eye className="h-4 w-4" />}
                      label="View category"
                      onClick={() => onView(category)}
                    />
                    <AdminIconActionButton
                      icon={<Pencil className="h-4 w-4" />}
                      label="Edit category"
                      variant="primary"
                      onClick={() => onEdit(category)}
                    />
                    <AdminIconActionButton
                      icon={
                        category.isActive ? (
                          <Archive className="h-4 w-4" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )
                      }
                      label={category.isActive ? "Archive category" : "Activate category"}
                      disabled={rowActionId === category.id}
                      onClick={() => onToggleActive(category)}
                    />
                    <AdminIconActionButton
                      icon={<Trash2 className="h-4 w-4" />}
                      label="Delete category"
                      variant="danger"
                      disabled={rowActionId === category.id}
                      onClick={() => onDelete(category)}
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
