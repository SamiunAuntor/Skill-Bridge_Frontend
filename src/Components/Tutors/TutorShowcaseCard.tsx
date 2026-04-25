import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Star } from "lucide-react";
import avatarImage from "@/assets/avatar.png";

export type TutorShowcaseCardData = {
  id: string;
  displayName: string;
  professionalTitle: string;
  avatarUrl: string | null;
  bio: string;
  hourlyRate: number;
  averageRating: number;
  totalReviews: number;
  categories: string[];
  subjects: string[];
  href: string;
  isTopRated?: boolean;
  topBandTone?: "teal" | "indigo" | "emerald" | "slate";
};

const toneClasses: Record<NonNullable<TutorShowcaseCardData["topBandTone"]>, string> = {
  teal: "bg-[#2f6665]",
  indigo: "bg-[#4b67a7]",
  emerald: "bg-[#2f6b5a]",
  slate: "bg-[#46586d]",
};

function formatHourlyRate(rate: number): string {
  return `$${Math.round(rate)}`;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getVisibleSubjects(subjects: string[]) {
  return subjects.slice(0, 3);
}

function getRemainingCount(subjects: string[]) {
  return Math.max(0, subjects.length - 3);
}

function getVisibleCategories(categories: string[]) {
  return categories.slice(0, 2).join(", ");
}

export default function TutorShowcaseCard({
  tutor,
}: {
  tutor: TutorShowcaseCardData;
}) {
  const toneClass = toneClasses[tutor.topBandTone ?? "teal"];
  const visibleSubjects = getVisibleSubjects(tutor.subjects);
  const remainingSubjects = getRemainingCount(tutor.subjects);
  const visibleCategories = getVisibleCategories(tutor.categories);
  const hasLongBio = tutor.bio.trim().length > 120;

  return (
    <article className="group flex h-[360px] flex-col overflow-hidden rounded-[2rem] border border-outline-variant/12 bg-surface-container-lowest shadow-[0px_12px_32px_rgba(0,51,88,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_18px_38px_rgba(0,51,88,0.09)]">
      <div className={`h-18 shrink-0 ${toneClass}`} />

      <div className="relative flex h-full flex-col px-6 pb-6">
        <div className="-mt-11 flex items-start gap-4">
          <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[6px] border-surface-container-lowest bg-surface-container-highest shadow-[0px_8px_22px_rgba(0,51,88,0.08)]">
            {tutor.avatarUrl ? (
              <Image
                src={tutor.avatarUrl}
                alt={tutor.displayName}
                fill
                sizes="88px"
                className="object-cover"
              />
            ) : (
              <>
                <Image
                  src={avatarImage}
                  alt=""
                  fill
                  sizes="88px"
                  className="object-cover opacity-20"
                />
                <span className="relative z-10 text-2xl font-black tracking-tight text-primary">
                  {getInitials(tutor.displayName)}
                </span>
              </>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-12">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="line-clamp-1 font-headline text-[1.85rem] font-extrabold leading-none tracking-tight text-primary">
                  {tutor.displayName}
                </h3>
                <p className="mt-1 line-clamp-1 text-base font-medium text-on-surface-variant">
                  {tutor.professionalTitle}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-headline text-[1.1rem] font-extrabold tracking-tight text-primary">
                  {formatHourlyRate(tutor.hourlyRate)}
                  <span className="ml-0.5 text-sm font-medium text-on-surface-variant">
                    /hr
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-secondary">
              <Star className="h-4 w-4 fill-current" />
              <p className="text-sm font-semibold text-primary">
                {tutor.averageRating.toFixed(1)}{" "}
                <span className="text-on-surface-variant">
                  ({tutor.totalReviews} reviews)
                </span>
              </p>
            </div>
          </div>
        </div>

        {tutor.isTopRated ? (
          <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-secondary-container">
            <BadgeCheck className="h-3.5 w-3.5" />
            Top Rated
          </div>
        ) : null}

        {visibleCategories ? (
          <p className="mt-4 line-clamp-1 text-[0.9rem] font-medium text-on-surface-variant">
            <span className="font-semibold text-primary">Categories:</span> {visibleCategories}
            {tutor.categories.length > 2 ? ` +${tutor.categories.length - 2} more` : ""}
          </p>
        ) : null}

        <div className="mt-3 flex min-h-[64px] flex-wrap content-start gap-2">
          {visibleSubjects.length > 0 ? (
            <>
              {visibleSubjects.map((subject) => (
                <span
                  key={subject}
                  className="line-clamp-1 rounded-full bg-surface px-3 py-1.5 text-[0.9rem] leading-none text-on-surface-variant"
                >
                  {subject}
                </span>
              ))}
              {remainingSubjects > 0 ? (
                <span className="rounded-full bg-surface px-3 py-1.5 text-[0.9rem] leading-none text-primary">
                  +{remainingSubjects} more
                </span>
              ) : null}
            </>
          ) : (
            <span className="rounded-full bg-surface px-3 py-1.5 text-[0.9rem] leading-none text-on-surface-variant">
              General tutoring
            </span>
          )}
        </div>

        <div className="mt-4 min-h-[78px]">
          <p className="line-clamp-2 text-[0.97rem] leading-7 text-on-surface-variant">
            {tutor.bio}
          </p>
          {hasLongBio ? (
            <Link
              href={tutor.href}
              className="mt-1 inline-flex text-sm font-semibold text-secondary hover:text-primary"
            >
              See more
            </Link>
          ) : null}
        </div>

        <div className="mt-auto border-t border-outline-variant/28 pt-5">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-[1.1rem] bg-secondary-container/30 px-4 py-2 text-base font-medium leading-tight text-secondary">
              View profile
            </span>
            <Link
              href={tutor.href}
              className="inline-flex items-center justify-center rounded-[1.1rem] border border-outline-variant/18 bg-surface px-5 py-3 text-base font-medium text-primary transition-all hover:border-primary/20 hover:bg-primary hover:text-on-primary"
            >
              <span className="hidden sm:inline">Open</span>
              <ArrowRight className="h-5 w-5 sm:ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
