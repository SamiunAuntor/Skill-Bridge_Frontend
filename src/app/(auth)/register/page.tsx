export default function RegistrationPage() {
  return (
    <>
      <div className="space-y-2 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
        <p className="text-sm text-on-surface-variant">
          Continue your journey in the Digital Atheneum.
        </p>
      </div>

      <form className="space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Select Your Path
          </label>
          <div className="flex gap-4">
            <label className="group relative flex-1 cursor-pointer">
              <input
                defaultChecked
                className="peer sr-only"
                name="role"
                type="radio"
                value="student"
              />
              <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-surface-container-highest p-4 transition-all peer-checked:border-primary peer-checked:bg-primary-fixed">
                <span className="material-symbols-outlined text-primary">
                  school
                </span>
                <span className="font-headline text-sm font-bold text-primary">
                  Student
                </span>
              </div>
            </label>
            <label className="group relative flex-1 cursor-pointer">
              <input
                className="peer sr-only"
                name="role"
                type="radio"
                value="tutor"
              />
              <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-surface-container-highest p-4 transition-all peer-checked:border-primary peer-checked:bg-primary-fixed">
                <span className="material-symbols-outlined text-primary">
                  architecture
                </span>
                <span className="font-headline text-sm font-bold text-primary">
                  Tutor
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-on-surface"
              htmlFor="first_name"
            >
              First Name
            </label>
            <input
              id="first_name"
              className="w-full rounded-md border-none bg-surface-container-highest px-4 py-3 text-on-surface focus:ring-2 focus:ring-surface-tint/40"
              placeholder="Alex"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-on-surface"
              htmlFor="last_name"
            >
              Last Name
            </label>
            <input
              id="last_name"
              className="w-full rounded-md border-none bg-surface-container-highest px-4 py-3 text-on-surface focus:ring-2 focus:ring-surface-tint/40"
              placeholder="Mercer"
              type="text"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-on-surface"
            htmlFor="email"
          >
            Academic Email
          </label>
          <input
            id="email"
            className="w-full rounded-md border-none bg-surface-container-highest px-4 py-3 text-on-surface focus:ring-2 focus:ring-surface-tint/40"
            placeholder="name@atheneum.edu"
            type="email"
          />
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-on-surface"
            htmlFor="password"
          >
            Secure Password
          </label>
          <div className="relative">
            <input
              id="password"
              className="w-full rounded-md border-none bg-surface-container-highest px-4 py-3 text-on-surface focus:ring-2 focus:ring-surface-tint/40"
              placeholder="••••••••"
              type="password"
            />
            <button
              className="absolute top-1/2 right-4 -translate-y-1/2 text-on-surface-variant"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">
                visibility
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-tertiary-fixed/30 p-4">
          <div className="mt-1 flex h-5 items-center">
            <input
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              id="terms"
              name="terms"
              type="checkbox"
            />
          </div>
          <div className="text-sm">
            <label
              className="leading-none font-medium text-on-tertiary-fixed-variant"
              htmlFor="terms"
            >
              I agree to the Honor Code and Privacy Protocols of SkillBridge.
            </label>
          </div>
        </div>

        <button
          className="signature-cta w-full rounded-md py-4 font-headline text-lg font-bold tracking-tight text-on-primary transition-all duration-300 hover:shadow-lg"
          type="submit"
        >
          Join The Atheneum
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-variant" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-4 font-medium tracking-widest text-on-surface-variant">
              Or Continue With
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            className="flex items-center justify-center gap-2 rounded-md border-none bg-surface-container-lowest px-4 py-3 shadow-sm transition-colors hover:bg-surface-container-low"
            type="button"
          >
            <img
              alt="Google"
              className="h-4 w-4"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0Kg-e3hqJvvtI0q42kK5u4N01M9KP6yEAw7vEtZDFurJcdHHL9nT5DvKfM3D1XbL77FpYTi7DN0OggSKAAU2epPD4SI03UZ8HIihRZKZp-Ce43bYsg3D4HEgPBeRBGaal_3dLEZiGFvoriwgZ8qfCiX3NaWoLvD76LP0lXIbhDBRz0fCC3fn22OQL1ZuWR4_caT5cndW6-cYgRkyzQtmTgnyUYvW_zIYRSxOo6CUkeGjWXKP1X-nSnRID8yu-xmCeu0jIrxW_h7E"
            />
            <span className="text-sm font-medium text-on-surface">Google</span>
          </button>
          <button
            className="flex items-center justify-center gap-2 rounded-md border-none bg-surface-container-lowest px-4 py-3 shadow-sm transition-colors hover:bg-surface-container-low"
            type="button"
          >
            <span className="material-symbols-outlined text-lg text-on-surface">
              ios
            </span>
            <span className="text-sm font-medium text-on-surface">Apple</span>
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-on-surface-variant">
        Already a member?{" "}
        <a className="font-bold text-primary hover:underline" href="#">
          Sign into your dashboard
        </a>
      </p>
    </>
  );
}
