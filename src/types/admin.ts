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
  | "display_asc"
  | "display_desc"
  | "name_asc"
  | "name_desc"
  | "newest"
  | "oldest";

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
    slug: string;
    description: string | null;
    isActive: boolean;
    displayOrder: number;
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

export type AdminSubjectsResponse = {
  subjects: Array<{
    id: string;
    categoryId: string;
    categoryName: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    longDescription: string | null;
    iconKey: string | null;
    heroImageUrl: string | null;
    isActive: boolean;
    displayOrder: number;
    tutorCount: number;
    createdAt: string;
  }>;
  pagination: AdminPagination;
  filters: AdminSubjectsQuery;
};

export type AdminDegreesResponse = {
  degrees: Array<{
    id: string;
    name: string;
    slug: string;
    level: string | null;
    isActive: boolean;
    displayOrder: number;
    usageCount: number;
    createdAt: string;
  }>;
  pagination: AdminPagination;
  filters: AdminCategoriesQuery;
};

export type AdminCategoryUpsertInput = {
  name: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
  displayOrder?: number;
};

export type AdminSubjectUpsertInput = {
  categoryId: string;
  name: string;
  slug?: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  iconKey?: string | null;
  heroImageUrl?: string | null;
  isActive?: boolean;
  displayOrder?: number;
};

export type AdminDegreeUpsertInput = {
  name: string;
  slug?: string;
  level?: string | null;
  isActive?: boolean;
  displayOrder?: number;
};
