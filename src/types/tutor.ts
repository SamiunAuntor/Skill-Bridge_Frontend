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

export interface TutorExpertise {
  id: string;
  name: string;
  slug: string;
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
  expertise: TutorExpertise[];
  hasAvailability: boolean;
  nextAvailableSlot: string | null;
}

export interface TutorListFilters {
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
  institution: string;
  fieldOfStudy: string;
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
    expertise: TutorExpertise[];
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

export interface BookingConfirmationResponse {
  booking: {
    id: string;
    sessionId: string;
    tutorId: string;
    slotId: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    priceAtBooking: number;
    status: "confirmed";
    paymentStatus: "paid";
    sessionStatus: "scheduled";
  };
}

export interface DashboardSessionItem {
  bookingId: string;
  sessionId: string;
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

export interface DashboardSessionListResponse {
  sessions: DashboardSessionItem[];
}

export interface TutorEditableProfileEducation {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number | null;
  description: string | null;
}

export interface TutorEditableProfileExpertise {
  id: string;
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
  expertise: TutorEditableProfileExpertise[];
  education: TutorEditableProfileEducation[];
}

export interface TutorEditableProfileResponse {
  profile: TutorEditableProfile;
  availableCategories: TutorCategory[];
}

export interface TutorProfileUpdateExpertiseInput {
  id?: string;
  name: string;
}

export interface TutorProfileUpdateEducationInput {
  id?: string;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
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
  expertise: TutorProfileUpdateExpertiseInput[];
  education: TutorProfileUpdateEducationInput[];
}
