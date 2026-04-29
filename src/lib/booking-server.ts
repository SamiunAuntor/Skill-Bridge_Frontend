import { cache } from "react";
import { cookies } from "next/headers";
import { getApiBaseUrl } from "@/lib/api-url";
import type {
  DashboardSessionListResponse,
  TutorDashboardSummaryResponse,
} from "@/types/tutor";

const apiBaseUrl = getApiBaseUrl();

type AuthJsonResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

async function getProtectedJson<T>(path: string): Promise<T | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "GET",
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as
    | AuthJsonResponse<T>
    | null;

  return payload?.data ?? null;
}

export const getServerDashboardSessions = cache(async () => {
  return getProtectedJson<DashboardSessionListResponse>("/api/bookings/me/sessions");
});

export const getServerTutorDashboardSummary = cache(async () => {
  return getProtectedJson<TutorDashboardSummaryResponse>(
    "/api/bookings/me/tutor-dashboard"
  );
});
