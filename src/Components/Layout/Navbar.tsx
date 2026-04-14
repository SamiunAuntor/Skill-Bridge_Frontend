"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/Components/Theme/ThemeToggle";
import NavbarSession from "@/Components/Layout/NavbarSession";

const navLinks = [
  { href: "/tutors", label: "Find Tutors" },
  { href: "#", label: "Subjects" },
  { href: "#", label: "Resources" },
  { href: "#", label: "About" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 w-full bg-background/80 shadow-[0px_4px_20px_rgba(0,51,88,0.04)] backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-20 w-11/12 max-w-[1440px] items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-primary">
          SkillBridge
        </Link>

        <div className="hidden items-center space-x-8 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-headline text-sm font-semibold tracking-tight transition-colors hover:text-secondary ${
                  isActive
                    ? "border-b-2 border-secondary pb-1 text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <NavbarSession variant="desktop" />
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen((current) => !current)}
            className="text-primary transition-transform active:scale-90"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`absolute left-0 top-20 w-full origin-top transform bg-surface-container-lowest p-6 shadow-xl transition-all duration-300 lg:hidden ${
          isOpen
            ? "scale-y-100 opacity-100"
            : "pointer-events-none scale-y-95 opacity-0"
        }`}
      >
        <div className="flex flex-col space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-lg p-3 font-headline text-lg font-bold transition-colors hover:bg-surface-container-low ${
                  isActive ? "text-secondary" : "text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <hr className="border-outline-variant/20" />
          <NavbarSession variant="mobile" onNavigate={() => setIsOpen(false)} />
        </div>
      </div>
    </nav>
  );
}
