"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PasswordVisibilityToggle from "@/Components/Auth/PasswordVisibilityToggle";
import { showAuthErrorAlert } from "@/lib/auth-alerts";
import { authClient } from "@/lib/auth-client";
import { formatAuthError, isAuthClientError } from "@/lib/auth-errors";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const fieldClass = (invalid: boolean) =>
  `h-14 w-full rounded-md border-none bg-surface-container-highest px-4 text-base leading-normal text-on-surface placeholder:leading-normal focus:ring-2 focus:ring-surface-tint/40 ${
    invalid ? "ring-2 ring-red-400/70" : ""
  }`;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const resetOk = searchParams.get("reset") === "1";

  const [showPassword, setShowPassword] = useState(false);

  const { data: session, isPending: sessionPending } = authClient.useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { error: signErr } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: `${window.location.origin}/`,
      });
      if (signErr) {
        if (isAuthClientError(signErr) && signErr.status === 403) {
          await showAuthErrorAlert(
            "Please verify your email before signing in. Check your inbox; we sent you a new verification link."
          );
        } else {
          await showAuthErrorAlert(signErr.message || "Could not sign in.");
        }
        return;
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      await showAuthErrorAlert(formatAuthError(e));
    }
  });

  return (
    <>
      <div className="space-y-2 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
        <p className="text-sm text-on-surface-variant">
          Continue your learning journey with SkillBridge.
        </p>
      </div>

      {resetOk && (
        <div
          className="rounded-lg bg-secondary-fixed/40 px-4 py-3 text-sm text-on-secondary-fixed"
          role="status"
        >
          Password updated. Sign in with your new password.
        </div>
      )}

      {verified && !sessionPending && session?.user && (
        <div
          className="rounded-lg bg-secondary-fixed/40 px-4 py-3 text-sm text-on-secondary-fixed"
          role="status"
        >
          Your email is verified and you&apos;re signed in. You can continue to
          the app.
        </div>
      )}

      {verified && !sessionPending && !session?.user && (
        <div
          className="rounded-lg bg-primary-fixed/50 px-4 py-3 text-sm text-on-primary-fixed"
          role="status"
        >
          Email verified. Sign in below with your password.
        </div>
      )}

      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-on-surface"
            htmlFor="login-email"
          >
            Academic Email
          </label>
          <input
            id="login-email"
            autoComplete="email"
            className={fieldClass(!!errors.email)}
            placeholder="name@skillbridge.com"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-700">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className="block text-sm font-medium text-on-surface"
              htmlFor="login-password"
            >
              Secure Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-on-surface-variant transition-all hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              autoComplete="current-password"
              className={`${fieldClass(!!errors.password)} pr-12`}
              placeholder="********"
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <PasswordVisibilityToggle
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-700">{errors.password.message}</p>
          )}
        </div>

        <button
          className="signature-cta w-full rounded-md py-4 font-headline text-lg font-bold tracking-tight text-on-primary transition-all duration-300 hover:shadow-lg disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
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
