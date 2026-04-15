import {
  BookingConfirmationResponse,
  DashboardSessionListResponse,
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
    throw new BookingApiError(
      response.status,
      payload?.message || "Unable to complete booking request."
    );
  }

  if (!payload || !("data" in payload)) {
    throw new BookingApiError(500, "Unexpected booking API response.");
  }

  return payload.data;
}

export async function createBooking(payload: {
  tutorId: string;
  slotId: string;
}): Promise<BookingConfirmationResponse> {
  const response = await fetch(`${apiBaseUrl}/api/bookings`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<BookingConfirmationResponse>(response);
}

export async function getMySessions(): Promise<DashboardSessionListResponse> {
  const response = await fetch(`${apiBaseUrl}/api/bookings/me/sessions`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<DashboardSessionListResponse>(response);
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
