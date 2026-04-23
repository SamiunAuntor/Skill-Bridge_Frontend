import { UserRole } from "@/types/auth";
import { getRoleDashboardPath } from "@/lib/dashboard-routes";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: string;
};

export const dashboardNavByRole: Record<UserRole, DashboardNavItem[]> = {
  tutor: [
    { href: getRoleDashboardPath("tutor"), label: "Dashboard", icon: "dashboard" },
    { href: getRoleDashboardPath("tutor", "profile"), label: "Profile", icon: "person" },
    { href: getRoleDashboardPath("tutor", "sessions"), label: "Sessions", icon: "calendar_month" },
    {
      href: getRoleDashboardPath("tutor", "availability"),
      label: "Availability",
      icon: "event_available",
    },
    { href: getRoleDashboardPath("tutor", "finances"), label: "Finances", icon: "payments" },
    { href: getRoleDashboardPath("tutor", "resources"), label: "Resources", icon: "menu_book" },
  ],
  student: [
    { href: getRoleDashboardPath("student"), label: "Dashboard", icon: "dashboard" },
    { href: getRoleDashboardPath("student", "profile"), label: "Profile", icon: "person" },
    { href: getRoleDashboardPath("student", "sessions"), label: "Sessions", icon: "calendar_month" },
  ],
  admin: [
    { href: getRoleDashboardPath("admin"), label: "Dashboard", icon: "dashboard" },
    { href: getRoleDashboardPath("admin", "users"), label: "Users", icon: "group" },
    {
      href: getRoleDashboardPath("admin", "bookings"),
      label: "Bookings",
      icon: "calendar_month",
    },
    {
      href: getRoleDashboardPath("admin", "categories"),
      label: "Categories",
      icon: "category",
    },
    {
      href: getRoleDashboardPath("admin", "subjects"),
      label: "Subjects",
      icon: "menu_book",
    },
    {
      href: getRoleDashboardPath("admin", "degrees"),
      label: "Degrees",
      icon: "school",
    },
    {
      href: getRoleDashboardPath("admin", "platform-reviews"),
      label: "Reviews",
      icon: "rate_review",
    },
  ],
};
