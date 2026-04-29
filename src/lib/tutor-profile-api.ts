import { AppApiError, requestJson } from "@/lib/api-client";
import {
  TutorEditableProfileResponse,
  TutorProfileUpdateInput,
} from "@/types/tutor";

export class TutorProfileApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "TutorProfileApiError";
    this.statusCode = statusCode;
  }
}

function toTutorProfileApiError(error: unknown): TutorProfileApiError {
  if (error instanceof TutorProfileApiError) {
    return error;
  }

  if (error instanceof AppApiError) {
    return new TutorProfileApiError(error.statusCode, error.message);
  }

  return new TutorProfileApiError(500, "Unexpected tutor profile API response.");
}

export async function getMyTutorProfile(): Promise<TutorEditableProfileResponse> {
  try {
    return await requestJson<TutorEditableProfileResponse>("/api/tutors/profile", {
      init: {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      fallbackMessage: "Unable to complete tutor profile request.",
      onUnauthorized: "notify",
    });
  } catch (error) {
    throw toTutorProfileApiError(error);
  }
}

export async function updateMyTutorProfile(
  payload: TutorProfileUpdateInput
): Promise<TutorEditableProfileResponse> {
  try {
    return await requestJson<TutorEditableProfileResponse>("/api/tutors/profile", {
      init: {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      fallbackMessage: "Unable to complete tutor profile request.",
      onUnauthorized: "notify",
    });
  } catch (error) {
    throw toTutorProfileApiError(error);
  }
}
