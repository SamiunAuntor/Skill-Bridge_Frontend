import DashboardRoleLayout from "@/Components/Dashboard/DashboardRoleLayout";

export default function StudentDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardRoleLayout role="student">{children}</DashboardRoleLayout>;
}
