import { AppApiError, requestJson } from "@/lib/api-client";
import {
  DashboardSessionSortOption,
  DashboardSessionListResponse,
  SessionReview,
  TutorDashboardSummaryResponse,
  TutorReviewsResponse,
} from "@/types/tutor";

export class BookingApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "BookingApiError";
    this.statusCode = statusCode;
  }
}

function toBookingApiError(error: unknown): BookingApiError {
  if (error instanceof BookingApiError) {
    return error;
  }

  if (error instanceof AppApiError) {
    return new BookingApiError(error.statusCode, error.message);
  }

  return new BookingApiError(500, "Unexpected booking API response.");
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
  try {
    return await requestJson<DashboardSessionListResponse>(
      `/api/bookings/me/sessions${queryString ? `?${queryString}` : ""}`,
      {
        init: {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
        fallbackMessage: "Unable to complete booking request.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toBookingApiError(error);
  }
}

export async function getTutorDashboardSummary(): Promise<TutorDashboardSummaryResponse> {
  try {
    return await requestJson<TutorDashboardSummaryResponse>(
      "/api/bookings/me/tutor-dashboard",
      {
        init: {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
        fallbackMessage: "Unable to complete booking request.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toBookingApiError(error);
  }
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
  try {
    return await requestJson<{
      bookingId: string;
      sessionId: string | null;
      status: "cancelled";
      sessionStatus: "cancelled" | null;
      slotReleased: boolean;
    }>(`/api/bookings/${bookingId}/cancel`, {
      init: {
        method: "PATCH",
        credentials: "include",
      },
      fallbackMessage: "Unable to complete booking request.",
      onUnauthorized: "notify",
    });
  } catch (error) {
    throw toBookingApiError(error);
  }
}

export async function joinSession(bookingId: string): Promise<{
  bookingId: string;
  sessionId: string;
  sessionStatus: "ongoing" | "completed";
  meetingJoinUrl: string;
}> {
  try {
    return await requestJson<{
      bookingId: string;
      sessionId: string;
      sessionStatus: "ongoing" | "completed";
      meetingJoinUrl: string;
    }>(`/api/bookings/${bookingId}/join`, {
      init: {
        method: "POST",
        credentials: "include",
      },
      fallbackMessage: "Unable to complete booking request.",
      onUnauthorized: "notify",
    });
  } catch (error) {
    throw toBookingApiError(error);
  }
}

export async function createReview(payload: {
  bookingId: string;
  rating: number;
  comment: string;
}): Promise<{
  review: SessionReview;
}> {
  try {
    return await requestJson<{ review: SessionReview }>("/api/reviews", {
      init: {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      fallbackMessage: "Unable to complete booking request.",
      onUnauthorized: "notify",
    });
  } catch (error) {
    throw toBookingApiError(error);
  }
}

export async function updateReview(
  reviewId: string,
  payload: {
    rating: number;
    comment: string;
  }
): Promise<{ review: SessionReview }> {
  try {
    return await requestJson<{ review: SessionReview }>(
      `/api/reviews/${reviewId}`,
      {
        init: {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        fallbackMessage: "Unable to complete booking request.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toBookingApiError(error);
  }
}

export async function getReviewById(reviewId: string): Promise<{ review: SessionReview }> {
  try {
    return await requestJson<{ review: SessionReview }>(
      `/api/reviews/${reviewId}`,
      {
        init: {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
        fallbackMessage: "Unable to complete booking request.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toBookingApiError(error);
  }
}

export async function getMyTutorReviews(): Promise<TutorReviewsResponse> {
  try {
    return await requestJson<TutorReviewsResponse>("/api/reviews/me/tutor", {
      init: {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      fallbackMessage: "Unable to complete booking request.",
      onUnauthorized: "notify",
    });
  } catch (error) {
    throw toBookingApiError(error);
  }
}
