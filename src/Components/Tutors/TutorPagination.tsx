import Link from "next/link";

type TutorPaginationProps = {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

function buildPageLink(
  page: number,
  searchParams: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set("page", String(page));
  return `/tutors?${params.toString()}`;
}

function buildVisiblePages(currentPage: number, totalPages: number): number[] {
  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage - 1 > 1) pages.add(currentPage - 1);
  if (currentPage + 1 < totalPages) pages.add(currentPage + 1);
  if (currentPage - 2 > 1) pages.add(currentPage - 2);
  if (currentPage + 2 < totalPages) pages.add(currentPage + 2);

  return [...pages].sort((left, right) => left - right);
}

function buildPaginationItems(
  currentPage: number,
  totalPages: number
): Array<number | "gap"> {
  const visiblePages = buildVisiblePages(currentPage, totalPages);
  const items: Array<number | "gap"> = [];

  visiblePages.forEach((page, index) => {
    const previousPage = visiblePages[index - 1];

    if (typeof previousPage === "number" && page - previousPage > 1) {
      items.push("gap");
    }

    items.push(page);
  });

  return items;
}

export default function TutorPagination({
  currentPage,
  totalPages,
  searchParams,
}: TutorPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const paginationItems = buildPaginationItems(currentPage, totalPages);

  return (
    <nav className="mt-14 flex justify-center" aria-label="Tutor pagination">
      <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-2 py-2">
        {currentPage > 1 ? (
          <Link
            href={buildPageLink(currentPage - 1, searchParams)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </Link>
        ) : null}

        {paginationItems.map((item, index) =>
          item === "gap" ? (
            <span
              key={`gap-${index}`}
              className="flex h-10 w-10 items-center justify-center text-sm text-on-surface-variant"
            >
              ...
            </span>
          ) : (
            <Link
              key={item}
              href={buildPageLink(item, searchParams)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                item === currentPage
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {item}
            </Link>
          )
        )}

        {currentPage < totalPages ? (
          <Link
            href={buildPageLink(currentPage + 1, searchParams)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
