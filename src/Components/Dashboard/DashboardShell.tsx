"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { logoutWithAppAuth, useAppAuthSession } from "@/lib/auth";
import { showAuthErrorToast, showAuthSuccessToast } from "@/lib/auth/auth-alerts";
import { dashboardNavByRole } from "./dashboard.config";
import { UserRole } from "@/types/auth";
import ThemeToggle from "@/Components/Theme/ThemeToggle";
import DashboardPageLoader from "@/Components/Dashboard/DashboardPageLoader";
import { getRoleDashboardPath } from "@/lib/dashboard-routes";
import BrandLogo from "@/Components/Layout/BrandLogo";
import NotificationBell from "@/Components/Notifications/NotificationBell";

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
  const { data: session, isPending } = useAppAuthSession();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen bg-surface">
        <DashboardPageLoader label="Loading dashboard..." />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-surface">
        <DashboardPageLoader label="Verifying dashboard access..." />
      </div>
    );
  }

  const user = session.user;
  const role = (user.role as UserRole | undefined) ?? "student";
  const isAdminDashboard = pathname.startsWith("/dashboard/admin");
  const navItems = dashboardNavByRole[role];
  const roleDashboardHome = getRoleDashboardPath(role);
  const displayName = getDisplayName(user);
  const avatarSrc = user.image?.trim();
  const sidebarActionClass =
    "flex w-full items-center justify-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface px-4 py-3 text-center text-[11px] font-semibold text-on-surface-variant shadow-sm transition-all hover:border-primary/20 hover:bg-surface-container-low hover:text-primary";

  const sidebarContent = (
    <>
      <div className="mb-8 flex items-start justify-between gap-4 lg:mb-10">
        <div>
          <Link
            href="/"
            aria-label="SkillBridge home"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <BrandLogo className="text-[1.6rem]" />
          </Link>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-on-surface-variant">
            Academic Excellence
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(false)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/20 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary lg:hidden"
          aria-label="Close dashboard navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isHomeItem = item.href === roleDashboardHome;
          const isActive = isHomeItem
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex items-center rounded-2xl px-4 py-3 font-headline text-[0.9rem] font-semibold transition-all duration-300 lg:rounded-r-full lg:rounded-l-none ${
                isActive
                  ? "dashboard-nav-active"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 space-y-4 border-t border-outline-variant/20 pt-6">
        <ThemeToggle fullWidth />
        <button
          type="button"
          onClick={async () => {
            try {
              await logoutWithAppAuth();
              await showAuthSuccessToast(
                "Signed out",
                "You have been logged out successfully."
              );
              router.replace("/");
              router.refresh();
            } catch (error) {
              await showAuthErrorToast(
                "Sign-out failed",
                error instanceof Error
                  ? error.message
                  : "We couldn't sign you out right now."
              );
            }
          }}
          className={sidebarActionClass}
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-surface">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr] lg:items-start">
        <div
          className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 lg:hidden ${
            isMobileNavOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsMobileNavOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[292px] max-w-[84vw] flex-col border-r border-outline-variant/10 bg-surface-container-lowest px-5 py-6 shadow-[0px_18px_48px_rgba(0,0,0,0.18)] transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0 lg:border-b-0 lg:px-6 lg:py-8 lg:shadow-none ${
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>

        <div className="min-w-0 bg-surface">
          <header className="sticky top-0 z-30 border-b border-outline-variant/25 bg-surface/95 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 pb-4 pt-4 sm:px-6 lg:px-8 lg:pb-5 lg:pt-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-low text-on-surface-variant transition-colors hover:text-primary lg:hidden"
                  aria-label="Open dashboard navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <h1 className="font-headline text-[1.25rem] font-extrabold tracking-tight text-primary sm:text-[1.4rem]">
                  {getRoleHeading(role)}
                </h1>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {!isAdminDashboard && role !== "admin" ? (
                  <NotificationBell role={role} />
                ) : null}

                <div className="flex min-w-0 items-center gap-3 rounded-full bg-surface-container-low px-3 py-2">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[13px] font-black text-on-primary">
                      {displayName
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase() ?? "")
                        .join("")}
                    </div>
                  )}
                  <div className="hidden min-w-0 sm:block">
                    <p className="truncate font-headline text-[13px] font-bold text-primary">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">{role}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1440px] px-4 pb-6 pt-6 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
