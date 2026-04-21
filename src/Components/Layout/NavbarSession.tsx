"use client";

import { LayoutDashboard, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logoutWithAppAuth, useAppAuthSession, type AppAuthUser } from "@/lib/auth";
import { showAuthErrorToast, showAuthSuccessToast } from "@/lib/auth/auth-alerts";
import { getRoleDashboardPath } from "@/lib/dashboard-routes";

type NavbarSessionProps = {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function NavbarSession({
  variant,
  onNavigate,
}: NavbarSessionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useAppAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    onNavigate?.();
    try {
      await logoutWithAppAuth();
      await showAuthSuccessToast(
        "Signed out",
        "You have been logged out successfully."
      );
      router.refresh();
    } catch (error) {
      await showAuthErrorToast(
        "Sign-out failed",
        error instanceof Error
          ? error.message
          : "We couldn't sign you out right now."
      );
    }
  };

  if (isPending) {
    return (
      <div
        className={
          variant === "desktop"
            ? "flex items-center gap-3"
            : "flex flex-col gap-3 pt-2"
        }
      >
        <div className="h-10 w-10 animate-pulse rounded-full bg-surface-container-high" />
      </div>
    );
  }

  if (!session?.user) {
    if (variant === "desktop") {
      return (
        <>
          <Link
            href="/login"
            className="rounded-xl px-5 py-2 font-headline text-sm font-semibold text-primary transition-all hover:bg-surface-container-low"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-primary px-6 py-2.5 font-headline text-sm font-semibold text-on-primary shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign Up
          </Link>
        </>
      );
    }

    return (
      <div className="flex flex-col gap-3 pt-2">
        <Link
          href="/login"
          onClick={onNavigate}
          className="flex h-12 items-center justify-center rounded-xl font-bold text-primary"
        >
          Log In
        </Link>
        <Link
          href="/register"
          onClick={onNavigate}
          className="flex h-12 items-center justify-center rounded-xl bg-primary font-bold text-on-primary shadow-md"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const user: AppAuthUser = session.user;
  const displayName = user.name?.trim() || user.email || "Account";
  const avatarSrc = user.image?.trim();
  const dashboardHref = getRoleDashboardPath(user.role);

  const avatarButton = (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full p-0.5 ring-2 ring-transparent transition-all hover:ring-primary/25 focus:ring-primary/40 focus:outline-none"
      aria-expanded={menuOpen}
      aria-haspopup="true"
      onClick={(e) => {
        e.stopPropagation();
        setMenuOpen((v) => !v);
      }}
    >
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <Image
          src="/avatar-default.svg"
          alt=""
          width={40}
          height={40}
          className="rounded-full"
        />
      )}
    </button>
  );

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-3 border-t border-outline-variant/20 pt-4">
        <div className="flex items-center gap-3 px-1">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Image
              src="/avatar-default.svg"
              alt=""
              width={48}
              height={48}
              className="shrink-0 rounded-full"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-headline text-sm font-bold text-primary">
              {displayName}
            </p>
            {user.email ? (
              <p className="truncate text-xs text-on-surface-variant">
                {user.email}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-12 items-center justify-center gap-2 rounded-xl font-bold text-primary transition-colors hover:bg-surface-container-low"
        >
          <LogOut size={18} />
          Sign out
        </button>
        <Link
          href={dashboardHref}
          onClick={onNavigate}
          className="flex h-12 items-center justify-center gap-2 rounded-xl font-bold text-primary transition-colors hover:bg-surface-container-low"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      {avatarButton}
      {menuOpen ? (
        <div
          className="absolute right-0 z-[60] mt-2 w-56 rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-2 shadow-xl"
          role="menu"
        >
          <div className="border-b border-outline-variant/20 px-4 py-3">
            <p className="truncate font-headline text-sm font-bold text-primary">
              {displayName}
            </p>
            {user.email ? (
              <p className="truncate text-xs text-on-surface-variant">
                {user.email}
              </p>
            ) : null}
          </div>
          <Link
            href={dashboardHref}
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-surface-container-low ${
              pathname.startsWith("/dashboard")
                ? "text-primary"
                : "text-on-surface"
            }`}
          >
            <LayoutDashboard size={18} className="text-on-surface-variant" />
            Dashboard
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <LogOut size={18} className="text-on-surface-variant" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
