export type TutorSortOption =
  | "recommended"
  | "highest_rated"
  | "lowest_rated"
  | "lowest_price"
  | "highest_price"
  | "most_reviewed";

export interface TutorCategory {
  id: string;
  name: string;
  slug: string;
}

export interface TutorSubject {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
}

export interface TutorCard {
  id: string;
  userId: string;
  displayName: string;
  professionalTitle: string;
  avatarUrl: string | null;
  bio: string;
  hourlyRate: number;
  experienceYears: number;
  averageRating: number;
  totalReviews: number;
  isTopRated: boolean;
  categories: TutorCategory[];
  subjects: TutorSubject[];
  hasAvailability: boolean;
  nextAvailableSlot: string | null;
}

export interface TutorListFilters {
  q?: string;
  category?: string;
  subject?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy: TutorSortOption;
  page: number;
  limit: number;
}

export interface TutorListResponse {
  tutors: TutorCard[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: TutorListFilters;
}

export interface TutorEducation {
  id: string;
  degree: string;
  categoryName: string;
  institution: string;
  startYear: number;
  endYear: number | null;
  description: string | null;
}

export interface TutorTestimonial {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface TutorAvailabilitySlot {
  id: string;
  tutorId?: string;
  startAt: string;
  endAt: string;
  isBooked?: boolean;
}

export interface TutorDetailResponse {
  tutor: {
    id: string;
    userId: string;
    displayName: string;
    professionalTitle: string;
    email: string;
    avatarUrl: string | null;
    bio: string;
    hourlyRate: number;
    experienceYears: number;
    totalHoursTaught: number;
    totalEarnings: number;
    averageRating: number;
    totalReviews: number;
    isTopRated: boolean;
    categories: TutorCategory[];
    subjects: TutorSubject[];
    education: TutorEducation[];
    testimonials: TutorTestimonial[];
    availableSlots: TutorAvailabilitySlot[];
  };
}

export interface AvailabilitySlotItem {
  id: string;
  tutorId: string;
  startAt: string;
  endAt: string;
  isBooked: boolean;
}

export interface AvailabilityListResponse {
  slots: AvailabilitySlotItem[];
}

export interface DashboardSessionItem {
  bookingId: string;
  sessionId: string;
  reviewId: string | null;
  bookingStatus: "confirmed" | "completed" | "cancelled" | "no_show";
  sessionStatus: "scheduled" | "ongoing" | "completed" | "cancelled";
  sessionDate: string;
  startTime: string;
  endTime: string;
  priceAtBooking: number;
  canCancel: boolean;
  canJoin: boolean;
  meetingProvider: string | null;
  meetingId: string | null;
  meetingJoinUrl: string | null;
  meetingPassword: string | null;
  canLeaveReview: boolean;
  student: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  tutor: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export type DashboardSessionSortOption =
  | "time_asc"
  | "time_desc"
  | "amount_high"
  | "amount_low"
  | "upcoming_only"
  | "completed_only"
  | "cancelled_only";

export interface DashboardSessionListResponse {
  sessions: DashboardSessionItem[];
  stats: {
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  filters: {
    search: string;
    sortBy: DashboardSessionSortOption;
  };
}

export interface TutorDashboardSummaryResponse {
  stats: {
    totalEarnings: number;
    totalHours: number;
    averageRating: number | null;
    totalReviews: number;
  };
  upcomingSessions: DashboardSessionItem[];
}

export interface SessionReview {
  id: string;
  bookingId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface TutorReviewsResponse {
  reviews: SessionReview[];
}

export interface TutorEditableDegreeOption {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  level: string | null;
}

export interface TutorEditableSubjectOption {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
}

export interface TutorEditableProfileEducation {
  id: string;
  degreeId: string;
  categoryId: string;
  institution: string;
  startYear: number;
  endYear: number | null;
  description: string | null;
}

export interface TutorEditableProfileSubject {
  id: string;
  subjectId: string;
  categoryId: string;
  name: string;
  slug: string;
}

export interface TutorEditableProfile {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  profileImageUrl: string | null;
  professionalTitle: string;
  bio: string;
  hourlyRate: number;
  experienceYears: number;
  categoryIds: string[];
  subjects: TutorEditableProfileSubject[];
  education: TutorEditableProfileEducation[];
}

export interface TutorEditableProfileResponse {
  profile: TutorEditableProfile;
  availableCategories: TutorCategory[];
  availableSubjects: TutorEditableSubjectOption[];
  availableDegrees: TutorEditableDegreeOption[];
}

export interface TutorProfileUpdateEducationInput {
  id?: string;
  degreeId: string;
  categoryId: string;
  institution: string;
  startYear: number;
  endYear?: number | null;
  description?: string | null;
}

export interface TutorProfileUpdateInput {
  profileImageUrl?: string | null;
  professionalTitle: string;
  bio: string;
  hourlyRate: number;
  experienceYears: number;
  categoryIds: string[];
  subjectIds: string[];
  education: TutorProfileUpdateEducationInput[];
}
