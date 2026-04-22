"use client";

import { Archive, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { AdminDegreesResponse } from "@/types/admin";
import {
  AdminCard,
  AdminIconActionButton,
  AdminPaginationControls,
} from "@/Components/Admin/AdminUi";
import { formatAdminDate } from "@/Components/Admin/admin-formatters";

export function DegreeTable({
  degrees,
  page,
  totalPages,
  rowActionId,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
  onPageChange,
}: {
  degrees: AdminDegreesResponse["degrees"];
  page: number;
  totalPages: number;
  rowActionId: string | null;
  onView: (degree: AdminDegreesResponse["degrees"][number]) => void;
  onEdit: (degree: AdminDegreesResponse["degrees"][number]) => void;
  onToggleActive: (degree: AdminDegreesResponse["degrees"][number]) => void;
  onDelete: (degree: AdminDegreesResponse["degrees"][number]) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <AdminCard title="Degree directory">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-outline-variant/20 text-left">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              <th className="border border-outline-variant/20 px-4 py-4">Degree</th>
              <th className="border border-outline-variant/20 px-4 py-4">Status</th>
              <th className="border border-outline-variant/20 px-4 py-4">Usage</th>
              <th className="border border-outline-variant/20 px-4 py-4">Created</th>
              <th className="border border-outline-variant/20 px-4 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {degrees.map((degree) => (
              <tr key={degree.id}>
                <td className="border border-outline-variant/20 px-4 py-4 font-semibold text-primary">
                  {degree.name}
                </td>
                <td className="border border-outline-variant/20 px-4 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                      degree.isActive
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {degree.isActive ? "Active" : "Archived"}
                  </span>
                </td>
                <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                  {degree.usageCount}
                </td>
                <td className="border border-outline-variant/20 px-4 py-4 text-sm text-on-surface-variant">
                  {formatAdminDate(degree.createdAt)}
                </td>
                <td className="border border-outline-variant/20 px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <AdminIconActionButton
                      icon={<Eye className="h-4 w-4" />}
                      label="View degree"
                      onClick={() => onView(degree)}
                    />
                    <AdminIconActionButton
                      icon={<Pencil className="h-4 w-4" />}
                      label="Edit degree"
                      variant="primary"
                      onClick={() => onEdit(degree)}
                    />
                    <AdminIconActionButton
                      icon={
                        degree.isActive ? (
                          <Archive className="h-4 w-4" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )
                      }
                      label={degree.isActive ? "Archive degree" : "Activate degree"}
                      disabled={rowActionId === degree.id}
                      onClick={() => onToggleActive(degree)}
                    />
                    <AdminIconActionButton
                      icon={<Trash2 className="h-4 w-4" />}
                      label="Delete degree"
                      variant="danger"
                      disabled={rowActionId === degree.id}
                      onClick={() => onDelete(degree)}
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
