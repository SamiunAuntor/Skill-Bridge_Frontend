import Link from "next/link";

export default function GlobalNotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-on-background">
      <section className="w-full max-w-xl rounded-3xl border border-outline-variant/25 bg-surface p-8 text-center shadow-[0px_18px_44px_rgba(0,51,88,0.12)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
          Error 404
        </p>
        <h1 className="mt-3 font-headline text-3xl font-extrabold text-primary md:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant md:text-base">
          The page you are looking for does not exist or may have been moved.
          Use one of the options below to continue exploring SkillBridge.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition hover:opacity-90"
          >
            Back to Home
          </Link>
          <Link
            href="/tutors"
            className="rounded-xl border border-outline-variant/25 bg-surface px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-surface-container-low"
          >
            Browse Tutors
          </Link>
        </div>
      </section>
    </main>
  );
}
