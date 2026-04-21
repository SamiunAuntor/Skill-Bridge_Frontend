"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import { useAppAuthSession } from "@/lib/auth";
import { getRoleDashboardPath } from "@/lib/dashboard-routes";
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
  const actualRole = session?.user?.role;

  useEffect(() => {
    if (!isPending && actualRole && actualRole !== role) {
      router.replace(getRoleDashboardPath(actualRole));
    }
  }, [actualRole, isPending, role, router]);

  if (isPending || !actualRole) {
    return <DashboardPageLoader label="Loading workspace..." />;
  }

  if (actualRole !== role) {
    return <DashboardPageLoader label="Redirecting to your workspace..." />;
  }

  return <>{children}</>;
}
