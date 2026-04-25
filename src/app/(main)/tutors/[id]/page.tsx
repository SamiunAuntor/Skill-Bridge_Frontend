import {
  BadgeCheck,
  BookOpen,
  BookOpenCheck,
  FlaskConical,
  Star,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import TutorBookingSidebar from "@/Components/Tutors/TutorBookingSidebar";
import TutorTestimonialsSection from "@/Components/Tutors/TutorTestimonialsSection";
import { TutorApiError, getTutorById } from "@/lib/tutor-api";
import { TutorDetailResponse, TutorEducation } from "@/types/tutor";

export const metadata = {
  title: "Tutor Profile | SkillBridge",
  description:
    "Explore tutor subjects, education, student reviews, and booking details on SkillBridge.",
};

type TutorProfilePageProps = {
  params: Promise<{ id: string }>;
};

function formatHoursTaught(totalHoursTaught: number): string {
  if (totalHoursTaught >= 100) {
    return `${Math.round(totalHoursTaught)}+`;
  }

  if (Number.isInteger(totalHoursTaught)) {
    return String(totalHoursTaught);
  }

  return totalHoursTaught.toFixed(1);
}

function formatAverageRating(value: number, totalReviews: number): string {
  if (totalReviews <= 0) {
    return "--";
  }

  return value.toFixed(2);
}

function EducationCard({
  item,
  elevated,
}: {
  item: TutorEducation;
  elevated: boolean;
}) {
  return (
    <article
      className={`rounded-xl p-8 ${
        elevated
          ? "border border-outline-variant/10 bg-surface-container-lowest shadow-[0px_12px_32px_rgba(0,51,88,0.06)]"
          : "bg-surface-container-low"
      }`}
    >
      <p className="mb-2 text-sm font-bold text-secondary">
        {item.startYear}
        {item.endYear ? ` - ${item.endYear}` : " - Present"}
      </p>
      <h3 className="text-lg font-bold text-primary">{item.degree}</h3>
      <p className="mt-1 text-sm text-on-surface-variant">{item.institution}</p>
      <p className="mt-1 text-xs font-medium text-on-surface-variant">
        {item.categoryName}
      </p>
      {item.description ? (
        <p className="mt-4 text-sm italic text-on-tertiary-fixed-variant">
          {item.description}
        </p>
      ) : null}
    </article>
  );
}

export default async function TutorProfilePage({
  params,
}: TutorProfilePageProps) {
  const { id } = await params;

  let tutorData: TutorDetailResponse;

  try {
    tutorData = await getTutorById(id);
  } catch (error) {
    if (error instanceof TutorApiError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }

  const tutor = tutorData.tutor;
  const testimonials = tutor.testimonials;

  return (
    <section className="pb-20 pt-8">
      <div className="mx-auto w-11/12 max-w-[1440px]">
        <header className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center lg:col-span-8">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-[1.4rem] bg-gradient-to-r from-primary to-secondary opacity-20 blur transition duration-700 group-hover:opacity-35" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={tutor.displayName}
                className="relative h-44 w-44 rounded-[1.35rem] border-4 border-surface-container-lowest object-cover shadow-xl md:h-48 md:w-48"
                src={
                  tutor.avatarUrl ??
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"
                }
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 space-y-3">
              {tutor.isTopRated ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-on-secondary-container md:text-[10px]">
                  <BadgeCheck className="h-3 w-3" />
                  Top Rated Expert
                </div>
              ) : null}

              <h1 className="font-headline text-[2.15rem] font-extrabold leading-[0.94] tracking-tight text-primary md:text-[2.55rem] lg:text-[3rem]">
                {tutor.displayName}
              </h1>

              <p className="max-w-2xl text-[0.9rem] font-medium leading-[1.28] text-on-surface-variant md:text-[0.98rem] lg:text-[1.08rem]">
                {tutor.professionalTitle.trim() || "Professional Tutor"}
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {tutor.categories.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-md bg-tertiary-fixed px-2.5 py-1 text-[10px] font-semibold text-on-tertiary-fixed-variant md:text-[11px]"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6 lg:col-span-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-surface-container-low p-6 text-center shadow-sm">
                <div className="font-headline text-3xl font-black text-primary">
                  {formatAverageRating(tutor.averageRating, tutor.totalReviews)}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  Rating
                </div>
              </div>
              <div className="rounded-xl bg-surface-container-low p-6 text-center shadow-sm">
                <div className="font-headline text-3xl font-black text-primary">
                  {formatHoursTaught(tutor.totalHoursTaught)}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  Hours Taught
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            <section>
                <h2 className="mb-6 flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                <Star className="h-5 w-5 text-secondary" />
                Bio
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-on-surface-variant">
                <p>{tutor.bio}</p>
              </div>
            </section>

            <section>
              <h2 className="mb-8 flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                <FlaskConical className="h-5 w-5 text-secondary" />
                Offered Tutoring Subjects
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {tutor.subjects.length > 0 ? (
                  tutor.subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-5 py-4 shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                        {subject.iconUrl ? (
                          <Image
                            src={subject.iconUrl}
                            alt={`${subject.name} icon`}
                            width={28}
                            height={28}
                            className="h-7 w-7 object-contain"
                          />
                        ) : (
                          <BookOpen className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-primary">{subject.name}</div>
                        <div className="text-xs text-on-surface-variant">
                          {subject.categoryName}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <article className="rounded-xl bg-surface-container-low p-8">
                    <p className="text-sm text-on-surface-variant">
                      Offered subjects will appear when the tutor adds them to the
                      profile.
                    </p>
                  </article>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-8 flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                <BookOpenCheck className="h-5 w-5 text-secondary" />
                Academic Background
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {tutor.education.length > 0 ? (
                  tutor.education.map((item, index) => (
                    <EducationCard
                      key={item.id}
                      item={item}
                      elevated={index === 0}
                    />
                  ))
                ) : (
                  <article className="rounded-xl bg-surface-container-low p-8">
                    <p className="text-sm text-on-surface-variant">
                      Academic background will appear once the tutor completes their
                      profile setup.
                    </p>
                  </article>
                )}
              </div>
            </section>
          </div>

          <TutorBookingSidebar
            tutorId={tutor.id}
            hourlyRate={tutor.hourlyRate}
            subjects={tutor.subjects}
          />
        </div>

        <div className="mt-16">
          <TutorTestimonialsSection
            testimonials={testimonials}
            totalReviews={tutor.totalReviews}
          />
        </div>
      </div>
    </section>
  );
}
