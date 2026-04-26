"use client";

import Link from "next/link";
import type { NotificationFeedItem } from "@/types/notification";
import NotificationItem from "./NotificationItem";

type NotificationPanelProps = {
  notifications: NotificationFeedItem[];
  isLoading: boolean;
  onClose: () => void;
  onNotificationClick: (notification: NotificationFeedItem) => void;
  onMarkAllRead: () => void;
  isMarkingAllRead: boolean;
  unreadCount: number;
  viewAllHref: string;
};

export default function NotificationPanel({
  notifications,
  isLoading,
  onClose,
  onNotificationClick,
  onMarkAllRead,
  isMarkingAllRead,
  unreadCount,
  viewAllHref,
}: NotificationPanelProps) {
  return (
    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[min(92vw,24rem)] rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0px_18px_48px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/15 px-5 py-4">
        <div>
          <h3 className="font-headline text-lg font-extrabold text-primary">
            Notifications
          </h3>
          <p className="text-xs text-on-surface-variant">
            {unreadCount > 0
              ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
              : "All caught up"}
          </p>
        </div>

        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={isMarkingAllRead || unreadCount === 0}
          className="text-xs font-bold text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-[26rem] space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-outline-variant/30 border-t-primary" />
              <p className="text-sm text-on-surface-variant">Loading notifications...</p>
            </div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              compact
              onClick={() => onNotificationClick(notification)}
            />
          ))
        ) : (
          <div className="rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant">
            No notifications yet. Booking updates and reminders will appear here.
          </div>
        )}
      </div>

      <div className="border-t border-outline-variant/15 px-5 py-4">
        <Link
          href={viewAllHref}
          onClick={onClose}
          className="text-sm font-bold text-primary transition-colors hover:text-secondary"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
