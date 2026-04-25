export type PaymentIntentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "succeeded"
  | "cancelled"
  | "requires_capture";

export type BookingPaymentStatus = "pending" | "paid" | "failed";
export type PaymentBookingStatus =
  | "pending_payment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface CreatePaymentIntentResponse {
  bookingId: string;
  paymentId: string;
  paymentIntentId: string;
  clientSecret: string;
  amountInCents: number;
  currency: string;
  status: PaymentIntentStatus;
  holdExpiresAt: string;
}

export interface CreatePaymentIntentInput {
  tutorId: string;
  subjectId: string;
  slotId: string;
}

export interface PaymentStatusResponse {
  bookingId: string;
  paymentId: string;
  paymentIntentId: string;
  amountInCents: number;
  currency: string;
  status: PaymentIntentStatus;
  paymentStatus: BookingPaymentStatus;
  bookingStatus: PaymentBookingStatus;
  paymentMethod: string | null;
  last4Digits: string | null;
  cardBrand: string | null;
  confirmedAt: string | null;
  failedAt: string | null;
  holdExpiresAt: string | null;
}
