import test from "node:test";
import assert from "node:assert/strict";

import {
  availabilitySlotInputSchema,
  platformReviewInputSchema,
  storedPaymentCheckoutSessionSchema,
  subjectsSearchParamsSchema,
  tutorSearchParamsSchema,
} from "./app-schemas.ts";

test("subjects search params default to trimmed optional values", () => {
  const result = subjectsSearchParamsSchema.parse({
    q: "  algebra  ",
    sortBy: "alphabetical",
  });

  assert.deepEqual(result, {
    q: "algebra",
    sortBy: "alphabetical",
  });
});

test("tutor search params reject unsupported sort values", () => {
  const result = tutorSearchParamsSchema.safeParse({
    sortBy: "unknown",
  });

  assert.equal(result.success, false);
});

test("platform review requires a meaningful message", () => {
  const result = platformReviewInputSchema.safeParse({
    rating: 5,
    title: "Great",
    message: "too short",
  });

  assert.equal(result.success, false);
});

test("availability slot schema rejects reversed time ranges", () => {
  const result = availabilitySlotInputSchema.safeParse({
    date: "2026-04-28",
    startTime: "12:00",
    endTime: "11:00",
  });

  assert.equal(result.success, false);
});

test("stored payment checkout schema validates required fields", () => {
  const result = storedPaymentCheckoutSessionSchema.safeParse({
    bookingId: "b1",
    paymentIntentId: "pi_123",
    clientSecret: "secret",
    amountInCents: 1000,
    currency: "usd",
    holdExpiresAt: "2026-04-28T12:00:00.000Z",
    returnTo: "/tutors/abc",
  });

  assert.equal(result.success, true);
});
