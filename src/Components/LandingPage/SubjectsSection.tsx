import Link from "next/link";
import Marquee from "react-fast-marquee";
import { ArrowRight } from "lucide-react";
import SubjectCard from "@/Components/Subjects/SubjectCard";

type SubjectsSectionProps = {
  subjects: Array<{
    id: string;
    name: string;
    slug: string;
    iconUrl: string | null;
    description: string | null;
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
          return (
            <div
              key={subject.id}
              className="mx-4"
            >
              <SubjectCard subject={subject} compact />
            </div>
          );
        })}
      </Marquee>
    </section>
  );
}
