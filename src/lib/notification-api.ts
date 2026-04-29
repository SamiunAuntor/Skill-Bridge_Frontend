import { AppApiError, requestJson } from "@/lib/api-client";
import type {
  NotificationFeedResponse,
  NotificationUnreadCountResponse,
} from "@/types/notification";

export class NotificationApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "NotificationApiError";
    this.statusCode = statusCode;
  }
}

function toNotificationApiError(error: unknown): NotificationApiError {
  if (error instanceof NotificationApiError) {
    return error;
  }

  if (error instanceof AppApiError) {
    return new NotificationApiError(error.statusCode, error.message);
  }

  return new NotificationApiError(500, "Unexpected notification API response.");
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
  try {
    return await requestJson<NotificationFeedResponse>(
      `/api/notifications/me${queryString ? `?${queryString}` : ""}`,
      {
        init: {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
        fallbackMessage: "Unable to load notifications right now.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toNotificationApiError(error);
  }
}

export async function getUnreadNotificationCount(): Promise<NotificationUnreadCountResponse> {
  try {
    return await requestJson<NotificationUnreadCountResponse>(
      "/api/notifications/me/unread-count",
      {
        init: {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
        fallbackMessage: "Unable to load notifications right now.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toNotificationApiError(error);
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await requestJson<{ notification: unknown }>(
      `/api/notifications/${notificationId}/read`,
      {
        init: {
          method: "PATCH",
          credentials: "include",
        },
        fallbackMessage: "Unable to load notifications right now.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toNotificationApiError(error);
  }
}

export async function markAllNotificationsAsRead(): Promise<{ updatedCount: number }> {
  try {
    return await requestJson<{ updatedCount: number }>(
      "/api/notifications/me/read-all",
      {
        init: {
          method: "PATCH",
          credentials: "include",
        },
        fallbackMessage: "Unable to load notifications right now.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toNotificationApiError(error);
  }
}
