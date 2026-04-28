import { redirect } from "next/navigation";
import { getRoleDashboardRoot } from "@/lib/dashboard-routes";
import { requireDashboardSession } from "@/lib/auth/dashboard-session";

export default async function DashboardPage() {
  const session = await requireDashboardSession();

  redirect(getRoleDashboardRoot(session.user.role));
}
