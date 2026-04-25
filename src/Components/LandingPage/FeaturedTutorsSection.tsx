import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import TutorCard, { TutorCardDisplayData } from "@/Components/Tutors/TutorCard";

type FeaturedTutorsSectionProps = {
  tutors: TutorCardDisplayData[];
};

function BecomeTutorCard() {
  return (
    <article className="group relative flex h-full min-h-[360px] overflow-hidden rounded-[1.75rem] bg-primary-container p-7 shadow-[0px_12px_30px_rgba(0,51,88,0.08)]">
      <div className="relative z-10 flex max-w-[80%] flex-col justify-between gap-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">
            Teach on SkillBridge
          </p>
          <h3 className="mt-3 font-headline text-3xl font-black tracking-tight text-white">
            Want to teach?
          </h3>
          <p className="mt-3 text-sm leading-6 text-on-primary-container/90">
            Join the tutor side of the marketplace and turn your expertise into
            structured, bookable learning sessions.
          </p>
        </div>

        <Link
          href="/register"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-extrabold text-on-secondary transition-all hover:gap-3"
        >
          Become a Tutor
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="pointer-events-none absolute -bottom-7 -right-5 text-on-primary-container opacity-12 transition-transform duration-500 group-hover:scale-105">
        <GraduationCap size={190} strokeWidth={1.15} className="select-none" />
      </div>
    </article>
  );
}

export default function FeaturedTutorsSection({
  tutors,
}: FeaturedTutorsSectionProps) {
  const featuredTutors = tutors.slice(0, 5);

  if (featuredTutors.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto w-11/12 max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-secondary">
              Featured tutors
            </p>
            <h2 className="mt-3 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
              Learn from the <span className="text-secondary">best minds</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-on-surface-variant">
              Top tutors surfaced from real profile strength, structured subjects,
              ratings, and platform activity.
            </p>
          </div>
          <Link
            href="/tutors"
            className="group inline-flex items-center gap-2 font-extrabold text-primary transition-all hover:gap-4"
          >
            Browse all tutors
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
          <BecomeTutorCard />
        </div>
      </div>
    </section>
  );
}
