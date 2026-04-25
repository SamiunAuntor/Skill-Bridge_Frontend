import SubjectsDiscoveryToolbar from "@/Components/Subjects/SubjectsDiscoveryToolbar";
import SubjectCard from "@/Components/Subjects/SubjectCard";
import { getPublicSubjects } from "@/lib/public-api";

export const metadata = {
  title: "Subjects | SkillBridge",
  description:
    "Browse SkillBridge subjects by category and discover tutors who teach them.",
};

type SubjectsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStringValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function SubjectsPage({
  searchParams,
}: SubjectsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = getStringValue(resolvedSearchParams.q)?.trim() || undefined;
  const sortBy =
    getStringValue(resolvedSearchParams.sortBy) === "alphabetical"
      ? "alphabetical"
      : "most_tutors";
  const data = await getPublicSubjects({
    ...(q ? { q } : {}),
    sortBy,
  });

  return (
    <section className="pb-20 pt-8">
      <div className="mx-auto w-11/12 max-w-7xl">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
              Subject Directory
            </p>
            <h1 className="mt-3 font-headline text-[1.8rem] font-extrabold tracking-tight text-primary md:text-[2.7rem]">
              Available subjects on SkillBridge
            </h1>
          </div>
          <div className="rounded-2xl bg-surface-container-low px-5 py-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              Active Subjects
            </p>
            <p className="mt-2 font-headline text-4xl font-black text-primary">
              {data.subjects.length}
            </p>
          </div>
        </header>

        <div className="mb-10">
          <SubjectsDiscoveryToolbar
            initialQuery={data.filters.q}
            sortBy={data.filters.sortBy}
          />
        </div>

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
