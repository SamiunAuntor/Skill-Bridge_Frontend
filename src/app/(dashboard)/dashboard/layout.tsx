import { redirect } from "next/navigation";
import DashboardShell from "@/Components/Dashboard/DashboardShell";
import { AppAuthSessionProvider } from "@/lib/auth";
import { requireDashboardSession } from "@/lib/auth/dashboard-session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireDashboardSession();

  if (!session.user.emailVerified) {
    redirect("/verify-pending?email=" + encodeURIComponent(session.user.email));
  }

  return (
    <AppAuthSessionProvider initialSession={session}>
      <DashboardShell>{children}</DashboardShell>
    </AppAuthSessionProvider>
  );
}
