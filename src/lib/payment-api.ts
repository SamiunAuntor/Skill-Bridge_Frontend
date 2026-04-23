import {
  CreatePaymentIntentResponse,
  PaymentStatusResponse,
} from "@/types/payment";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export class PaymentApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "PaymentApiError";
    this.statusCode = statusCode;
  }
}

interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | BackendEnvelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    const fallbackMessage =
      response.status >= 500
        ? "Something went wrong while preparing your payment. Please try again."
        : "Unable to complete this payment request.";

    throw new PaymentApiError(
      response.status,
      payload?.message || fallbackMessage
    );
  }

  if (!payload || !("data" in payload)) {
    throw new PaymentApiError(500, "Unexpected payment API response.");
  }

  return payload.data;
}

export async function createPaymentIntent(payload: {
  tutorId: string;
  slotId: string;
}): Promise<CreatePaymentIntentResponse> {
  const response = await fetch(`${apiBaseUrl}/api/payments/create-intent`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<CreatePaymentIntentResponse>(response);
}

export async function getPaymentStatus(
  paymentIntentId: string
): Promise<PaymentStatusResponse> {
  const response = await fetch(
    `${apiBaseUrl}/api/payments/${paymentIntentId}/status`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  return parseApiResponse<PaymentStatusResponse>(response);
}
