import { AppApiError, requestJson } from "@/lib/api-client";
import {
  CreatePaymentIntentInput,
  CreatePaymentIntentResponse,
  PaymentStatusResponse,
} from "@/types/payment";

export class PaymentApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "PaymentApiError";
    this.statusCode = statusCode;
  }
}

function toPaymentApiError(error: unknown): PaymentApiError {
  if (error instanceof PaymentApiError) {
    return error;
  }

  if (error instanceof AppApiError) {
    return new PaymentApiError(error.statusCode, error.message);
  }

  return new PaymentApiError(500, "Unexpected payment API response.");
}

export async function createPaymentIntent(
  payload: CreatePaymentIntentInput
): Promise<CreatePaymentIntentResponse> {
  try {
    return await requestJson<CreatePaymentIntentResponse>(
      "/api/payments/create-intent",
      {
        init: {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        fallbackMessage: "Unable to complete this payment request.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toPaymentApiError(error);
  }
}

export async function getPaymentStatus(
  paymentIntentId: string
): Promise<PaymentStatusResponse> {
  try {
    return await requestJson<PaymentStatusResponse>(
      `/api/payments/${paymentIntentId}/status`,
      {
        init: {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
        fallbackMessage: "Unable to complete this payment request.",
        onUnauthorized: "notify",
      }
    );
  } catch (error) {
    throw toPaymentApiError(error);
  }
}
