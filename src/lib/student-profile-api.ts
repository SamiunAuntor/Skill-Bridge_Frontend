import { AppApiError, requestJson } from "@/lib/api-client";

export class StudentProfileApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "StudentProfileApiError";
    this.statusCode = statusCode;
  }
}

function toStudentProfileApiError(error: unknown): StudentProfileApiError {
  if (error instanceof StudentProfileApiError) {
    return error;
  }

  if (error instanceof AppApiError) {
    return new StudentProfileApiError(error.statusCode, error.message);
  }

  return new StudentProfileApiError(
    500,
    "Unexpected student profile API response."
  );
}

export async function updateMyStudentProfile(payload: {
  fullName: string;
  profileImageUrl?: string | null;
}): Promise<{
  profile: {
    id: string;
    name: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    image: string | null;
  };
}> {
  try {
    return await requestJson(`/api/students/me/profile`, {
      init: {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      fallbackMessage: "Unable to save your profile changes.",
      onUnauthorized: "notify",
    });
  } catch (error) {
    throw toStudentProfileApiError(error);
  }
}
