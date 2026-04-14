import Link from "next/link";
import { notFound } from "next/navigation";
import TutorBookingSidebar from "@/Components/Tutors/TutorBookingSidebar";
import { TutorApiError, getTutorById } from "@/lib/tutor-api";

export const metadata = {
  title: "Tutor Profile | SkillBridge",
  description:
    "Explore tutor expertise, education, reviews, and upcoming availability on SkillBridge.",
};

type TutorProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatRelativeDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function TutorProfilePage({
  params,
}: TutorProfilePageProps) {
  const { id } = await params;
  const result = await getTutorById(id)
    .then((data) => ({ data }))
    .catch((error: unknown) => ({ error }));

  if ("error" in result) {
    if (result.error instanceof TutorApiError && result.error.statusCode === 404) {
      notFound();
    }

    return (
      <section className="px-6 pb-20 pt-8 md:px-8">
        <div className="mx-auto max-w-[1440px] rounded-[1.75rem] bg-error-container p-10 text-on-error-container">
          <h1 className="font-headline text-2xl font-bold">
            Tutor profile could not be loaded
          </h1>
          <p className="mt-3">
            {result.error instanceof Error
              ? result.error.message
              : "Something went wrong while loading the tutor profile."}
          </p>
          <Link
            href="/tutors"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-on-primary"
          >
            Back to tutors
          </Link>
        </div>
      </section>
    );
  }

  const { tutor } = result.data;

  return (
    <section className="px-6 pb-20 pt-8 md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center lg:col-span-8">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-25 blur" />
              {tutor.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tutor.avatarUrl}
                  alt={tutor.displayName}
                  className="relative h-48 w-48 rounded-full border-4 border-surface-container-lowest object-cover shadow-xl md:h-56 md:w-56"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-surface-container-lowest bg-primary text-5xl font-black text-on-primary shadow-xl md:h-56 md:w-56">
                  {getInitials(tutor.displayName)}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {tutor.isTopRated ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Top Rated Expert
                </div>
              ) : null}
              <h1 className="font-headline text-5xl font-extrabold leading-none tracking-tight text-primary">
                {tutor.displayName}
              </h1>
              <p className="max-w-2xl text-xl font-medium text-on-surface-variant">
                {tutor.bio}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                {tutor.categories.concat(tutor.expertise).slice(0, 4).map((item) => (
                  <span
                    key={item.id}
                    className="rounded-xl bg-tertiary-fixed px-4 py-1.5 text-sm font-semibold text-on-tertiary-fixed-variant"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-4">
            <div className="rounded-2xl bg-surface-container-low p-6 text-center shadow-sm">
              <p className="font-headline text-4xl font-black text-primary">
                {tutor.averageRating.toFixed(1)}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                Rating
              </p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-6 text-center shadow-sm">
              <p className="font-headline text-4xl font-black text-primary">
                {Math.round(tutor.totalHoursTaught)}+
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                Hours Taught
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            <section>
              <h2 className="mb-6 flex items-center gap-3 font-headline text-3xl font-bold text-primary">
                <span className="material-symbols-outlined text-secondary">
                  person_search
                </span>
                The Academic Blueprint
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-on-surface-variant">
                <p>{tutor.bio}</p>
                <p>
                  {tutor.displayName} has guided learners through{" "}
                  {tutor.experienceYears} years of focused teaching and{" "}
                  {tutor.totalReviews} documented student reviews on SkillBridge.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-8 flex items-center gap-3 font-headline text-3xl font-bold text-primary">
                <span className="material-symbols-outlined text-secondary">
                  history_edu
                </span>
                Foundational Credentials
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {tutor.education.length > 0 ? (
                  tutor.education.map((item, index) => (
                    <article
                      key={item.id}
                      className={`rounded-2xl p-8 ${
                        index % 2 === 0
                          ? "border border-outline-variant/10 bg-surface-container-lowest shadow-[0px_12px_32px_rgba(0,51,88,0.06)]"
                          : "bg-surface-container-low"
                      }`}
                    >
                      <p className="mb-2 text-sm font-bold text-secondary">
                        {item.startYear} — {item.endYear ?? "Present"}
                      </p>
                      <h3 className="font-headline text-xl font-bold text-primary">
                        {item.degree}
                      </h3>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {item.institution}
                      </p>
                      <p className="mt-2 text-sm font-medium text-on-surface-variant">
                        {item.fieldOfStudy}
                      </p>
                      {item.description ? (
                        <p className="mt-4 text-sm italic text-on-tertiary-fixed-variant">
                          {item.description}
                        </p>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl bg-surface-container-low p-8 text-on-surface-variant">
                    Education details will be published soon.
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-8 flex items-center gap-3 font-headline text-3xl font-bold text-primary">
                <span className="material-symbols-outlined text-secondary">
                  architecture
                </span>
                Areas of Mastery
              </h2>
              <div className="flex flex-wrap gap-4">
                {(tutor.expertise.length > 0 ? tutor.expertise : tutor.categories).map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest px-6 py-4 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-primary">
                        school
                      </span>
                      <div>
                        <p className="font-bold text-primary">{item.name}</p>
                        <p className="text-xs text-on-surface-variant">
                          Specialty track
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            <section>
              <div className="mb-8 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 font-headline text-3xl font-bold text-primary">
                  <span className="material-symbols-outlined text-secondary">
                    forum
                  </span>
                  Student Testimonials
                </h2>
                <span className="text-sm font-bold text-secondary">
                  View all {tutor.totalReviews} reviews
                </span>
              </div>

              <div className="space-y-8">
                {tutor.testimonials.length > 0 ? (
                  tutor.testimonials.map((testimonial) => (
                    <article
                      key={testimonial.id}
                      className="rounded-2xl bg-surface-container-lowest p-8 shadow-[0px_4px_20px_rgba(0,51,88,0.04)]"
                    >
                      <div className="mb-4 flex items-center gap-4">
                        {testimonial.student.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={testimonial.student.avatarUrl}
                            alt={testimonial.student.name}
                            className="h-12 w-12 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-black text-on-primary">
                            {getInitials(testimonial.student.name)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-primary">
                            {testimonial.student.name}
                          </h3>
                          <div className="flex text-amber-500">
                            {Array.from({
                              length: Math.max(1, Math.min(5, testimonial.rating)),
                            }).map((_, index) => (
                              <span
                                key={index}
                                className="material-symbols-outlined text-base"
                                style={{ fontVariationSettings: '"FILL" 1' }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>
                        <time className="ml-auto text-xs font-medium text-on-surface-variant">
                          {formatRelativeDate(testimonial.createdAt)}
                        </time>
                      </div>
                      <p className="italic leading-relaxed text-on-surface-variant">
                        &quot;
                        {testimonial.comment ||
                          "Excellent session and very supportive guidance."}
                        &quot;
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl bg-surface-container-low p-8 text-on-surface-variant">
                    Student testimonials will appear after completed sessions and
                    reviews.
                  </div>
                )}
              </div>
            </section>
          </div>

          <TutorBookingSidebar
            tutorId={tutor.id}
            hourlyRate={tutor.hourlyRate}
            availableSlots={tutor.availableSlots}
          />
        </div>
      </div>
    </section>
  );
}
