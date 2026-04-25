import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Star,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getPublicSubjectBySlug, PublicApiError } from "@/lib/public-api";

type SubjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function formatRate(rate: number): string {
  return `$${Math.round(rate)}/hr`;
}

export default async function SubjectDetailPage({
  params,
}: SubjectDetailPageProps) {
  const { slug } = await params;

  let data: Awaited<ReturnType<typeof getPublicSubjectBySlug>>;

  try {
    data = await getPublicSubjectBySlug(slug);
  } catch (error) {
    if (error instanceof PublicApiError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }

  const { subject, tutors } = data;

  return (
    <section className="pb-20 pt-8">
      <div className="mx-auto w-11/12 max-w-7xl">
        <Link
          href="/subjects"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to subjects
        </Link>

        <header className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest px-8 py-10 shadow-[0px_18px_48px_rgba(0,51,88,0.05)] md:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                {subject.iconUrl ? (
                  <Image
                    src={subject.iconUrl}
                    alt=""
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 object-contain"
                  />
                ) : (
                  <BookOpen className="h-3.5 w-3.5" />
                )}
                {subject.category.name}
              </div>

              <h1 className="mt-6 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
                {subject.name}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-on-surface-variant md:text-lg">
                {subject.description ||
                  "Explore tutors who teach this subject and choose a guide who matches your goals, pace, and learning style."}
              </p>
            </div>

            <div className="shrink-0 rounded-[1.5rem] bg-surface-container-low px-8 py-6 text-center shadow-sm lg:min-w-[220px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                Tutors Available
              </p>
              <p className="mt-2 font-headline text-5xl font-black text-primary">
                {tutors.length}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-10">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-primary">
                Tutors teaching {subject.name}
              </h2>
              <p className="mt-2 text-on-surface-variant">
                Browse teachers currently mapped to this subject by the platform.
              </p>
            </div>
          </div>

          {tutors.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {tutors.map((tutor) => (
                <article
                  key={tutor.id}
                  className="flex h-full flex-col rounded-[1.6rem] bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.05)]"
                >
                  <div className="flex items-center gap-4">
                    {tutor.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={tutor.displayName}
                        src={tutor.avatarUrl}
                        className="h-16 w-16 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-black text-on-primary">
                        {tutor.displayName
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase() ?? "")
                          .join("")}
                      </div>
                    )}
                    <div>
                      {tutor.isTopRated ? (
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary-container px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                          <BadgeCheck className="h-3 w-3" />
                          Top Rated Expert
                        </div>
                      ) : null}
                      <h3 className="font-headline text-xl font-bold text-primary">
                        {tutor.displayName}
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        {tutor.professionalTitle}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-on-surface-variant">
                    {tutor.bio}
                  </p>

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-primary">{formatRate(tutor.hourlyRate)}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-secondary">
                        <Star className="h-4 w-4 fill-secondary text-secondary" />
                        {tutor.totalReviews > 0
                          ? `${tutor.averageRating.toFixed(1)} (${tutor.totalReviews} reviews)`
                          : "No reviews yet"}
                      </p>
                    </div>

                    <Link
                      href={`/tutors/${tutor.id}`}
                      className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary"
                    >
                      View Tutor
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.6rem] bg-surface-container-low p-10 text-center">
              <h3 className="font-headline text-2xl font-bold text-primary">
                No tutors are mapped to this subject yet
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-on-surface-variant">
                This subject is active in the catalog, but no tutor has selected it yet.
                Check back soon or browse the wider tutor directory.
              </p>
              <Link
                href="/tutors"
                className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 font-bold text-on-primary"
              >
                Browse all tutors
              </Link>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
