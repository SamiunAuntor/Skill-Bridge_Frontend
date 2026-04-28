import { requireDashboardRole } from "@/lib/auth/dashboard-session";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireDashboardRole("admin");

  return <>{children}</>;
}
