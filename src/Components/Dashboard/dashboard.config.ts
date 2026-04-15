import { UserRole } from "@/types/auth";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: string;
};

export const dashboardNavByRole: Record<UserRole, DashboardNavItem[]> = {
  tutor: [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/dashboard/profile", label: "Profile", icon: "person" },
    { href: "/dashboard/sessions", label: "Sessions", icon: "calendar_month" },
    {
      href: "/dashboard/availability",
      label: "Availability",
      icon: "event_available",
    },
    { href: "/dashboard/finances", label: "Finances", icon: "payments" },
    { href: "/dashboard/resources", label: "Resources", icon: "menu_book" },
  ],
  student: [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/dashboard/profile", label: "Profile", icon: "person" },
    { href: "/dashboard/bookings", label: "My Bookings", icon: "calendar_month" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/dashboard/sessions", label: "Sessions", icon: "calendar_month" },
    {
      href: "/dashboard/resources",
      label: "Resources",
      icon: "menu_book",
    },
  ],
};
