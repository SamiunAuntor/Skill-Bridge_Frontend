import { cookies } from "next/headers";
import type { AppAuthSession } from "./session.types";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

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

export async function getServerAuthSession(): Promise<AppAuthSession> {
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
}
