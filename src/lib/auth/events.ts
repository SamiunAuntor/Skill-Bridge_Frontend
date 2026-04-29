const authChangedEvent = "skillbridge-auth-changed";
const authExpiredEvent = "skillbridge-auth-expired";

function dispatchWindowEvent(name: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(name));
  }
}

export function notifyAuthChanged(): void {
  dispatchWindowEvent(authChangedEvent);
}

export function notifyAuthExpired(): void {
  dispatchWindowEvent(authExpiredEvent);
  dispatchWindowEvent(authChangedEvent);
}

export { authChangedEvent, authExpiredEvent };
