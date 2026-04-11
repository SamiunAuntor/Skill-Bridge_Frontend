const API_HINT =
  "Start the SkillBridge API (e.g. cd Skill-Bridge_Backend && npm run dev) and set NEXT_PUBLIC_BETTER_AUTH_URL to match (default http://localhost:5000).";

/** Returned on failed Better Auth client calls (better-fetch). */
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
    return `Cannot reach the server. ${API_HINT}`;
  }
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const msg = (error as { message: string }).message;
    if (msg === "Failed to fetch" || msg.includes("NetworkError")) {
      return `Cannot reach the server. ${API_HINT}`;
    }
    return msg;
  }
  return "Something went wrong. Please try again.";
}
