import { getApiBaseUrl } from "@/lib/api-url";
import { notifyAuthExpired } from "@/lib/auth/events";

const apiBaseUrl = getApiBaseUrl();

export class AppApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppApiError";
    this.statusCode = statusCode;
  }
}

export type BackendEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function requestJson<T>(
  path: string,
  options: {
    init?: RequestInit;
    fallbackMessage: string;
    authFailureMessage?: string;
    onUnauthorized?: "notify";
  }
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options.init,
  });
  const payload = (await response.json().catch(() => null)) as
    | BackendEnvelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    if (response.status === 401 && options.onUnauthorized === "notify") {
      notifyAuthExpired();
    }

    throw new AppApiError(
      response.status,
      payload?.message ||
        (response.status === 401
          ? options.authFailureMessage ||
            "Your session has expired. Please sign in again."
          : options.fallbackMessage)
    );
  }

  if (!payload || !("data" in payload)) {
    throw new AppApiError(500, "Unexpected API response.");
  }

  return payload.data;
}
