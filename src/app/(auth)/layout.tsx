import AuthTabs from "@/Components/Auth/AuthTabs";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <section className="bg-surface text-on-surface">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-11/12">
        <section className="tonal-transition relative hidden items-center justify-center overflow-hidden p-12 lg:flex lg:w-1/2">
          <div className="absolute inset-0 z-0">
            <img
              alt="Grand classical library with tall mahogany shelves and soft ambient sunlight"
              className="h-full w-full object-cover opacity-15 mix-blend-multiply"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgtQ1vo2lk0sLeM2HGb1FWRn46dxTfIsjheDQbWL4uYPc7khq5jQPJqJfkw_a_YoB0PRPa-JxsYveuzILa1nsQr_jZc1JmuQ0zAMiFs_o6HHXTsWzm5BasLtQJoeUhp2QRnIAsDvVEXpmSsg8n6ELUZ-niStwIwOApeo2c3LI7aaLIPtRobTytwelN4gHYitQ9HdvJJl-gUSlKUsrhsfIVEmUK2R_FU-_elnRpxIjJOfqkWAl8Wg4Xt-20veyHpvlgG-6cZkCn1fM"
            />
          </div>
          <div className="relative z-10 max-w-lg space-y-8">
            <div className="inline-flex items-center space-x-3 rounded-full bg-surface-container-lowest/50 p-2 pr-6 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary">
                <span className="material-symbols-outlined">auto_stories</span>
              </div>
              <span className="font-headline font-bold tracking-tight text-primary">
                The Atheneum
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-extrabold leading-tight tracking-tighter text-primary">
                Knowledge is a <span className="text-secondary">sanctuary</span>{" "}
                for growth.
              </h1>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                Step into SkillBridge, a digital academy where prestige meets
                progress. Our platform connects expert minds with eager learners
                in an environment designed for quiet luxury and deep immersion.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
                <span className="material-symbols-outlined mb-3 text-3xl text-secondary">
                  verified
                </span>
                <h3 className="font-headline font-bold text-primary">
                  Certified Experts
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Learn from the world&apos;s most distinguished tutors.
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
                <span className="material-symbols-outlined mb-3 text-3xl text-secondary">
                  speed
                </span>
                <h3 className="font-headline font-bold text-primary">
                  Accelerated Path
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Master complex subjects with bespoke learning tracks.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-col items-center justify-center bg-surface p-6 md:p-16 lg:w-1/2">
          <div className="mb-12 text-center lg:hidden">
            <h2 className="text-3xl font-black tracking-tighter text-primary">
              SkillBridge
            </h2>
          </div>
          <div className="w-full max-w-md space-y-8">
            <AuthTabs />
            {children}
          </div>
          <footer className="mt-16 text-center text-xs font-medium text-on-surface-variant/60">
            © 2024 SkillBridge Academic Ecosystem. All intellectual property
            reserved.
          </footer>
        </section>
      </div>
    </section>
  );
}
