import type { UserRole } from "@/types/auth";

export type DashboardSection =
  | "home"
  | "profile"
  | "sessions"
  | "availability"
  | "finances"
  | "users"
  | "bookings"
  | "categories"
  | "subjects"
  | "degrees"
  | "platform-reviews";

export function getRoleDashboardRoot(role: UserRole): string {
  switch (role) {
    case "tutor":
      return "/dashboard/tutor";
    case "student":
      return "/dashboard/student";
    case "admin":
      return "/dashboard/admin";
  }
}

export function getRoleDashboardPath(
  role: UserRole,
  section: DashboardSection = "home"
): string {
  const root = getRoleDashboardRoot(role);

  if (section === "home") {
    return root;
  }

  return `${root}/${section}`;
}

export function getLegacyDashboardRedirectPath(
  role: UserRole,
  pathname: string
): string {
  switch (pathname) {
    case "/dashboard":
      return getRoleDashboardPath(role, "home");
    case "/dashboard/profile":
      return getRoleDashboardPath(role, "profile");
    case "/dashboard/sessions":
    case "/dashboard/bookings":
      return getRoleDashboardPath(role, "sessions");
    case "/dashboard/availability":
      return role === "tutor"
        ? getRoleDashboardPath(role, "availability")
        : getRoleDashboardPath(role, "home");
    case "/dashboard/finances":
      return role === "tutor"
        ? getRoleDashboardPath(role, "finances")
        : getRoleDashboardPath(role, "home");
    case "/dashboard/users":
      return role === "admin"
        ? getRoleDashboardPath(role, "users")
        : getRoleDashboardPath(role, "home");
    case "/dashboard/categories":
      return role === "admin"
        ? getRoleDashboardPath(role, "categories")
        : getRoleDashboardPath(role, "home");
    case "/dashboard/subjects":
      return role === "admin"
        ? getRoleDashboardPath(role, "subjects")
        : getRoleDashboardPath(role, "home");
    case "/dashboard/degrees":
      return role === "admin"
        ? getRoleDashboardPath(role, "degrees")
        : getRoleDashboardPath(role, "home");
    case "/dashboard/platform-reviews":
      return role === "admin"
        ? getRoleDashboardPath(role, "platform-reviews")
        : getRoleDashboardPath(role, "home");
    case "/dashboard/bookings":
      return role === "admin"
        ? getRoleDashboardPath(role, "bookings")
        : getRoleDashboardPath(role, "sessions");
    default:
      return getRoleDashboardPath(role, "home");
  }
}
