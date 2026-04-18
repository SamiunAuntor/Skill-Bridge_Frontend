"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@/types/auth";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

const authChangedEvent = "skillbridge-auth-changed";

export type AppAuthUser = {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
};

export type AppAuthSession = {
  user: AppAuthUser;
} | null;

type AuthJsonResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function readJson<T>(response: Response): Promise<AuthJsonResponse<T>> {
  const payload = (await response.json().catch(() => null)) as
    | AuthJsonResponse<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      (payload && "message" in payload && payload.message) ||
        "We couldn't complete this request right now."
    );
  }

  return payload as AuthJsonResponse<T>;
}

async function authRequest<T>(
  path: string,
  init?: RequestInit
): Promise<AuthJsonResponse<T>> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return readJson<T>(response);
}

export function notifyAuthChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(authChangedEvent));
  }
}

export async function loginWithAppAuth(input: {
  email: string;
  password: string;
}): Promise<AppAuthUser> {
  const result = await authRequest<{ user: AppAuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  notifyAuthChanged();
  return result.data.user;
}

export async function registerWithAppAuth(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  callbackURL?: string;
}): Promise<void> {
  await authRequest<{ email: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logoutWithAppAuth(): Promise<void> {
  await authRequest<null>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
  notifyAuthChanged();
}

export async function resetPasswordWithAppAuth(input: {
  token: string;
  newPassword: string;
}): Promise<void> {
  await authRequest<null>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getAppAuthSession(): Promise<AppAuthSession> {
  try {
    const result = await authRequest<AppAuthSession>("/api/auth/me", {
      method: "GET",
    });

    if (!result.data) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

export function useAppAuthSession(): {
  data: AppAuthSession;
  isPending: boolean;
} {
  const [data, setData] = useState<AppAuthSession>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession(showPending = false) {
      if (showPending) {
        setIsPending(true);
      }

      const nextSession = await getAppAuthSession();
      if (isMounted) {
        setData(nextSession);
        setIsPending(false);
      }
    }

    void loadSession(true);

    const handleAuthChange = () => {
      void loadSession();
    };

    window.addEventListener(authChangedEvent, handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener(authChangedEvent, handleAuthChange);
    };
  }, []);

  return {
    data,
    isPending,
  };
}
