import test from "node:test";
import assert from "node:assert/strict";

import {
  getLandingPageFallbackData,
  getPublicPageErrorMessage,
} from "./public-page-fallbacks.ts";

test("landing page fallback returns empty but render-safe data", () => {
  const fallback = getLandingPageFallbackData();

  assert.equal(fallback.stats.activeStudents, 0);
  assert.deepEqual(fallback.featuredTutors, []);
  assert.deepEqual(fallback.subjects, []);
  assert.deepEqual(fallback.platformReviews, []);
});

test("public page error message falls back for unknown errors", () => {
  assert.equal(
    getPublicPageErrorMessage(null),
    "We couldn't load live public data right now."
  );
});

test("public page error message preserves useful messages", () => {
  assert.equal(
    getPublicPageErrorMessage(new Error("Backend unavailable")),
    "Backend unavailable"
  );
});
