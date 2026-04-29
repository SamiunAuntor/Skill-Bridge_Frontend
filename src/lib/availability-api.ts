import { AppApiError, requestJson } from "@/lib/api-client";
import { AvailabilityListResponse, AvailabilitySlotItem } from "@/types/tutor";

export class AvailabilityApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AvailabilityApiError";
    this.statusCode = statusCode;
  }
}

function toAvailabilityApiError(error: unknown): AvailabilityApiError {
  if (error instanceof AvailabilityApiError) {
    return error;
  }

  if (error instanceof AppApiError) {
    return new AvailabilityApiError(error.statusCode, error.message);
  }

  return new AvailabilityApiError(500, "Unexpected availability API response.");
}

export async function getMyAvailability(): Promise<AvailabilityListResponse> {
  try {
    return await requestJson<AvailabilityListResponse>("/api/availability/me", {
      init: {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      fallbackMessage: "Unable to complete availability request.",
      onUnauthorized: "notify",
    });
  } catch (error) {
    throw toAvailabilityApiError(error);
  }
}

export async function createAvailabilitySlot(payload: {
  startAt: string;
  endAt: string;
}): Promise<AvailabilitySlotItem> {
  try {
    return await requestJson<AvailabilitySlotItem>("/api/availability/me", {
      init: {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      fallbackMessage: "Unable to complete availability request.",
      onUnauthorized: "notify",
    });
  } catch (error) {
    throw toAvailabilityApiError(error);
  }
}

export async function deleteAvailabilitySlot(slotId: string): Promise<void> {
  try {
    await requestJson<null>(`/api/availability/me/${slotId}`, {
      init: {
        method: "DELETE",
        credentials: "include",
      },
      fallbackMessage: "Unable to complete availability request.",
      onUnauthorized: "notify",
    });
  } catch (error) {
    throw toAvailabilityApiError(error);
  }
}

export async function updateAvailabilitySlot(
  slotId: string,
  payload: {
    startAt: string;
    endAt: string;
  }
): Promise<AvailabilitySlotItem> {
  try {
    return await requestJson<AvailabilitySlotItem>(
      `/api/availability/me/${slotId}`,
      {
        init: {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        fallbackMessage: "Unable to complete availability request.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toAvailabilityApiError(error);
  }
}

export async function getTutorAvailability(
  tutorId: string
): Promise<AvailabilityListResponse> {
  try {
    return await requestJson<AvailabilityListResponse>(
      `/api/availability/tutor/${tutorId}`,
      {
        init: {
          cache: "no-store",
        },
        fallbackMessage: "Unable to complete availability request.",
      }
    );
  } catch (error) {
    throw toAvailabilityApiError(error);
  }
}
