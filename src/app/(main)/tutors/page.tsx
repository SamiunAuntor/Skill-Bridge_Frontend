import TutorCard from "@/Components/Tutors/TutorCard";
import TutorDiscoveryToolbar from "@/Components/Tutors/TutorDiscoveryToolbar";
import TutorFilters from "@/Components/Tutors/TutorFilters";
import TutorPagination from "@/Components/Tutors/TutorPagination";
import {
  TutorApiError,
  getTutorCategoryOptions,
  getTutorSubjectOptions,
  getTutors,
} from "@/lib/tutor-api";
import { TutorListFilters, TutorSortOption } from "@/types/tutor";

export const metadata = {
  title: "Find Tutors | SkillBridge",
  description:
    "Browse public tutor profiles, compare subjects, and find the right mentor on SkillBridge.",
};

type TutorsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStringValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getPositiveNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
}

function parseSearchFilters(
  params: Record<string, string | string[] | undefined>
): TutorListFilters {
  const sortBy = getStringValue(params.sortBy) as TutorSortOption | undefined;
  const minRating = getPositiveNumber(getStringValue(params.minRating));

  return {
    q: getStringValue(params.q)?.trim() || undefined,
    category: getStringValue(params.category)?.toLowerCase(),
    subject: getStringValue(params.subject)?.toLowerCase(),
    minPrice: getPositiveNumber(getStringValue(params.minPrice)),
    maxPrice: getPositiveNumber(getStringValue(params.maxPrice)),
    minRating: minRating && minRating <= 5 ? minRating : undefined,
    sortBy:
      sortBy &&
      [
        "recommended",
        "highest_rated",
        "lowest_rated",
        "lowest_price",
        "highest_price",
        "most_reviewed",
      ].includes(sortBy)
        ? sortBy
        : "recommended",
    page: getPositiveNumber(getStringValue(params.page)) ?? 1,
    limit: getPositiveNumber(getStringValue(params.limit)) ?? 10,
  };
}

function buildPaginationSearchParams(filters: TutorListFilters) {
  return {
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.subject ? { subject: filters.subject } : {}),
    ...(typeof filters.minPrice === "number"
      ? { minPrice: String(filters.minPrice) }
      : {}),
    ...(typeof filters.maxPrice === "number"
      ? { maxPrice: String(filters.maxPrice) }
      : {}),
    ...(typeof filters.minRating === "number"
      ? { minRating: String(filters.minRating) }
      : {}),
    sortBy: filters.sortBy,
    limit: String(filters.limit),
  };
}

export default async function TutorsPage({
  searchParams,
}: TutorsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filters = parseSearchFilters(resolvedSearchParams);
  const [listResult, subjectOptionsResult, categoryOptionsResult] = await Promise.all([
    getTutors(filters)
      .then((data) => ({ data }))
      .catch((error: unknown) => ({ error })),
    getTutorSubjectOptions()
      .then((data) => ({ data }))
      .catch((error: unknown) => ({ error })),
    getTutorCategoryOptions()
      .then((data) => ({ data }))
      .catch((error: unknown) => ({ error })),
  ]);

  if ("error" in listResult || "error" in subjectOptionsResult || "error" in categoryOptionsResult) {
    const listError = "error" in listResult ? listResult.error : undefined;
    const subjectsError =
      "error" in subjectOptionsResult ? subjectOptionsResult.error : undefined;
    const categoriesError =
      "error" in categoryOptionsResult ? categoryOptionsResult.error : undefined;
    const message =
      listError instanceof TutorApiError
        ? listError.message
        : subjectsError instanceof TutorApiError
          ? subjectsError.message
          : categoriesError instanceof TutorApiError
            ? categoriesError.message
          : "Something went wrong while loading tutors.";

    return (
      <section className="px-6 pb-20 pt-8 md:px-8">
        <div className="mx-auto max-w-[1440px] rounded-[1.75rem] bg-error-container p-10 text-center text-on-error-container">
          <h1 className="font-headline text-2xl font-bold">
            Tutors could not be loaded
          </h1>
          <p className="mt-3">{message}</p>
        </div>
      </section>
    );
  }

  const listData = listResult.data;
  const subjectOptions = subjectOptionsResult.data;
  const categoryOptions = categoryOptionsResult.data;
  const activeCategory = categoryOptions.find(
    (category) => category.slug === listData.filters.category
  );
  const activeSubject = subjectOptions.find(
    (subject) => subject.slug === listData.filters.subject
  );

  return (
    <section className="px-6 pb-20 pt-8 md:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 lg:flex-row">
        <TutorFilters
          filters={listData.filters}
          categoryOptions={categoryOptions}
          subjectOptions={subjectOptions}
        />

        <div className="min-w-0 flex-1">
          <header className="mb-10 space-y-5">
            <div>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
                Available Tutors
              </h1>
              <p className="mt-1 text-on-surface-variant">
                Showing {listData.pagination.totalItems} expert mentors
                {activeCategory ? (
                  <>
                    {" "}for{" "}
                    <span className="font-bold text-secondary">
                      {activeCategory.name}
                    </span>
                  </>
                ) : null}
                {activeSubject ? (
                  <>
                    {" "}in{" "}
                    <span className="font-bold text-secondary">
                      {activeSubject.name}
                    </span>
                  </>
                ) : null}
              </p>
            </div>
            <TutorDiscoveryToolbar filters={listData.filters} />
          </header>

          {listData.tutors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {listData.tutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>

              <TutorPagination
                currentPage={listData.pagination.page}
                totalPages={listData.pagination.totalPages}
                searchParams={buildPaginationSearchParams(listData.filters)}
              />
            </>
          ) : (
            <div className="rounded-[1.75rem] bg-surface-container-low p-10 text-center">
              <h2 className="font-headline text-2xl font-bold text-primary">
                No tutors match these filters yet
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">
                Try removing a subject or widening the price range. We&apos;ll
                show matching tutors as soon as the filters align.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
