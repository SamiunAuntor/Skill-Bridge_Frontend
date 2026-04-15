const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export class StudentProfileApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "StudentProfileApiError";
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
        ? "Unable to update your profile right now. Please try again."
        : "Unable to save your profile changes.";

    throw new StudentProfileApiError(
      response.status,
      payload?.message || fallbackMessage
    );
  }

  if (!payload || !("data" in payload)) {
    throw new StudentProfileApiError(
      500,
      "Unexpected student profile API response."
    );
  }

  return payload.data;
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
  const response = await fetch(`${apiBaseUrl}/api/students/me/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}
