import { cache } from "react";
import { cookies } from "next/headers";
import type { AppAuthSession } from "./session.types";
import { getApiBaseUrl } from "@/lib/api-url";

const apiBaseUrl = getApiBaseUrl();

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

type AuthJsonResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getServerAuthSession = cache(async (): Promise<AppAuthSession> => {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
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
    | AuthJsonResponse<AppAuthSession>
    | null;

  return payload?.data ?? null;
});
