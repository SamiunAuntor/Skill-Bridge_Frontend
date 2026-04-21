const API_HINT =
  "We couldn't reach SkillBridge right now. Please try again in a moment.";

export type AuthClientError = {
  status: number;
  statusText?: string;
  message?: string;
};

export function isAuthClientError(value: unknown): value is AuthClientError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    typeof (value as AuthClientError).status === "number"
  );
}

export function formatAuthError(error: unknown): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return API_HINT;
  }
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const msg = (error as { message: string }).message;
    if (msg === "Failed to fetch" || msg.includes("NetworkError")) {
      return API_HINT;
    }
    return msg;
  }
  return "Something went wrong. Please try again.";
}
