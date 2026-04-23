import type { CreatePaymentIntentResponse } from "@/types/payment";

const paymentCheckoutStorageKeyPrefix = "skillbridge:payment-checkout:";

export interface StoredPaymentCheckoutSession {
  bookingId: string;
  paymentIntentId: string;
  clientSecret: string;
  amountInCents: number;
  currency: string;
  holdExpiresAt: string;
  returnTo: string;
}

function getStorageKey(bookingId: string): string {
  return `${paymentCheckoutStorageKeyPrefix}${bookingId}`;
}

export function savePaymentCheckoutSession(
  bookingId: string,
  returnTo: string,
  payment: CreatePaymentIntentResponse
): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredPaymentCheckoutSession = {
    bookingId,
    paymentIntentId: payment.paymentIntentId,
    clientSecret: payment.clientSecret,
    amountInCents: payment.amountInCents,
    currency: payment.currency,
    holdExpiresAt: payment.holdExpiresAt,
    returnTo,
  };

  window.sessionStorage.setItem(getStorageKey(bookingId), JSON.stringify(payload));
}

export function readPaymentCheckoutSession(
  bookingId: string
): StoredPaymentCheckoutSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(getStorageKey(bookingId));

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredPaymentCheckoutSession;
  } catch {
    return null;
  }
}

export function clearPaymentCheckoutSession(bookingId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(getStorageKey(bookingId));
}
