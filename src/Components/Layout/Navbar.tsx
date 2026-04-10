import Link from "next/link";

import ThemeToggle from "@/Components/Theme/ThemeToggle";

const navLinks = [
  { href: "#", label: "Find Tutors" },
  { href: "#", label: "Subjects" },
  { href: "#", label: "Resources" },
  { href: "#", label: "About" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-background/80 shadow-[0px_4px_20px_rgba(0,51,88,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-20 w-11/12 max-w-[1440px] items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-black tracking-tighter text-primary"
        >
          SkillBridge
        </Link>

        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-headline text-sm font-semibold tracking-tight text-on-surface-variant transition-colors hover:text-secondary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-md px-5 py-2 font-headline text-sm font-semibold text-primary transition-all hover:bg-[#f0f4f8]"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="scale-[0.98] rounded-md bg-primary px-5 py-2 font-headline text-sm font-semibold text-on-primary shadow-sm transition-transform active:opacity-80"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
