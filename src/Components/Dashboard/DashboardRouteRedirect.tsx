"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import { useAppAuthSession } from "@/lib/auth";
import { getRoleDashboardPath } from "@/lib/dashboard-routes";

type DashboardRouteRedirectProps = {
  label?: string;
};

export default function DashboardRouteRedirect({
  label = "Redirecting to your dashboard...",
}: DashboardRouteRedirectProps) {
  const router = useRouter();
  const { data: session, isPending } = useAppAuthSession();
  const role = session?.user?.role;

  useEffect(() => {
    if (!isPending && role) {
      router.replace(getRoleDashboardPath(role));
    }
  }, [isPending, role, router]);

  return <DashboardPageLoader label={label} />;
}
