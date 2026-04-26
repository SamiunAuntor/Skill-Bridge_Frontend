"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppAuthSession } from "@/lib/auth";
import { getRoleDashboardRoot } from "@/lib/dashboard-routes";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import type { UserRole } from "@/types/auth";

type DashboardRoleLayoutProps = {
  role: UserRole;
  children: ReactNode;
};

export default function DashboardRoleLayout({
  role,
  children,
}: DashboardRoleLayoutProps) {
  const router = useRouter();
  const { data: session, isPending } = useAppAuthSession();

  useEffect(() => {
    if (isPending) return;

    const actualRole = session?.user?.role;

    if (!actualRole) {
      router.replace("/login?next=/dashboard");
      return;
    }

    if (actualRole !== role) {
      router.replace(getRoleDashboardRoot(actualRole));
    }
  }, [isPending, session, role, router]);

  if (isPending) {
    return <DashboardPageLoader label="Verifying dashboard access..." />;
  }

  const actualRole = session?.user?.role;

  if (!actualRole || actualRole !== role) {
    return <DashboardPageLoader label="Redirecting..." />;
  }

  return <>{children}</>;
}