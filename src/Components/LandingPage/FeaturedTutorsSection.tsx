import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Star } from "lucide-react";
import avatarImage from "@/assets/avatar.png";

type FeaturedTutor = {
  id: string;
  displayName: string;
  professionalTitle: string;
  avatarUrl: string | null;
  bio: string;
  hourlyRate: number;
  averageRating: number;
  totalReviews: number;
  primarySubject: string;
};

type FeaturedTutorsSectionProps = {
  tutors: FeaturedTutor[];
};

function formatRate(rate: number): string {
  return `$${Math.round(rate)}/hr`;
}

function TutorPortrait({
  tutor,
  variant = "square",
}: {
  tutor: FeaturedTutor;
  variant?: "wide" | "square";
}) {
  return (
    <div
      className={`relative overflow-hidden bg-surface-container-highest ${
        variant === "wide" ? "h-56 rounded-[1.1rem] md:h-full md:rounded-none" : "mx-auto h-20 w-20 rounded-full"
      }`}
    >
      <Image
        src={tutor.avatarUrl || avatarImage}
        alt={`${tutor.displayName} profile photo`}
        fill
        sizes={variant === "wide" ? "(max-width: 1024px) 100vw, 18vw" : "96px"}
        className="object-cover"
      />
    </div>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center text-secondary">
      <Star className="h-4 w-4 fill-current" />
      <span className="ml-1 text-sm font-extrabold text-primary">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function SubjectBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-on-tertiary-fixed-variant">
      {label}
    </span>
  );
}

function HorizontalTutorCard({ tutor }: { tutor: FeaturedTutor }) {
  return (
    <article className="group grid h-[330px] overflow-hidden rounded-[1.35rem] border border-outline-variant/15 bg-surface-container-lowest shadow-[0px_12px_30px_rgba(0,51,88,0.055)] transition-all hover:-translate-y-1 hover:bg-surface-bright md:grid-cols-[42%_58%]">
      <TutorPortrait tutor={tutor} variant="wide" />
      <div className="flex min-h-0 flex-col p-6">
        <div className="flex items-center gap-3">
          <SubjectBadge label={tutor.primarySubject} />
          <div className="ml-auto">
            <Rating value={tutor.averageRating} />
          </div>
        </div>

        <h3 className="mt-4 line-clamp-1 font-headline text-2xl font-extrabold text-primary">
          {tutor.displayName}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm font-semibold text-secondary">
          {tutor.professionalTitle}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-on-surface-variant">
          {tutor.bio}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-outline-variant/35 pt-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-outline">
              Rate
            </p>
            <p className="mt-1 font-headline text-lg font-black text-primary">
              {formatRate(tutor.hourlyRate)}
            </p>
          </div>
          <Link
            href={`/tutors/${tutor.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary transition-all group-hover:gap-3"
          >
            View Profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function VerticalTutorCard({ tutor }: { tutor: FeaturedTutor }) {
  return (
    <article className="group flex h-[330px] flex-col rounded-[1.35rem] border border-outline-variant/15 bg-surface-container-lowest p-6 text-center shadow-[0px_12px_30px_rgba(0,51,88,0.055)] transition-all hover:-translate-y-1 hover:bg-surface-bright">
      <TutorPortrait tutor={tutor} />

      <div className="mt-4 flex justify-center">
        <SubjectBadge label={tutor.primarySubject} />
      </div>
      <h3 className="mt-3 line-clamp-1 font-headline text-xl font-extrabold text-primary">
        {tutor.displayName}
      </h3>
      <p className="mt-1 line-clamp-1 text-sm font-semibold text-secondary">
        {tutor.professionalTitle}
      </p>
      <div className="mt-2 flex justify-center">
        <Rating value={tutor.averageRating} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-on-surface-variant">
        {tutor.bio}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-outline-variant/35 pt-6 text-left">
        <span className="font-headline text-lg font-black text-primary">
          {formatRate(tutor.hourlyRate)}
        </span>
        <Link
          href={`/tutors/${tutor.id}`}
          aria-label={`View ${tutor.displayName}'s profile`}
          className="rounded-full bg-surface-container-low p-2 text-primary transition-transform group-hover:translate-x-1"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function BecomeTutorCard() {
  return (
    <article className="group relative flex h-[330px] overflow-hidden rounded-[1.35rem] bg-primary-container p-7 shadow-[0px_12px_30px_rgba(0,51,88,0.08)]">
      <div className="relative z-10 flex max-w-[76%] flex-col justify-between gap-6">
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
  const [leadTutor, secondTutor, thirdTutor, fourthTutor, fifthTutor] = tutors;

  if (!leadTutor) {
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
            <h2 className="mt-3 font-headline text-4xl font-black tracking-tight text-primary">
              Learn from the <span className="text-secondary">best minds</span>
            </h2>
            <p className="mt-3 text-base leading-7 text-on-surface-variant">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          <div className="lg:col-span-4">
            <HorizontalTutorCard tutor={leadTutor} />
          </div>
          {secondTutor ? (
            <div className="lg:col-span-3">
              <VerticalTutorCard tutor={secondTutor} />
            </div>
          ) : null}
          {thirdTutor ? (
            <div className="lg:col-span-3">
              <VerticalTutorCard tutor={thirdTutor} />
            </div>
          ) : null}
          {fourthTutor ? (
            <div className="lg:col-span-3">
              <VerticalTutorCard tutor={fourthTutor} />
            </div>
          ) : null}
          {fifthTutor ? (
            <div className="lg:col-span-3">
              <VerticalTutorCard tutor={fifthTutor} />
            </div>
          ) : null}
          <div className="lg:col-span-4">
            <BecomeTutorCard />
          </div>
        </div>
      </div>
    </section>
  );
}
