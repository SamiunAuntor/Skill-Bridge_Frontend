import type { UserRole } from "@/types/auth";
import {
  getLegacyDashboardRedirectPath,
  getRoleDashboardPath,
} from "@/lib/dashboard-routes";

export const authRoutePaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-pending",
] as const;

export function getDefaultAppPath(role: UserRole): string {
  return getRoleDashboardPath(role, "home");
}

export function canAccessDashboardPath(role: UserRole, pathname: string): boolean {
  const normalized = getLegacyDashboardRedirectPath(role, pathname);

  if (normalized === getRoleDashboardPath(role, "home")) {
    return true;
  }

  if (pathname.startsWith("/dashboard/student")) {
    return (
      role === "student" &&
      (pathname === "/dashboard/student" ||
        pathname === "/dashboard/student/profile" ||
        pathname === "/dashboard/student/sessions")
    );
  }

  if (pathname.startsWith("/dashboard/tutor")) {
    return (
      role === "tutor" &&
      (pathname === "/dashboard/tutor" ||
        pathname === "/dashboard/tutor/profile" ||
        pathname === "/dashboard/tutor/sessions" ||
        pathname === "/dashboard/tutor/availability" ||
        pathname === "/dashboard/tutor/finances" ||
        pathname === "/dashboard/tutor/resources")
    );
  }

  if (pathname.startsWith("/dashboard/admin")) {
    return (
      role === "admin" &&
      (pathname === "/dashboard/admin" ||
        pathname === "/dashboard/admin/sessions" ||
        pathname === "/dashboard/admin/resources")
    );
  }

  return false;
}
