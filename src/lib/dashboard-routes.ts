import type { UserRole } from "@/types/auth";

export type DashboardSection =
  | "home"
  | "profile"
  | "sessions"
  | "availability"
  | "finances"
  | "resources";

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
    case "/dashboard/resources":
      return role === "tutor" || role === "admin"
        ? getRoleDashboardPath(role, "resources")
        : getRoleDashboardPath(role, "home");
    default:
      return getRoleDashboardPath(role, "home");
  }
}
