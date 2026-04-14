import {
  TutorCategory,
  TutorDetailResponse,
  TutorListFilters,
  TutorListResponse,
  TutorSortOption,
} from "@/types/tutor";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export class TutorApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "TutorApiError";
    this.statusCode = statusCode;
  }
}

interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

function buildSearchParams(filters: Partial<TutorListFilters>): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (filters.subject) searchParams.set("subject", filters.subject);
  if (typeof filters.minPrice === "number") {
    searchParams.set("minPrice", String(filters.minPrice));
  }
  if (typeof filters.maxPrice === "number") {
    searchParams.set("maxPrice", String(filters.maxPrice));
  }
  if (typeof filters.minRating === "number") {
    searchParams.set("minRating", String(filters.minRating));
  }
  if (typeof filters.availability === "boolean") {
    searchParams.set("availability", String(filters.availability));
  }
  if (filters.sortBy) searchParams.set("sortBy", filters.sortBy);
  if (typeof filters.page === "number") {
    searchParams.set("page", String(filters.page));
  }
  if (typeof filters.limit === "number") {
    searchParams.set("limit", String(filters.limit));
  }

  return searchParams;
}

async function fetchTutorApi<T>(
  path: string,
  revalidateSeconds = 60
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    next: {
      revalidate: revalidateSeconds,
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | BackendEnvelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new TutorApiError(
      response.status,
      payload?.message || "Unable to fetch tutor data."
    );
  }

  if (!payload || !("data" in payload)) {
    throw new TutorApiError(500, "Unexpected tutor API response.");
  }

  return payload.data;
}

export async function getTutors(
  filters: Partial<TutorListFilters>
): Promise<TutorListResponse> {
  const searchParams = buildSearchParams(filters);
  const queryString = searchParams.toString();

  return fetchTutorApi<TutorListResponse>(
    `/api/tutors${queryString ? `?${queryString}` : ""}`,
    60
  );
}

export async function getTutorById(id: string): Promise<TutorDetailResponse> {
  return fetchTutorApi<TutorDetailResponse>(`/api/tutors/${id}`, 60);
}

export async function getTutorSubjectOptions(): Promise<TutorCategory[]> {
  const listResponse = await getTutors({
    page: 1,
    limit: 100,
    sortBy: "recommended",
  });

  const uniqueSubjects = new Map<string, TutorCategory>();

  for (const tutor of listResponse.tutors) {
    for (const category of tutor.categories) {
      if (!uniqueSubjects.has(category.slug)) {
        uniqueSubjects.set(category.slug, category);
      }
    }
  }

  return [...uniqueSubjects.values()].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

export const tutorSortLabels: Record<TutorSortOption, string> = {
  recommended: "Recommended",
  highest_rated: "Highest Rated",
  lowest_rated: "Lowest Rated",
  lowest_price: "Price: Low to High",
  highest_price: "Price: High to Low",
  most_reviewed: "Most Reviewed",
};
