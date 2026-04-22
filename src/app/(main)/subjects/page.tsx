import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { getPublicSubjects } from "@/lib/public-api";

export const metadata = {
  title: "Subjects | SkillBridge",
  description:
    "Browse SkillBridge subjects by category and discover tutors who teach them.",
};

export default async function SubjectsPage() {
  const data = await getPublicSubjects();

  return (
    <section className="px-6 pb-20 pt-8 md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
              Subject Directory
            </p>
            <h1 className="mt-3 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
              Explore every subject on SkillBridge
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
              Browse by structured subject taxonomy instead of scattered free-form tags.
              Every subject here is curated by the platform and connected to tutors who teach it.
            </p>
          </div>
          <div className="rounded-2xl bg-surface-container-low px-5 py-4 text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              Active Subjects
            </p>
            <p className="mt-2 font-headline text-4xl font-black text-primary">
              {data.subjects.length}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.subjects.map((subject) => {
            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.slug}`}
                className="group flex h-full flex-col rounded-[1.6rem] border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.05)] transition-all hover:-translate-y-1 hover:bg-surface-bright"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                    {subject.iconUrl ? (
                      <Image
                        src={subject.iconUrl}
                        alt={`${subject.name} icon`}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <BookOpen className="h-7 w-7" />
                    )}
                  </div>
                  <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                    {subject.tutorCount} tutor{subject.tutorCount === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-6 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
                    {subject.category.name}
                  </p>
                  <h2 className="mt-2 font-headline text-2xl font-extrabold text-primary">
                    {subject.name}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                    {subject.description ||
                      "Discover tutors, compare teaching styles, and start learning this subject with confidence."}
                  </p>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 font-bold text-primary transition-all group-hover:gap-4">
                  View subject
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
