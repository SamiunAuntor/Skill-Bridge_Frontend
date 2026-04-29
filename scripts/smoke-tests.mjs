import assert from "node:assert/strict";

import {
  availabilitySlotInputSchema,
  platformReviewInputSchema,
  storedPaymentCheckoutSessionSchema,
  subjectsSearchParamsSchema,
  tutorSearchParamsSchema,
} from "../src/lib/validation/app-schemas.ts";
import {
  getLandingPageFallbackData,
  getPublicPageErrorMessage,
} from "../src/lib/public-page-fallbacks.ts";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("subjects search params trim values", () => {
  const result = subjectsSearchParamsSchema.parse({
    q: "  algebra  ",
    sortBy: "alphabetical",
  });

  assert.deepEqual(result, {
    q: "algebra",
    sortBy: "alphabetical",
  });
});

run("tutor search params reject invalid sort values", () => {
  const result = tutorSearchParamsSchema.safeParse({
    sortBy: "unknown",
  });

  assert.equal(result.success, false);
});

run("platform review requires meaningful message", () => {
  const result = platformReviewInputSchema.safeParse({
    rating: 5,
    title: "Great",
    message: "too short",
  });

  assert.equal(result.success, false);
});

run("availability slot rejects reversed ranges", () => {
  const result = availabilitySlotInputSchema.safeParse({
    date: "2026-04-28",
    startTime: "12:00",
    endTime: "11:00",
  });

  assert.equal(result.success, false);
});

run("stored payment checkout requires all critical fields", () => {
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

run("landing page fallback is render-safe", () => {
  const fallback = getLandingPageFallbackData();

  assert.equal(fallback.stats.activeStudents, 0);
  assert.deepEqual(fallback.featuredTutors, []);
  assert.deepEqual(fallback.subjects, []);
  assert.deepEqual(fallback.platformReviews, []);
});

run("public page fallback message preserves useful errors", () => {
  assert.equal(
    getPublicPageErrorMessage(new Error("Backend unavailable")),
    "Backend unavailable"
  );
  assert.equal(
    getPublicPageErrorMessage(null),
    "We couldn't load live public data right now."
  );
});

console.log("Smoke tests passed.");
