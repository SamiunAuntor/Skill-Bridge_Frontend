import type {
  AdminBookingsQuery,
  AdminBookingsResponse,
  AdminCategoriesQuery,
  AdminCategoriesResponse,
  AdminCategoryUpsertInput,
  AdminDashboardResponse,
  AdminDegreeUpsertInput,
  AdminDegreesQuery,
  AdminDegreesResponse,
  AdminPlatformReviewsQuery,
  AdminPlatformReviewsResponse,
  AdminPlatformReviewStatus,
  AdminSubjectUpsertInput,
  AdminSubjectsQuery,
  AdminSubjectsResponse,
  AdminUsersQuery,
  AdminUsersResponse,
} from "@/types/admin";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export class AdminApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AdminApiError";
    this.statusCode = statusCode;
  }
}

type BackendEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

function toSearchParams(
  input: Record<string, string | number | boolean | undefined>
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  return params;
}

async function parseAdminResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | BackendEnvelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new AdminApiError(
      response.status,
      payload?.message || "Unable to complete admin request."
    );
  }

  if (!payload || !("data" in payload)) {
    throw new AdminApiError(500, "Unexpected admin API response.");
  }

  return payload.data;
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...init,
  });

  return parseAdminResponse<T>(response);
}

export async function getAdminDashboardData(): Promise<AdminDashboardResponse> {
  return adminFetch<AdminDashboardResponse>("/api/admin/dashboard");
}

export async function getAdminUsers(
  query: Partial<AdminUsersQuery>
): Promise<AdminUsersResponse> {
  const params = toSearchParams(query);
  return adminFetch<AdminUsersResponse>(`/api/admin/users?${params.toString()}`);
}

export async function updateAdminUserStatus(
  userId: string,
  isBanned: boolean
): Promise<{ id: string; isBanned: boolean }> {
  return adminFetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isBanned }),
  });
}

export async function getAdminBookings(
  query: Partial<AdminBookingsQuery>
): Promise<AdminBookingsResponse> {
  const params = toSearchParams(query);
  return adminFetch<AdminBookingsResponse>(`/api/admin/bookings?${params.toString()}`);
}

export async function getAdminCategories(
  query: Partial<AdminCategoriesQuery>
): Promise<AdminCategoriesResponse> {
  const params = toSearchParams(query);
  return adminFetch<AdminCategoriesResponse>(
    `/api/admin/categories?${params.toString()}`
  );
}

export async function createAdminCategory(
  payload: AdminCategoryUpsertInput
): Promise<void> {
  await adminFetch("/api/admin/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCategory(
  id: string,
  payload: AdminCategoryUpsertInput
): Promise<void> {
  await adminFetch(`/api/admin/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await adminFetch(`/api/admin/categories/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminSubjects(
  query: Partial<AdminSubjectsQuery>
): Promise<AdminSubjectsResponse> {
  const params = toSearchParams(query);
  return adminFetch<AdminSubjectsResponse>(`/api/admin/subjects?${params.toString()}`);
}

export async function createAdminSubject(
  payload: AdminSubjectUpsertInput
): Promise<void> {
  await adminFetch("/api/admin/subjects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminSubject(
  id: string,
  payload: AdminSubjectUpsertInput
): Promise<void> {
  await adminFetch(`/api/admin/subjects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminSubject(id: string): Promise<void> {
  await adminFetch(`/api/admin/subjects/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminDegrees(
  query: Partial<AdminDegreesQuery>
): Promise<AdminDegreesResponse> {
  const params = toSearchParams(query);
  return adminFetch<AdminDegreesResponse>(`/api/admin/degrees?${params.toString()}`);
}

export async function createAdminDegree(
  payload: AdminDegreeUpsertInput
): Promise<void> {
  await adminFetch("/api/admin/degrees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminDegree(
  id: string,
  payload: AdminDegreeUpsertInput
): Promise<void> {
  await adminFetch(`/api/admin/degrees/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminDegree(id: string): Promise<void> {
  await adminFetch(`/api/admin/degrees/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminPlatformReviews(
  query: Partial<AdminPlatformReviewsQuery>
): Promise<AdminPlatformReviewsResponse> {
  const params = toSearchParams(query);
  return adminFetch<AdminPlatformReviewsResponse>(
    `/api/admin/platform-reviews?${params.toString()}`
  );
}

export async function updateAdminPlatformReviewStatus(
  id: string,
  status: AdminPlatformReviewStatus
): Promise<void> {
  await adminFetch(`/api/admin/platform-reviews/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

export async function deleteAdminPlatformReview(id: string): Promise<void> {
  await adminFetch(`/api/admin/platform-reviews/${id}`, {
    method: "DELETE",
  });
}
