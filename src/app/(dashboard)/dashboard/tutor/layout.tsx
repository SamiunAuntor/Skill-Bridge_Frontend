import { requireDashboardRole } from "@/lib/auth/dashboard-session";

export default async function TutorDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireDashboardRole("tutor");

  return <>{children}</>;
}
