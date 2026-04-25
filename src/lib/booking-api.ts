import {
  DashboardSessionSortOption,
  DashboardSessionListResponse,
  SessionReview,
  TutorDashboardSummaryResponse,
  TutorReviewsResponse,
} from "@/types/tutor";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export class BookingApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "BookingApiError";
    this.statusCode = statusCode;
  }
}

interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | BackendEnvelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    const fallbackMessage =
      response.status >= 500
        ? "Something went wrong while handling your booking. Please try again."
        : "Unable to complete booking request.";

    throw new BookingApiError(
      response.status,
      payload?.message || fallbackMessage
    );
  }

  if (!payload || !("data" in payload)) {
    throw new BookingApiError(500, "Unexpected booking API response.");
  }

  return payload.data;
}

export async function getMySessions(params?: {
  search?: string;
  sortBy?: DashboardSessionSortOption;
}): Promise<DashboardSessionListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search?.trim()) {
    searchParams.set("q", params.search.trim());
  }

  if (params?.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${apiBaseUrl}/api/bookings/me/sessions${queryString ? `?${queryString}` : ""}`,
    {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    }
  );

  return parseApiResponse<DashboardSessionListResponse>(response);
}

export async function getTutorDashboardSummary(): Promise<TutorDashboardSummaryResponse> {
  const response = await fetch(`${apiBaseUrl}/api/bookings/me/tutor-dashboard`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<TutorDashboardSummaryResponse>(response);
}

export async function cancelBooking(
  bookingId: string
): Promise<{
  bookingId: string;
  sessionId: string | null;
  status: "cancelled";
  sessionStatus: "cancelled" | null;
  slotReleased: boolean;
}> {
  const response = await fetch(`${apiBaseUrl}/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    credentials: "include",
  });

  return parseApiResponse<{
    bookingId: string;
    sessionId: string | null;
    status: "cancelled";
    sessionStatus: "cancelled" | null;
    slotReleased: boolean;
  }>(response);
}

export async function joinSession(bookingId: string): Promise<{
  bookingId: string;
  sessionId: string;
  sessionStatus: "ongoing" | "completed";
  meetingJoinUrl: string;
}> {
  const response = await fetch(`${apiBaseUrl}/api/bookings/${bookingId}/join`, {
    method: "POST",
    credentials: "include",
  });

  return parseApiResponse<{
    bookingId: string;
    sessionId: string;
    sessionStatus: "ongoing" | "completed";
    meetingJoinUrl: string;
  }>(response);
}

export async function createReview(payload: {
  bookingId: string;
  rating: number;
  comment: string;
}): Promise<{
  review: SessionReview;
}> {
  const response = await fetch(`${apiBaseUrl}/api/reviews`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<{ review: SessionReview }>(response);
}

export async function updateReview(
  reviewId: string,
  payload: {
    rating: number;
    comment: string;
  }
): Promise<{ review: SessionReview }> {
  const response = await fetch(`${apiBaseUrl}/api/reviews/${reviewId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<{ review: SessionReview }>(response);
}

export async function getReviewById(reviewId: string): Promise<{ review: SessionReview }> {
  const response = await fetch(`${apiBaseUrl}/api/reviews/${reviewId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<{ review: SessionReview }>(response);
}

export async function getMyTutorReviews(): Promise<TutorReviewsResponse> {
  const response = await fetch(`${apiBaseUrl}/api/reviews/me/tutor`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<TutorReviewsResponse>(response);
}
