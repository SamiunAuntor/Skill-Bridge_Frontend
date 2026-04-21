import DashboardRoleLayout from "@/Components/Dashboard/DashboardRoleLayout";

export default function TutorDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardRoleLayout role="tutor">{children}</DashboardRoleLayout>;
}
