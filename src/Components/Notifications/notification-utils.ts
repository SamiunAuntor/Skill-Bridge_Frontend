import type { NotificationType } from "@/types/notification";

export function formatNotificationTime(isoDate: string): string {
  const createdAt = new Date(isoDate);
  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: createdAt.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export function getNotificationTone(type: NotificationType): {
  label: string;
  className: string;
} {
  switch (type) {
    case "booking_confirmed":
    case "payment_confirmed":
      return {
        label: "Confirmed",
        className: "theme-secondary-soft",
      };
    case "session_reminder":
      return {
        label: "Reminder",
        className: "theme-primary-soft-surface",
      };
    case "booking_cancelled":
      return {
        label: "Cancelled",
        className:
          "bg-error-container text-on-error-container dark:bg-error/18 dark:text-error",
      };
  }
}
