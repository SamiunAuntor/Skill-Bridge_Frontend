import { redirect } from "next/navigation";
import { getRoleDashboardRoot } from "@/lib/dashboard-routes";
import type { UserRole } from "@/types/auth";
import { getServerAuthSession } from "./server-session";

export async function requireDashboardSession() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login?next=/dashboard");
  }

  return session;
}

export async function requireDashboardRole(role: UserRole) {
  const session = await requireDashboardSession();

  if (session.user.role !== role) {
    redirect(getRoleDashboardRoot(session.user.role));
  }

  return session;
}
