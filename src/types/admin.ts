export type AdminUserSortOption =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "email_asc"
  | "email_desc";

export type AdminBookingSortOption =
  | "session_desc"
  | "session_asc"
  | "amount_high"
  | "amount_low"
  | "newest"
  | "oldest";

export type AdminMasterSortOption =
  | "name_asc"
  | "name_desc"
  | "newest"
  | "oldest";

export type AdminPlatformReviewStatus = "visible" | "hidden";

export type AdminPlatformReviewSortOption =
  | "newest"
  | "oldest"
  | "rating_high"
  | "rating_low";

export type AdminPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminDashboardResponse = {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalTutors: number;
    totalBookings: number;
    totalCategories: number;
    totalSubjects: number;
    totalDegrees: number;
    activeCategories: number;
    inactiveCategories: number;
    activeSubjects: number;
    inactiveSubjects: number;
    activeDegrees: number;
    inactiveDegrees: number;
    bannedUsers: number;
  };
  charts: {
    studentRegistrations: Array<{
      label: string;
      count: number;
    }>;
    tutorRegistrations: Array<{
      label: string;
      count: number;
    }>;
    bookingTrend: Array<{
      label: string;
      count: number;
    }>;
    bookingStatusBreakdown: Array<{
      status: "confirmed" | "completed" | "cancelled" | "no_show";
      count: number;
    }>;
  };
};

export type AdminUsersQuery = {
  q?: string;
  role?: "student" | "tutor";
  banned?: boolean;
  verified?: boolean;
  sortBy: AdminUserSortOption;
  page: number;
  limit: number;
};

export type AdminUsersResponse = {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: "student" | "tutor";
    isBanned: boolean;
    emailVerified: boolean;
    createdAt: string;
    tutorProfileId: string | null;
  }>;
  pagination: AdminPagination;
  filters: AdminUsersQuery;
};

export type AdminBookingsQuery = {
  q?: string;
  status?: "confirmed" | "completed" | "cancelled" | "no_show";
  paymentStatus?: "pending" | "paid" | "failed";
  sortBy: AdminBookingSortOption;
  page: number;
  limit: number;
};

export type AdminBookingsResponse = {
  bookings: Array<{
    id: string;
    bookingStatus: "confirmed" | "completed" | "cancelled" | "no_show";
    paymentStatus: "pending" | "paid" | "failed";
    sessionDate: string;
    startTime: string;
    endTime: string;
    priceAtBooking: number;
    createdAt: string;
    student: {
      id: string;
      name: string;
      email: string;
    };
    tutor: {
      id: string;
      profileId: string;
      name: string;
      email: string;
    };
  }>;
  pagination: AdminPagination;
  filters: AdminBookingsQuery;
};

export type AdminCategoriesQuery = {
  q?: string;
  isActive?: boolean;
  sortBy: AdminMasterSortOption;
  page: number;
  limit: number;
};

export type AdminCategoriesResponse = {
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    subjectCount: number;
    tutorCount: number;
    createdAt: string;
  }>;
  pagination: AdminPagination;
  filters: AdminCategoriesQuery;
};

export type AdminSubjectsQuery = AdminCategoriesQuery & {
  categoryId?: string;
};

export type AdminDegreesQuery = AdminCategoriesQuery & {
  categoryId?: string;
};

export type AdminSubjectsResponse = {
  subjects: Array<{
    id: string;
    categoryId: string;
    categoryName: string;
    name: string;
    description: string | null;
    iconUrl: string | null;
    iconPublicId: string | null;
    isActive: boolean;
    tutorCount: number;
    createdAt: string;
  }>;
  pagination: AdminPagination;
  filters: AdminSubjectsQuery;
};

export type AdminDegreesResponse = {
  degrees: Array<{
    id: string;
    categoryId: string;
    categoryName: string;
    name: string;
    level: string | null;
    isActive: boolean;
    usageCount: number;
    createdAt: string;
  }>;
  pagination: AdminPagination;
  filters: AdminDegreesQuery;
};

export type AdminPlatformReviewsQuery = {
  q?: string;
  status?: AdminPlatformReviewStatus;
  sortBy: AdminPlatformReviewSortOption;
  page: number;
  limit: number;
};

export type AdminPlatformReviewsResponse = {
  reviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    message: string;
    status: AdminPlatformReviewStatus;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  }>;
  pagination: AdminPagination;
  filters: AdminPlatformReviewsQuery;
};

export type AdminCategoryUpsertInput = {
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export type AdminSubjectUpsertInput = {
  categoryId: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  iconPublicId?: string | null;
  isActive?: boolean;
};

export type AdminDegreeUpsertInput = {
  categoryId: string;
  name: string;
  level?: string | null;
  isActive?: boolean;
};
