function normalizeOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/$/, "");
}

function getConfiguredBackendOrigin(): string | null {
  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_API_BASE_URL) ||
    normalizeOrigin(process.env.NEXT_PUBLIC_BETTER_AUTH_URL) ||
    (process.env.NODE_ENV === "production" ? null : "http://localhost:5000")
  );
}

export function getServerOrigin(): string {
  const explicitAppOrigin =
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeOrigin(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL);

  if (explicitAppOrigin) {
    return explicitAppOrigin;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }

  return getConfiguredBackendOrigin() || getServerOrigin();
}

export function getRequiredBackendOrigin(): string {
  const backendOrigin = getConfiguredBackendOrigin();

  if (backendOrigin) {
    return backendOrigin;
  }

  throw new Error(
    "Missing NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_BETTER_AUTH_URL for the frontend."
  );
}
