"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/login", label: "Sign In" },
  { href: "/register", label: "Create Account" },
];

export default function AuthTabs() {
  const pathname = usePathname();

  return (
    <div className="flex rounded-xl bg-surface-container-low p-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-3 text-center text-sm font-headline transition-all duration-300 ${
              isActive
                ? "rounded-lg bg-surface-container-lowest font-bold text-primary shadow-sm"
                : "font-medium text-on-surface-variant hover:text-primary"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
