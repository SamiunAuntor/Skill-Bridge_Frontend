"use client";

import { Sparkles, Search, ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-image.png";

type HeroProps = {
  activeStudents: number;
};

function formatStudentCount(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

export default function Hero({ activeStudents }: HeroProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const studentLabel = activeStudents === 1 ? "Active Student" : "Active Students";

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();
    window.addEventListener("themechange", updateTheme);

    return () => {
      window.removeEventListener("themechange", updateTheme);
    };
  }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      router.push("/tutors");
      return;
    }

    router.push(`/tutors?q=${encodeURIComponent(normalizedQuery)}`);
  }

  return (
    <section className="relative flex min-h-[780px] items-center overflow-hidden bg-surface">
      <div className="absolute right-0 top-0 h-full w-1/3 translate-x-20 skew-x-12 bg-surface-container-low opacity-50" />

      <div className="relative z-10 mx-auto grid w-11/12 max-w-7xl grid-cols-1 items-center gap-10 py-10 lg:grid-cols-12">
        <div className="relative order-first mb-12 lg:order-last lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-full shadow-2xl">
            <Image
              src={heroImage}
              alt="Mentor Portrait"
              fill
              sizes="(max-width: 1024px) 100vw, 38vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-6 left-4 flex items-center gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-xl lg:-left-6">
            <div className="flex -space-x-3">
              <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
              <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-300" />
              <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">
                {formatStudentCount(activeStudents)} {studentLabel}
              </p>
              <div className="flex text-xs text-secondary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:order-first lg:col-span-7">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: isDark
                ? "rgba(104,250,221,0.16)"
                : "rgba(0,107,92,0.12)",
              color: isDark ? "#68fadd" : "#006b5c",
            }}
          >
            <Sparkles size={14} fill="currentColor" color={isDark ? "#68fadd" : "#006b5c"} />
            <h3>Excellence in Learning</h3>
          </div>
          <h1 className="text-[2.75rem] font-extrabold leading-[1.1] tracking-tight text-primary md:text-[4.25rem]">
            Connect with <span className="text-secondary">Expert Tutors</span>,
            Learn Anything.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
            Access high-tier mentorship and curated learning paths designed by
            the world&apos;s most intellectual architects. Precision learning for
            the digital age.
          </p>
          <form
            className="flex max-w-2xl flex-col gap-4 sm:flex-row"
            onSubmit={handleSearch}
          >
            <div className="relative flex-grow">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                size={20}
              />
              <input
                className="w-full rounded-md border-none bg-surface-container-highest py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-surface-tint/40"
                placeholder="Search by subject, skill, or tutor name..."
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 font-bold text-on-primary transition-all hover:shadow-lg"
            >
              Find My Tutor
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
