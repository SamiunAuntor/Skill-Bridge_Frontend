import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  GraduationCap,
  Layers3,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

export const metadata = {
  title: "About | SkillBridge",
  description:
    "Learn how SkillBridge connects students with trusted tutors through structured subjects, bookings, payments, and role-based dashboards.",
};

const platformPillars = [
  {
    title: "Structured discovery",
    description:
      "Students do not have to search through random tags. Subjects, categories, and degrees are curated so learning paths stay clear.",
    icon: Layers3,
  },
  {
    title: "Tutor-led expertise",
    description:
      "Tutors build rich profiles with education, subjects, availability, and session history so students can choose with confidence.",
    icon: GraduationCap,
  },
  {
    title: "Protected learning flow",
    description:
      "Authentication, role-based dashboards, booking holds, and payment states keep the platform safer for students and tutors.",
    icon: ShieldCheck,
  },
];

const roleCards = [
  {
    title: "For students",
    description:
      "Find tutors by subject, review profile details, book available slots, pay securely, and track upcoming sessions from one dashboard.",
    icon: UsersRound,
  },
  {
    title: "For tutors",
    description:
      "Create a structured teaching profile, manage availability, receive booked sessions, and follow earnings-ready session history.",
    icon: BookOpenCheck,
  },
  {
    title: "For admins",
    description:
      "Manage users, bookings, categories, subjects, degrees, and platform reviews from a dedicated moderation dashboard.",
    icon: BadgeCheck,
  },
];

const principles = [
  "Clear role separation between student, tutor, and admin experiences.",
  "Admin-controlled academic catalog so tutor setup stays consistent.",
  "Booking-first session flow designed to support secure payment integration.",
  "Public subject discovery that can grow into subject detail and tutor-matching pages.",
];

export default function AboutPage() {
  return (
    <section className="overflow-hidden px-6 pb-24 pt-8 md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="relative rounded-[2.25rem] border border-outline-variant/20 bg-surface-container-lowest px-6 py-14 shadow-[0px_18px_60px_rgba(0,51,88,0.08)] md:px-12 lg:px-16">
          <div className="absolute right-8 top-8 hidden h-48 w-48 rounded-full bg-secondary/10 blur-3xl lg:block" />
          <div className="absolute bottom-10 left-12 hidden h-56 w-56 rounded-full bg-primary/10 blur-3xl lg:block" />

          <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-secondary">
                About SkillBridge
              </p>
              <h1 className="mt-4 max-w-4xl font-headline text-4xl font-black tracking-tight text-primary md:text-6xl">
                A focused learning marketplace built around trust, structure, and real sessions.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant">
                SkillBridge connects students with tutors through a clean academic
                catalog, role-based dashboards, bookable availability, and a payment-ready
                session flow. The goal is simple: make finding, booking, and managing
                tutoring feel organized instead of chaotic.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/tutors"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-on-primary transition-transform hover:-translate-y-0.5"
                >
                  Find tutors
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/subjects"
                  className="inline-flex items-center justify-center rounded-full border border-outline-variant/40 px-6 py-3 font-bold text-primary transition-colors hover:bg-surface-container-low"
                >
                  Explore subjects
                </Link>
              </div>
            </div>

            <div className="relative rounded-[2rem] bg-primary p-6 text-on-primary shadow-[0px_18px_48px_rgba(0,51,88,0.22)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-on-secondary">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-8 font-headline text-3xl font-black">
                Why it exists
              </h2>
              <p className="mt-4 text-base leading-7 text-on-primary/80">
                Most tutoring platforms become messy when subjects, tutor
                qualifications, booking states, payments, and admin moderation are
                treated as separate afterthoughts. SkillBridge is designed as one
                connected flow from discovery to completed session.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-headline text-3xl font-black">3</p>
                  <p className="mt-1 text-sm text-on-primary/75">role-specific dashboards</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-headline text-3xl font-black">1</p>
                  <p className="mt-1 text-sm text-on-primary/75">structured learning marketplace</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {platformPillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article
                key={pillar.title}
                className="rounded-[1.75rem] border border-outline-variant/15 bg-surface-container-lowest p-7 shadow-[0px_12px_32px_rgba(0,51,88,0.05)]"
              >
                <div className="theme-primary-soft-icon flex h-14 w-14 items-center justify-center rounded-2xl">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-6 font-headline text-2xl font-extrabold text-primary">
                  {pillar.title}
                </h2>
                <p className="mt-3 leading-7 text-on-surface-variant">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-surface-container-low p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
              Product principles
            </p>
            <h2 className="mt-4 font-headline text-3xl font-black text-primary">
              Built to stay understandable as the platform grows.
            </h2>
            <div className="mt-8 space-y-4">
              {principles.map((principle) => (
                <div
                  key={principle}
                  className="flex gap-3 rounded-2xl bg-surface-container-lowest p-4"
                >
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                  <p className="leading-7 text-on-surface-variant">{principle}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            {roleCards.map((role) => {
              const Icon = role.icon;

              return (
                <article
                  key={role.title}
                  className="group rounded-[1.5rem] border border-outline-variant/15 bg-surface-container-lowest p-6 transition-all hover:-translate-y-1 hover:bg-surface-bright"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="theme-secondary-soft flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl font-extrabold text-primary">
                        {role.title}
                      </h3>
                      <p className="mt-2 leading-7 text-on-surface-variant">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
