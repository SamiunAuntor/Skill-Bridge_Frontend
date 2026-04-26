"use client";

import { BellRing, CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { NotificationFeedItem as NotificationFeedItemType } from "@/types/notification";
import { formatNotificationTime, getNotificationTone } from "./notification-utils";

const notificationIconMap = {
  booking_confirmed: CheckCircle2,
  payment_confirmed: CheckCircle2,
  booking_cancelled: XCircle,
  session_reminder: Clock3,
} as const;

type NotificationItemProps = {
  notification: NotificationFeedItemType;
  onClick?: () => void;
  compact?: boolean;
};

export default function NotificationItem({
  notification,
  onClick,
  compact = false,
}: NotificationItemProps) {
  const tone = getNotificationTone(notification.type);
  const Icon = notificationIconMap[notification.type] ?? BellRing;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
        notification.isRead
          ? "border-outline-variant/20 bg-surface-container-low hover:bg-surface-container"
          : "border-primary/12 bg-primary/6 hover:bg-primary/10"
      } ${compact ? "" : "shadow-[0px_4px_18px_rgba(0,51,88,0.04)]"}`}
    >
      <div className="flex items-start gap-3">
        <div className="theme-primary-soft-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-headline text-sm font-extrabold text-primary">
              {notification.title}
            </h4>
            <span
              className={`${tone.className} inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]`}
            >
              {tone.label}
            </span>
            {!notification.isRead ? (
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
            ) : null}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            {notification.message}
          </p>
          <p className="mt-3 text-xs font-medium text-on-surface-variant">
            {formatNotificationTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </button>
  );
}
