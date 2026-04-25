import {
  TutorCategory,
  TutorDetailResponse,
  TutorListFilters,
  TutorListResponse,
  TutorSubject,
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

  if (filters.q) searchParams.set("q", filters.q);
  if (filters.category) searchParams.set("category", filters.category);
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

export async function getTutorSubjectOptions(): Promise<TutorSubject[]> {
  return fetchTutorApi<TutorSubject[]>(`/api/tutors/subjects`, 300);
}

export async function getTutorCategoryOptions(): Promise<TutorCategory[]> {
  return fetchTutorApi<TutorCategory[]>(`/api/tutors/categories`, 300);
}

export const tutorSortLabels: Record<TutorSortOption, string> = {
  recommended: "Recommended",
  highest_rated: "Highest Rated",
  lowest_rated: "Lowest Rated",
  lowest_price: "Price: Low to High",
  highest_price: "Price: High to Low",
  most_reviewed: "Most Reviewed",
};
