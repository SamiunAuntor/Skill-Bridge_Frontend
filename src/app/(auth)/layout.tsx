import AuthTabs from "@/Components/Auth/AuthTabs";
import Footer from "@/Components/Layout/Footer";
import Navbar from "@/Components/Layout/Navbar";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />

      <main className="pt-20">
        <section className="bg-surface text-on-surface">
          <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-2">
            <section className="tonal-transition relative hidden min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-10 py-14 lg:flex xl:px-16">
              <div className="absolute inset-0 z-0">
                <img
                  alt="Grand classical library with tall mahogany shelves and soft ambient sunlight"
                  className="h-full w-full object-cover opacity-14 mix-blend-multiply dark:opacity-20 dark:mix-blend-normal"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgtQ1vo2lk0sLeM2HGb1FWRn46dxTfIsjheDQbWL4uYPc7khq5jQPJqJfkw_a_YoB0PRPa-JxsYveuzILa1nsQr_jZc1JmuQ0zAMiFs_o6HHXTsWzm5BasLtQJoeUhp2QRnIAsDvVEXpmSsg8n6ELUZ-niStwIwOApeo2c3LI7aaLIPtRobTytwelN4gHYitQ9HdvJJl-gUSlKUsrhsfIVEmUK2R_FU-_elnRpxIjJOfqkWAl8Wg4Xt-20veyHpvlgG-6cZkCn1fM"
                />
              </div>
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#f6fafe]/96 via-[#f6fafe]/88 to-[#eef3f8]/94 dark:from-[#0a141b]/92 dark:via-[#10202a]/84 dark:to-[#132833]/92" />

              <div className="relative z-10 max-w-xl space-y-8">
                <div className="inline-flex items-center space-x-3 rounded-full border border-outline-variant/20 bg-white/92 p-2 pr-6 shadow-sm backdrop-blur-md dark:bg-surface-container/85">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
                    <span className="material-symbols-outlined">auto_stories</span>
                  </div>
                  <span className="font-headline font-bold tracking-tight text-primary">
                    SkillBridge
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl font-extrabold leading-tight tracking-tighter text-primary dark:text-primary">
                    Learn with <span className="text-secondary">clarity</span>{" "}
                    and grow with confidence.
                  </h1>
                  <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant dark:text-slate-200/90">
                    SkillBridge brings learners and expert tutors together in a
                    polished, focused learning environment built for progress.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="rounded-xl border border-outline-variant/15 bg-white/96 p-6 shadow-sm backdrop-blur-sm dark:bg-[#101b23]/92">
                    <span className="material-symbols-outlined mb-3 text-3xl text-secondary">
                      verified
                    </span>
                    <h3 className="font-headline font-bold text-primary">
                      Certified Experts
                    </h3>
                    <p className="text-sm text-on-surface-variant dark:text-slate-300/85">
                      Learn from trusted tutors with strong subject mastery.
                    </p>
                  </div>
                  <div className="rounded-xl border border-outline-variant/15 bg-white/96 p-6 shadow-sm backdrop-blur-sm dark:bg-[#101b23]/92">
                    <span className="material-symbols-outlined mb-3 text-3xl text-secondary">
                      speed
                    </span>
                    <h3 className="font-headline font-bold text-primary">
                      Focused Progress
                    </h3>
                    <p className="text-sm text-on-surface-variant dark:text-slate-300/85">
                      Build momentum through guided sessions and structured
                      support.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex min-h-[calc(100vh-5rem)] w-full flex-col items-center justify-center bg-surface px-6 py-10 md:px-10 lg:px-16">
              <div className="mb-10 text-center lg:hidden">
                <h2 className="text-3xl font-black tracking-tighter text-primary">
                  SkillBridge
                </h2>
              </div>

              <div className="w-full max-w-md space-y-8">
                <AuthTabs />
                {children}
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
