import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth/server-session";
import { getRoleDashboardRoot } from "@/lib/dashboard-routes";

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login?next=/dashboard");
  }

  redirect(getRoleDashboardRoot(session.user.role));
}
