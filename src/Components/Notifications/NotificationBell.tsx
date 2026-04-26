"use client";

import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationApiError,
} from "@/lib/notification-api";
import { getRoleDashboardPath } from "@/lib/dashboard-routes";
import { notificationChangedEvent, notifyNotificationsChanged } from "@/lib/notification-events";
import type { UserRole } from "@/types/auth";
import type { NotificationFeedItem } from "@/types/notification";
import NotificationPanel from "./NotificationPanel";

function toFriendlyError(error: unknown): string {
  if (error instanceof NotificationApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "We couldn't load notifications right now.";
}

type NotificationBellProps = {
  role: Exclude<UserRole, "admin">;
};

export default function NotificationBell({ role }: NotificationBellProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingPanel, setIsLoadingPanel] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [notifications, setNotifications] = useState<NotificationFeedItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const viewAllHref = useMemo(
    () => getRoleDashboardPath(role, "notifications"),
    [role]
  );

  useEffect(() => {
    let cancelled = false;

    async function refreshUnreadCount() {
      try {
        const result = await getUnreadNotificationCount();
        if (!cancelled) {
          setUnreadCount(result.unreadCount);
        }
      } catch {
        // keep header quiet if count polling fails
      }
    }

    void refreshUnreadCount();

    const intervalId = window.setInterval(() => {
      void refreshUnreadCount();
    }, 45000);

    const handleWindowFocus = () => {
      void refreshUnreadCount();
    };

    const handleNotificationsChanged = () => {
      void refreshUnreadCount();
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener(notificationChangedEvent, handleNotificationsChanged);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener(notificationChangedEvent, handleNotificationsChanged);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  async function loadNotifications() {
    setIsLoadingPanel(true);

    try {
      const result = await getMyNotifications({ page: 1, limit: 8 });
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Notifications unavailable",
        text: toFriendlyError(error),
        confirmButtonColor: "#1d3b66",
      });
    } finally {
      setIsLoadingPanel(false);
    }
  }

  async function handleToggleOpen() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications();
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) {
      return;
    }

    setIsMarkingAllRead(true);

    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
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

  async function handleNotificationClick(notification: NotificationFeedItem) {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  isRead: true,
                  readAt: item.readAt ?? new Date().toISOString(),
                }
              : item
          )
        );
        setUnreadCount((current) => Math.max(0, current - 1));
        notifyNotificationsChanged();
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Unable to open notification",
        text: toFriendlyError(error),
        confirmButtonColor: "#1d3b66",
      });
      return;
    }

    setIsOpen(false);

    if (notification.bookingId) {
      router.push(getRoleDashboardPath(role, "sessions"));
      return;
    }

    router.push(viewAllHref);
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => void handleToggleOpen()}
        className="relative text-on-surface-variant transition-colors hover:text-primary"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <NotificationPanel
          notifications={notifications}
          isLoading={isLoadingPanel}
          onClose={() => setIsOpen(false)}
          onNotificationClick={(notification) => void handleNotificationClick(notification)}
          onMarkAllRead={() => void handleMarkAllRead()}
          isMarkingAllRead={isMarkingAllRead}
          unreadCount={unreadCount}
          viewAllHref={viewAllHref}
        />
      ) : null}
    </div>
  );
}
