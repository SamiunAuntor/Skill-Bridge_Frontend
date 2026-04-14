import {
  TutorEditableProfileResponse,
  TutorProfileUpdateInput,
} from "@/types/tutor";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export class TutorProfileApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "TutorProfileApiError";
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
    throw new TutorProfileApiError(
      response.status,
      payload?.message || "Unable to complete tutor profile request."
    );
  }

  if (!payload || !("data" in payload)) {
    throw new TutorProfileApiError(500, "Unexpected tutor profile API response.");
  }

  return payload.data;
}

export async function getMyTutorProfile(): Promise<TutorEditableProfileResponse> {
  const response = await fetch(`${apiBaseUrl}/api/tutors/profile`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<TutorEditableProfileResponse>(response);
}

export async function updateMyTutorProfile(
  payload: TutorProfileUpdateInput
): Promise<TutorEditableProfileResponse> {
  const response = await fetch(`${apiBaseUrl}/api/tutors/profile`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<TutorEditableProfileResponse>(response);
}
