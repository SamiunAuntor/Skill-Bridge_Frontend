"use client";

import { Search } from "lucide-react";
import type { AdminMasterSortOption } from "@/types/admin";
import { AdminCard, AdminSelectField } from "@/Components/Admin/AdminUi";

export function CategoryFilters({
  searchInput,
  isActive,
  sortBy,
  onSearchInputChange,
  onSearchSubmit,
  onStatusChange,
  onSortChange,
}: {
  searchInput: string;
  isActive: string;
  sortBy: AdminMasterSortOption;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: AdminMasterSortOption) => void;
}) {
  return (
    <AdminCard title="Filters">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_repeat(2,minmax(0,1fr))]">
        <form onSubmit={onSearchSubmit} className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search by name or description"
          />
        </form>
        <AdminSelectField value={isActive} onChange={onStatusChange}>
          <option value="all">Any status</option>
          <option value="true">Active</option>
          <option value="false">Archived</option>
        </AdminSelectField>
        <AdminSelectField
          value={sortBy}
          onChange={(value) => onSortChange(value as AdminMasterSortOption)}
        >
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </AdminSelectField>
      </div>
    </AdminCard>
  );
}
