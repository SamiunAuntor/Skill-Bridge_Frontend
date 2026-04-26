export const notificationChangedEvent = "skillbridge-notifications-changed";

export function notifyNotificationsChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(notificationChangedEvent));
  }
}
