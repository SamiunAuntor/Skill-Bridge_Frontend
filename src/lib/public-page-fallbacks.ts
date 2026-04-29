import type { LandingPageResponse } from "./public-api";

export function getLandingPageFallbackData(): LandingPageResponse {
  return {
    stats: {
      activeStudents: 0,
      activeSubjects: 0,
      expertTutors: 0,
      sessionsBooked: 0,
      averageRating: 0,
    },
    featuredTutors: [],
    subjects: [],
    platformReviews: [],
  };
}

export function getPublicPageErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "We couldn't load live public data right now.";
}
