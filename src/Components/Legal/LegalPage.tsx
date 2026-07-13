import Link from "next/link";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export default function LegalPage({
  eyebrow,
  title,
  introduction,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <main className="px-6 pb-24 pt-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="overflow-hidden rounded-[2rem] bg-primary-container px-7 py-12 text-white shadow-[0_18px_60px_rgba(0,51,88,0.16)] sm:px-10 md:py-16">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-secondary-fixed">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-headline text-4xl font-black tracking-tight md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-on-primary-container">
            {introduction}
          </p>
          <p className="mt-8 text-sm font-semibold text-white/75">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[15rem_1fr]">
          <aside className="h-fit rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-5 lg:sticky lg:top-28">
            <p className="font-headline font-bold text-primary">On this page</p>
            <nav aria-label={`${title} sections`} className="mt-4">
              <ol className="space-y-3">
                {sections.map((section, index) => (
                  <li key={section.title}>
                    <a
                      href={`#section-${index + 1}`}
                      className="text-sm leading-6 text-on-surface-variant transition-colors hover:text-secondary"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="space-y-6">
            {sections.map((section, index) => (
              <section
                id={`section-${index + 1}`}
                key={section.title}
                className="scroll-mt-28 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_10px_30px_rgba(0,51,88,0.04)] sm:p-8"
              >
                <h2 className="font-headline text-2xl font-extrabold text-primary">
                  {index + 1}. {section.title}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 leading-7 text-on-surface-variant"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.items ? (
                  <ul className="mt-4 list-disc space-y-3 pl-5 text-on-surface-variant marker:text-secondary">
                    {section.items.map((item) => (
                      <li key={item} className="pl-1 leading-7">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>
        </div>

        <div className="mt-10 rounded-2xl bg-surface-container-low p-6 text-center sm:p-8">
          <p className="text-on-surface-variant">
            Have a question about these terms or how SkillBridge handles data?
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex rounded-md bg-primary px-6 py-3 font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            Learn more about SkillBridge
          </Link>
        </div>
      </div>
    </main>
  );
}
