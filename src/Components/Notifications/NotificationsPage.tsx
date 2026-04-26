"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { UserRole } from "@/types/auth";
import type { NotificationFeedItem } from "@/types/notification";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationApiError,
} from "@/lib/notification-api";
import { notifyNotificationsChanged } from "@/lib/notification-events";
import NotificationItem from "./NotificationItem";

function toFriendlyError(error: unknown): string {
  if (error instanceof NotificationApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "We couldn't load notifications right now.";
}

type NotificationsPageProps = {
  role: Exclude<UserRole, "admin">;
};

export default function NotificationsPage({ role }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<NotificationFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await getMyNotifications({ page: 1, limit: 50 });
        if (!cancelled) {
          setNotifications(result.notifications);
        }
      } catch (error) {
        if (!cancelled) {
          await Swal.fire({
            icon: "error",
            title: "Notifications unavailable",
            text: toFriendlyError(error),
            confirmButtonColor: "#1d3b66",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role]);

  async function handleMarkAllRead() {
    setIsMarkingAllRead(true);

    try {
      await markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? new Date().toISOString(),
        }))
      );
      notifyNotificationsChanged();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Unable to update notifications",
        text: toFriendlyError(error),
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsMarkingAllRead(false);
    }
  }

  async function handleNotificationRead(notificationId: string) {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
                readAt: notification.readAt ?? new Date().toISOString(),
              }
            : notification
        )
      );
      notifyNotificationsChanged();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Unable to update notification",
        text: toFriendlyError(error),
        confirmButtonColor: "#1d3b66",
      });
    }
  }

  if (isLoading) {
    return <DashboardPageLoader label="Loading notifications..." />;
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
            Notifications
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
            Booking confirmations, reminders, and cancellation updates will appear here.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleMarkAllRead()}
          disabled={isMarkingAllRead || unreadCount === 0}
          className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Mark all as read
        </button>
      </header>

      {notifications.length > 0 ? (
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => void handleNotificationRead(notification.id)}
            />
          ))}
        </section>
      ) : (
        <div className="rounded-2xl bg-surface-container-low p-6 text-sm text-on-surface-variant">
          No notifications yet. Session updates will appear here once bookings start moving.
        </div>
      )}
    </div>
  );
}
