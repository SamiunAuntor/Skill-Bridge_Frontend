import Marquee from "react-fast-marquee";
import {
  Code2,
  Palette,
  Variable,
  Languages,
  Landmark,
  FlaskConical
} from "lucide-react";

type SubjectsSectionProps = {
  subjects: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

const icons = [Code2, Palette, Variable, Languages, Landmark, FlaskConical];

export default function SubjectsSection({ subjects }: SubjectsSectionProps) {
  return (
    <section className="bg-surface-container-low py-24">
      {/* Section Header */}
      <div className="mx-auto mb-16 w-11/12 max-w-7xl">
        <h2 className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
          The Architecture of <span className="text-secondary">Knowledge</span>
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-on-surface-variant">
          Explore hundreds of specialized disciplines from the foundational to
          the experimental.
        </p>
      </div>

      {/* Marquee */}
      <Marquee
        gradient={true}
        gradientColor="var(--surface-container-low)"
        speed={40}
        pauseOnHover={true}
        className="pb-8"
      >
        {subjects.map((subject, index) => {
          const Icon = icons[index % icons.length];

          return (
          <div
            key={subject.id}
            className="group mx-4 flex min-w-[240px] flex-col items-center rounded-2xl bg-surface-container-lowest px-10 py-8 text-center shadow-[0px_12px_32px_rgba(0,51,88,0.04)] transition-all hover:scale-[1.02] hover:bg-surface-bright"
          >
            <div className="mb-4 text-primary transition-transform group-hover:-translate-y-1">
              <Icon size={32} />
            </div>

            <h4 className="font-headline text-lg font-bold text-primary">
              {subject.name}
            </h4>
          </div>
        )})}
      </Marquee>
    </section>
  );
}
