"use client";

import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authChangedEvent, notifyAuthChanged } from "@/lib/auth/events";
import type { UserRole } from "@/types/auth";
import type { AppAuthSession, AppAuthUser } from "./session.types";
import { getApiBaseUrl } from "@/lib/api-url";

const apiBaseUrl = getApiBaseUrl();

type AuthJsonResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type { AppAuthSession, AppAuthUser } from "./session.types";
export { notifyAuthChanged } from "@/lib/auth/events";

type AppAuthSessionState = {
  data: AppAuthSession;
  isPending: boolean;
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

export async function changePasswordWithAppAuth(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await authRequest<null>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  notifyAuthChanged();
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

function useManagedAppAuthSession(options?: {
  enabled?: boolean;
  initialData?: AppAuthSession;
  initialPending?: boolean;
}): AppAuthSessionState {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<AppAuthSession>(options?.initialData ?? null);
  const [isPending, setIsPending] = useState(options?.initialPending ?? true);

  useEffect(() => {
    if (!enabled) {
      return;
    }

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

    if (options?.initialPending ?? true) {
      void loadSession(true);
    }

    const handleAuthChange = () => {
      void loadSession();
    };

    window.addEventListener(authChangedEvent, handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener(authChangedEvent, handleAuthChange);
    };
  }, [enabled, options?.initialPending]);

  return {
    data,
    isPending,
  };
}

const AppAuthSessionContext = createContext<AppAuthSessionState | null>(null);

export function AppAuthSessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: AppAuthSession;
}) {
  const sessionState = useManagedAppAuthSession({
    initialData: initialSession,
    initialPending: false,
  });

  return createElement(
    AppAuthSessionContext.Provider,
    {
      value: sessionState,
    },
    children
  );
}

export function useAppAuthSession(): AppAuthSessionState {
  const context = useContext(AppAuthSessionContext);
  const fallbackState = useManagedAppAuthSession({
    enabled: context === null,
  });

  return context ?? fallbackState;
}
