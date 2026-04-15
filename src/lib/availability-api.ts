import { AvailabilityListResponse, AvailabilitySlotItem } from "@/types/tutor";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export class AvailabilityApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AvailabilityApiError";
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
        ? "Something went wrong while updating availability. Please try again."
        : "Unable to complete availability request.";

    throw new AvailabilityApiError(
      response.status,
      payload?.message || fallbackMessage
    );
  }

  if (!payload || !("data" in payload)) {
    throw new AvailabilityApiError(500, "Unexpected availability API response.");
  }

  return payload.data;
}

export async function getMyAvailability(): Promise<AvailabilityListResponse> {
  const response = await fetch(`${apiBaseUrl}/api/availability/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<AvailabilityListResponse>(response);
}

export async function createAvailabilitySlot(payload: {
  startAt: string;
  endAt: string;
}): Promise<AvailabilitySlotItem> {
  const response = await fetch(`${apiBaseUrl}/api/availability/me`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<AvailabilitySlotItem>(response);
}

export async function deleteAvailabilitySlot(slotId: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/availability/me/${slotId}`, {
    method: "DELETE",
    credentials: "include",
  });

  await parseApiResponse<null>(response);
}

export async function getTutorAvailability(
  tutorId: string
): Promise<AvailabilityListResponse> {
  const response = await fetch(`${apiBaseUrl}/api/availability/tutor/${tutorId}`, {
    cache: "no-store",
  });

  return parseApiResponse<AvailabilityListResponse>(response);
}
