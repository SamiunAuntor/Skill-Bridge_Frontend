import SubjectCard from "@/Components/Subjects/SubjectCard";
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
              <SubjectCard
                key={subject.id}
                subject={{
                  id: subject.id,
                  name: subject.name,
                  slug: subject.slug,
                  iconUrl: subject.iconUrl,
                  description: subject.description,
                  categoryName: subject.category.name,
                  tutorCount: subject.tutorCount,
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
