"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { formatAuthError } from "@/lib/auth-errors";
import { REGISTER_ROLES, type RegisterRole } from "@/types/auth";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  role: z.enum(REGISTER_ROLES),
  terms: z.boolean().refine((v) => v === true, {
    message: "Please accept the Honor Code and Privacy Protocols.",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

/** Satisfies Better Auth sign-up body; `role` is narrowed beyond `string`. */
function buildSignUpPayload(values: RegisterFormValues) {
  const payload = {
    name: `${values.firstName} ${values.lastName}`.trim(),
    email: values.email,
    password: values.password,
    role: values.role satisfies RegisterRole,
    callbackURL: `${window.location.origin}/login?verified=1`,
  };
  return payload as Parameters<typeof authClient.signUp.email>[0];
}

const fieldClass = (invalid: boolean) =>
  `w-full rounded-md border-none bg-surface-container-highest px-4 py-3 text-on-surface focus:ring-2 focus:ring-surface-tint/40 ${
    invalid ? "ring-2 ring-red-400/70" : ""
  }`;

export default function RegisterForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "student",
      terms: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      const { error: signUpErr } = await authClient.signUp.email(
        buildSignUpPayload(values)
      );
      if (signUpErr) {
        setApiError(signUpErr.message || "Could not create account.");
        return;
      }
      router.push(
        `/verify-pending?email=${encodeURIComponent(values.email.toLowerCase())}`
      );
    } catch (e) {
      setApiError(formatAuthError(e));
    }
  });

  return (
    <>
      <div className="space-y-2 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">Join SkillBridge</h1>
        <p className="text-sm text-on-surface-variant">
          Create your account—we&apos;ll email you a verification link.
        </p>
      </div>

      {apiError && (
        <div
          className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {apiError}
        </div>
      )}

      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Select Your Path
          </label>
          <div className="flex gap-4">
            <label className="group relative flex-1 cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                value="student"
                {...register("role")}
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
                type="radio"
                value="tutor"
                {...register("role")}
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
          {errors.role && (
            <p className="text-sm text-red-700">{errors.role.message}</p>
          )}
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
              autoComplete="given-name"
              className={fieldClass(!!errors.firstName)}
              placeholder="Alex"
              type="text"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-sm text-red-700">{errors.firstName.message}</p>
            )}
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
              autoComplete="family-name"
              className={fieldClass(!!errors.lastName)}
              placeholder="Mercer"
              type="text"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-sm text-red-700">{errors.lastName.message}</p>
            )}
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
            autoComplete="email"
            className={fieldClass(!!errors.email)}
            placeholder="name@atheneum.edu"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-700">{errors.email.message}</p>
          )}
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
              autoComplete="new-password"
              className={`${fieldClass(!!errors.password)} pr-12`}
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <button
              className="absolute top-1/2 right-4 -translate-y-1/2 text-on-surface-variant"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
            >
              <span className="material-symbols-outlined text-sm">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-700">{errors.password.message}</p>
          )}
          <p className="text-xs text-on-surface-variant">
            At least 8 characters.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-tertiary-fixed/30 p-4">
          <div className="mt-1 flex h-5 items-center">
            <input
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              id="terms"
              type="checkbox"
              {...register("terms")}
            />
          </div>
          <div className="text-sm">
            <label
              className="leading-none font-medium text-on-tertiary-fixed-variant"
              htmlFor="terms"
            >
              I agree to the Honor Code and Privacy Protocols of SkillBridge.
            </label>
            {errors.terms && (
              <p className="mt-2 text-sm text-red-700">{errors.terms.message}</p>
            )}
          </div>
        </div>

        <button
          className="signature-cta w-full rounded-md py-4 font-headline text-lg font-bold tracking-tight text-on-primary transition-all duration-300 hover:shadow-lg disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating account…" : "Join The Atheneum"}
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
            className="flex cursor-not-allowed items-center justify-center gap-2 rounded-md border-none bg-surface-container-lowest px-4 py-3 opacity-50 shadow-sm"
            disabled
            title="Coming soon"
            type="button"
          >
            <img
              alt=""
              className="h-4 w-4"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0Kg-e3hqJvvtI0q42kK5u4N01M9KP6yEAw7vEtZDFurJcdHHL9nT5DvKfM3D1XbL77FpYTi7DN0OggSKAAU2epPD4SI03UZ8HIihRZKZp-Ce43bYsg3D4HEgPBeRBGaal_3dLEZiGFvoriwgZ8qfCiX3NaWoLvD76LP0lXIbhDBRz0fCC3fn22OQL1ZuWR4_caT5cndW6-cYgRkyzQtmTgnyUYvW_zIYRSxOo6CUkeGjWXKP1X-nSnRID8yu-xmCeu0jIrxW_h7E"
            />
            <span className="text-sm font-medium text-on-surface">Google</span>
          </button>
          <button
            className="flex cursor-not-allowed items-center justify-center gap-2 rounded-md border-none bg-surface-container-lowest px-4 py-3 opacity-50 shadow-sm"
            disabled
            title="Coming soon"
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
        <Link
          className="font-bold text-primary hover:underline"
          href="/login"
        >
          Sign into your dashboard
        </Link>
      </p>
    </>
  );
}
