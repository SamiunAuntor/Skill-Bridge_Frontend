import DashboardRoleLayout from "@/Components/Dashboard/DashboardRoleLayout";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardRoleLayout role="admin">{children}</DashboardRoleLayout>;
}
