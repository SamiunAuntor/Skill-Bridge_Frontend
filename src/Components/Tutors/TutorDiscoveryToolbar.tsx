"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { tutorSortLabels } from "@/lib/tutor-api";
import { TutorListFilters, TutorSortOption } from "@/types/tutor";

type TutorDiscoveryToolbarProps = {
  filters: TutorListFilters;
};

export default function TutorDiscoveryToolbar({
  filters,
}: TutorDiscoveryToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.q ?? "");

  function pushParams(updates: Record<string, string | undefined>) {
    startTransition(() => {
      const nextParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      }

      nextParams.delete("page");
      const nextQuery = nextParams.toString();
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushParams({
      q: query.trim() || undefined,
    });
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <form className="flex w-full max-w-2xl gap-3" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="search"
            placeholder="Search tutors, subjects, or categories"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest py-3 pl-11 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-surface-tint/30"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-transform hover:translate-y-[-1px] disabled:opacity-60"
        >
          Search
        </button>
      </form>

      <label className="flex items-center justify-between gap-3 text-sm text-on-surface-variant lg:min-w-[220px] lg:justify-end">
        <span>Sort by:</span>
        <select
          value={filters.sortBy}
          disabled={isPending}
          onChange={(event) =>
            pushParams({
              sortBy: event.target.value as TutorSortOption,
            })
          }
          className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 font-bold text-primary focus:ring-2 focus:ring-surface-tint/30"
        >
          {Object.entries(tutorSortLabels).map(([optionValue, label]) => (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
