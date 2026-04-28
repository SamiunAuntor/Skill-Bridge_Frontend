import { requireDashboardRole } from "@/lib/auth/dashboard-session";

export default async function StudentDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireDashboardRole("student");

  return <>{children}</>;
}
