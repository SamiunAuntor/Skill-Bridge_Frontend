"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { dashboardNavByRole } from "./dashboard.config";
import { UserRole } from "@/types/auth";
import ThemeToggle from "@/Components/Theme/ThemeToggle";

type DashboardShellProps = {
  children: ReactNode;
};

function getRoleHeading(role: UserRole): string {
  switch (role) {
    case "tutor":
      return "Tutor Dashboard";
    case "student":
      return "Student Dashboard";
    case "admin":
      return "Admin Dashboard";
  }
}

function getDisplayName(user: { name?: string | null; email?: string | null }): string {
  return user.name?.trim() || user.email || "Account";
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
    }
  }, [isPending, router, session?.user]);

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
          <div className="bg-surface-container-lowest p-6" />
          <div className="bg-surface p-6" />
        </div>
      </div>
    );
  }

  const user = session.user;
  const role = (user.role as UserRole | undefined) ?? "student";
  const navItems = dashboardNavByRole[role];
  const displayName = getDisplayName(user);
  const sidebarActionClass =
    "flex w-full items-center justify-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3 text-center text-sm font-semibold text-on-surface-variant shadow-sm transition-all hover:border-primary/20 hover:bg-surface-container-low hover:text-primary";

  return (
    <div className="min-h-screen bg-surface">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside className="flex flex-col border-b border-outline-variant/10 bg-surface-container-lowest px-6 py-8 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="mb-10">
            <Link
              href="/"
              className="font-headline text-3xl font-black tracking-tight text-primary"
            >
              SkillBridge
            </Link>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-on-surface-variant">
              Academic Excellence
            </p>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-r-full px-4 py-3 font-headline text-base font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-primary-fixed text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 space-y-4 border-t border-outline-variant/20 pt-6">
            <ThemeToggle fullWidth />
            <Link
              href="#"
              className={sidebarActionClass}
            >
              <span className="material-symbols-outlined text-lg">help</span>
              Help Center
            </Link>
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                router.replace("/");
                router.refresh();
              }}
              className={sidebarActionClass}
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        </aside>

        <div className="min-w-0 bg-surface px-5 py-6 md:px-8 md:py-7">
          <header className="mb-10 flex flex-col gap-4 border-b border-outline-variant/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
              {getRoleHeading(role)}
            </h1>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="relative text-on-surface-variant transition-colors hover:text-primary"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-error" />
              </button>

              <div className="flex items-center gap-3 rounded-full bg-surface-container-low px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-black text-on-primary">
                  {displayName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? "")
                    .join("")}
                </div>
                <div>
                  <p className="font-headline text-sm font-bold text-primary">
                    {displayName}
                  </p>
                  <p className="text-xs text-on-surface-variant">{role}</p>
                </div>
              </div>
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
