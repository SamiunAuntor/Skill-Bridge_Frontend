export type NotificationType =
  | "booking_confirmed"
  | "payment_confirmed"
  | "session_reminder"
  | "booking_cancelled";

export type NotificationFeedItem = {
  id: string;
  bookingId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export type NotificationFeedResponse = {
  notifications: NotificationFeedItem[];
  page: number;
  limit: number;
  total: number;
  unreadCount: number;
  hasMore: boolean;
};

export type NotificationUnreadCountResponse = {
  unreadCount: number;
};
