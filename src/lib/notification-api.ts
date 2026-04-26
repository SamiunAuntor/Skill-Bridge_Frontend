import type {
  NotificationFeedResponse,
  NotificationUnreadCountResponse,
} from "@/types/notification";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export class NotificationApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "NotificationApiError";
    this.statusCode = statusCode;
  }
}

interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | BackendEnvelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new NotificationApiError(
      response.status,
      payload?.message || "Unable to load notifications right now."
    );
  }

  if (!payload || !("data" in payload)) {
    throw new NotificationApiError(500, "Unexpected notification API response.");
  }

  return payload.data;
}

export async function getMyNotifications(params?: {
  page?: number;
  limit?: number;
  status?: "all" | "unread";
}): Promise<NotificationFeedResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.set("page", String(params.page));
  }

  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }

  if (params?.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${apiBaseUrl}/api/notifications/me${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  return parseApiResponse<NotificationFeedResponse>(response);
}

export async function getUnreadNotificationCount(): Promise<NotificationUnreadCountResponse> {
  const response = await fetch(`${apiBaseUrl}/api/notifications/me/unread-count`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<NotificationUnreadCountResponse>(response);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    credentials: "include",
  });

  await parseApiResponse<{ notification: unknown }>(response);
}

export async function markAllNotificationsAsRead(): Promise<{ updatedCount: number }> {
  const response = await fetch(`${apiBaseUrl}/api/notifications/me/read-all`, {
    method: "PATCH",
    credentials: "include",
  });

  return parseApiResponse<{ updatedCount: number }>(response);
}
