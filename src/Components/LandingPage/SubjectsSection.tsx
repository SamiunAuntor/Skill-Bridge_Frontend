import Link from "next/link";
import Marquee from "react-fast-marquee";
import { ArrowRight } from "lucide-react";
import { getSubjectIcon } from "@/lib/subject-icons";

type SubjectsSectionProps = {
  subjects: Array<{
    id: string;
    name: string;
    slug: string;
    iconKey: string | null;
    shortDescription: string | null;
    categoryName: string;
  }>;
};

export default function SubjectsSection({ subjects }: SubjectsSectionProps) {
  return (
    <section className="bg-surface-container-low py-24">
      <div className="mx-auto mb-16 flex w-11/12 max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            The Architecture of <span className="text-secondary">Knowledge</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-on-surface-variant">
          Explore hundreds of specialized disciplines from the foundational to
          the experimental.
          </p>
        </div>
        <Link
          href="/subjects"
          className="inline-flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
        >
          Explore subjects
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <Marquee
        gradient={true}
        gradientColor="var(--surface-container-low)"
        speed={40}
        pauseOnHover={true}
        className="pb-8"
      >
        {subjects.map((subject) => {
          const Icon = getSubjectIcon(subject.iconKey);

          return (
            <Link
              key={subject.id}
              href={`/subjects/${subject.slug}`}
              className="group mx-4 flex min-w-[260px] max-w-[260px] flex-col items-center rounded-2xl bg-surface-container-lowest px-8 py-8 text-center shadow-[0px_12px_32px_rgba(0,51,88,0.04)] transition-all hover:scale-[1.02] hover:bg-surface-bright"
            >
              <div className="mb-4 text-primary transition-transform group-hover:-translate-y-1">
                <Icon size={32} />
              </div>

              <h4 className="font-headline text-lg font-bold text-primary">
                {subject.name}
              </h4>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
                {subject.categoryName}
              </p>
              {subject.shortDescription ? (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                  {subject.shortDescription}
                </p>
              ) : null}
            </Link>
          );
        })}
      </Marquee>
    </section>
  );
}
