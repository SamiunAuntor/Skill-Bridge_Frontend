"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TutorCategory, TutorListFilters, TutorSubject } from "@/types/tutor";

type TutorFiltersProps = {
  filters: TutorListFilters;
  categoryOptions: TutorCategory[];
  subjectOptions: TutorSubject[];
};

type RatingOption = {
  label: string;
  value?: number;
};

const ratingOptions: RatingOption[] = [
  { label: "Any" },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "4.5+", value: 4.5 },
];

function updateParams(
  currentParams: URLSearchParams,
  pathname: string,
  router: ReturnType<typeof useRouter>,
  updates: Record<string, string | undefined>
) {
  const nextParams = new URLSearchParams(currentParams);

  for (const [key, value] of Object.entries(updates)) {
    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
  }

  nextParams.delete("page");
  const query = nextParams.toString();
  router.push(query ? `${pathname}?${query}` : pathname, {
    scroll: false,
  });
}

export default function TutorFilters({
  filters,
  categoryOptions,
  subjectOptions,
}: TutorFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? "");

  const currentParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const selectedCategory = filters.category;
  const selectedCategoryId = categoryOptions.find(
    (category) => category.slug === selectedCategory
  )?.id;
  const selectedSubject = filters.subject;
  const visibleSubjectOptions = selectedCategoryId
    ? subjectOptions.filter((subject) => subject.categoryId === selectedCategoryId)
    : subjectOptions;

  function apply(updates: Record<string, string | undefined>) {
    startTransition(() =>
      updateParams(currentParams, pathname, router, updates)
    );
  }

  function handlePriceSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    apply({
      minPrice,
      maxPrice,
    });
  }

  function handleClearFilters() {
    startTransition(() => {
      setMinPrice("");
      setMaxPrice("");
      router.push(pathname, { scroll: false });
    });
  }

  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0">
      <div className="space-y-8 rounded-2xl bg-surface-container-low p-6 lg:sticky lg:top-28">
        <h2 className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
          <span className="material-symbols-outlined">tune</span>
          Filters
        </h2>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            Category
          </h3>
          <div className="space-y-3">
            {categoryOptions.length > 0 ? (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {categoryOptions.map((category) => {
                  const isActive = selectedCategory === category.slug;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        apply({
                          category: isActive ? undefined : category.slug,
                          subject:
                            isActive ||
                            !selectedSubject ||
                            subjectOptions.some(
                              (subject) =>
                                subject.slug === selectedSubject &&
                                subject.categoryId === category.id
                            )
                              ? selectedSubject
                              : undefined,
                        })
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-container-highest"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                          isActive
                            ? "border-secondary bg-secondary text-on-secondary"
                            : "border-outline-variant bg-surface-container-lowest text-transparent"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          check
                        </span>
                      </span>
                      <span className="text-sm font-medium text-on-surface-variant">
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">
                Category options will appear when tutors are available.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            Subject
          </h3>
          <div className="space-y-3">
            {visibleSubjectOptions.length > 0 ? (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {visibleSubjectOptions.map((subject) => {
                  const isActive = selectedSubject === subject.slug;

                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() =>
                        apply({
                          subject: isActive ? undefined : subject.slug,
                        })
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-container-highest"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                          isActive
                            ? "border-secondary bg-secondary text-on-secondary"
                            : "border-outline-variant bg-surface-container-lowest text-transparent"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          check
                        </span>
                      </span>
                      <span className="text-sm font-medium text-on-surface-variant">
                        {subject.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">
                {selectedCategory
                  ? "No subjects are available for the selected category yet."
                  : "Subject options will appear when tutors are available."}
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            Price Range (Hourly)
          </h3>
          <form className="space-y-3" onSubmit={handlePriceSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                className="rounded-xl border-none bg-surface-container-highest px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-surface-tint/40"
              />
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="rounded-xl border-none bg-surface-container-highest px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-surface-tint/40"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-fixed disabled:opacity-60"
            >
              Apply Price
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            Rating
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {ratingOptions.map((option) => {
              const isActive =
                option.value === undefined
                  ? filters.minRating === undefined
                  : filters.minRating === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() =>
                    apply({
                      minRating:
                        option.value === undefined
                          ? undefined
                          : String(option.value),
                    })
                  }
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-secondary text-on-secondary"
                      : "bg-surface-container-lowest text-primary hover:bg-primary-fixed"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={handleClearFilters}
          disabled={isPending}
          className="w-full rounded-xl bg-primary px-4 py-3 font-headline text-sm font-bold text-on-primary transition-transform hover:translate-y-[-1px] disabled:opacity-60"
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  );
}
