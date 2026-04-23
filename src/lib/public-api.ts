const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export class PublicApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "PublicApiError";
    this.statusCode = statusCode;
  }
}

interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

async function fetchPublicApi<T>(
  path: string,
  revalidateSeconds = 300
): Promise<T> {
  const response = await fetch(
    `${apiBaseUrl}${path}`,
    revalidateSeconds <= 0
      ? {
          cache: "no-store",
        }
      : {
          next: {
            revalidate: revalidateSeconds,
          },
        }
  );

  const payload = (await response.json().catch(() => null)) as
    | BackendEnvelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new PublicApiError(
      response.status,
      payload?.message || "Unable to fetch public data."
    );
  }

  if (!payload || !("data" in payload)) {
    throw new PublicApiError(500, "Unexpected public API response.");
  }

  return payload.data;
}

export type LandingPageResponse = {
  stats: {
    activeSubjects: number;
    expertTutors: number;
    sessionsBooked: number;
    averageRating: number;
  };
  featuredTutors: Array<{
    id: string;
    displayName: string;
    professionalTitle: string;
    avatarUrl: string | null;
    bio: string;
    hourlyRate: number;
    averageRating: number;
    totalReviews: number;
    primarySubject: string;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    slug: string;
    iconUrl: string | null;
    description: string | null;
    categoryName: string;
  }>;
  platformReviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    message: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  }>;
};

export async function getLandingPageData(): Promise<LandingPageResponse> {
  return fetchPublicApi<LandingPageResponse>("/api/public/landing", 0);
}

export type PublicSubjectsResponse = {
  subjects: Array<{
    id: string;
    name: string;
    slug: string;
    iconUrl: string | null;
    description: string | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    tutorCount: number;
  }>;
};

export type PublicSubjectDetailResponse = {
  subject: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    iconUrl: string | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
  tutors: Array<{
    id: string;
    userId: string;
    displayName: string;
    professionalTitle: string;
    avatarUrl: string | null;
    bio: string;
    hourlyRate: number;
    averageRating: number;
    totalReviews: number;
    isTopRated: boolean;
  }>;
};

export async function getPublicSubjects(): Promise<PublicSubjectsResponse> {
  return fetchPublicApi<PublicSubjectsResponse>("/api/public/subjects", 300);
}

export async function getPublicSubjectBySlug(
  slug: string
): Promise<PublicSubjectDetailResponse> {
  return fetchPublicApi<PublicSubjectDetailResponse>(
    `/api/public/subjects/${slug}`,
    300
  );
}
