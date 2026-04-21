import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth/server-session";
import { getRoleDashboardRoot } from "@/lib/dashboard-routes";
import type { UserRole } from "@/types/auth";

type DashboardRoleLayoutProps = {
  role: UserRole;
  children: ReactNode;
};

export default async function DashboardRoleLayout({
  role,
  children,
}: DashboardRoleLayoutProps) {
  const session = await getServerAuthSession();
  const actualRole = session?.user?.role;

  if (!actualRole) {
    redirect("/login?next=/dashboard");
  }

  if (actualRole !== role) {
    redirect(getRoleDashboardRoot(actualRole));
  }

  return <>{children}</>;
}
