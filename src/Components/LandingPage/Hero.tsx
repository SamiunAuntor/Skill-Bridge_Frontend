import { Sparkles, Search, ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-image.png";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex min-h-[780px] items-center overflow-hidden bg-surface">
      <div className="absolute top-0 right-0 h-full w-1/3 translate-x-20 skew-x-12 bg-surface-container-low opacity-50" />

      <div className="relative z-10 mx-auto grid w-11/12 max-w-7xl grid-cols-1 items-center gap-10 py-10 lg:grid-cols-12">

        {/* Right Side / Image Part: Now forced to top on mobile using order-first lg:order-last */}
        <div className="relative order-first mb-12 lg:col-span-5 lg:order-last">
          <div className="relative aspect-[4/5] overflow-hidden rounded-full shadow-2xl">
            <Image
              src={heroImage}
              alt="Mentor Portrait"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-6 left-4 lg:-left-6 flex items-center gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-xl">
            <div className="flex -space-x-3">
              <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
              <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-300" />
              <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">12k+ Active Students</p>
              <div className="flex text-xs text-secondary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    fill="currentColor"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Left Side / Text Content: lg:order-first keeps it on the left for desktop */}
        <div className="space-y-8 lg:col-span-7 lg:order-first">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-secondary-container">
            <Sparkles size={14} fill="currentColor" />
            Excellence in Learning
          </div>
          <h1 className="text-[2.75rem] leading-[1.1] font-extrabold tracking-tight text-primary md:text-[4.25rem]">
            Connect with <span className="text-secondary">Expert Tutors</span>,
            Learn Anything.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
            Access high-tier mentorship and curated learning paths designed by
            the world's most intellectual architects. Precision learning
            for the digital age.
          </p>
          <div className="flex max-w-2xl flex-col gap-4 sm:flex-row">
            <div className="relative flex-grow">
              <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-outline" size={20} />
              <input
                className="w-full rounded-md border-none bg-surface-container-highest py-4 pr-4 pl-12 text-on-surface focus:ring-2 focus:ring-surface-tint/40"
                placeholder="Search by subject, skill, or tutor name..."
                type="text"
              />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 font-bold text-on-primary transition-all hover:shadow-lg">
              Find My Tutor
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}