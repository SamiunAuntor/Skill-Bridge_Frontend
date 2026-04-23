const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

type BackendEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export class PlatformReviewApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "PlatformReviewApiError";
    this.statusCode = statusCode;
  }
}

export type PlatformReviewSubmitResult = {
  action: "created" | "updated";
};

async function parsePlatformReviewResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | BackendEnvelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new PlatformReviewApiError(
      response.status,
      payload?.message || "Unable to submit your review right now."
    );
  }

  if (!payload || !("data" in payload)) {
    throw new PlatformReviewApiError(500, "Unexpected review API response.");
  }

  return payload.data;
}

export async function submitPlatformReview(input: {
  rating: number;
  title?: string;
  message: string;
}): Promise<PlatformReviewSubmitResult> {
  const response = await fetch(`${apiBaseUrl}/api/platform-reviews`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return parsePlatformReviewResponse<PlatformReviewSubmitResult>(response);
}
