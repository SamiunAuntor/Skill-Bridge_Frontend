import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <div className="space-y-2 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
        <p className="text-sm text-on-surface-variant">
          Continue your journey in the Digital Atheneum.
        </p>
      </div>

      <form className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-on-surface" htmlFor="login-email">
            Academic Email
          </label>
          <input
            id="login-email"
            className="w-full rounded-md border-none bg-surface-container-highest px-4 py-3 text-on-surface focus:ring-2 focus:ring-surface-tint/40"
            placeholder="name@atheneum.edu"
            type="email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-on-surface" htmlFor="login-password">
              Secure Password
            </label>
            <Link
              href="#"
              className="text-xs font-medium text-on-surface-variant transition-all hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
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

        <button
          className="signature-cta w-full rounded-md py-4 font-headline text-lg font-bold tracking-tight text-on-primary transition-all duration-300 hover:shadow-lg"
          type="submit"
        >
          Sign In
        </button>
      </form>

      <p className="text-center text-sm text-on-surface-variant">
        Need an account?{" "}
        <Link className="font-bold text-primary hover:underline" href="/register">
          Create one here
        </Link>
      </p>
    </>
  );
}
