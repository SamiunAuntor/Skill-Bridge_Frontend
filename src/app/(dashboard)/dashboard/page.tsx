"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppAuthSession } from "@/lib/auth";
import { getRoleDashboardRoot } from "@/lib/dashboard-routes";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useAppAuthSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login?next=/dashboard");
      return;
    }

    router.replace(getRoleDashboardRoot(session.user.role));
  }, [isPending, session, router]);

  return null;
}