"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PasswordVisibilityToggle from "@/Components/Auth/PasswordVisibilityToggle";
import { showAuthErrorAlert } from "@/lib/auth-alerts";
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
  `h-14 w-full rounded-md border-none bg-surface-container-highest px-4 text-base leading-normal text-on-surface placeholder:leading-normal focus:ring-2 focus:ring-surface-tint/40 ${
    invalid ? "ring-2 ring-red-400/70" : ""
  }`;

export default function RegisterForm() {
  const router = useRouter();
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
    try {
      const { error: signUpErr } = await authClient.signUp.email(
        buildSignUpPayload(values)
      );
      if (signUpErr) {
        await showAuthErrorAlert(
          signUpErr.message || "Could not create account."
        );
        return;
      }
      router.push(
        `/verify-pending?email=${encodeURIComponent(values.email.toLowerCase())}`
      );
    } catch (e) {
      await showAuthErrorAlert(formatAuthError(e));
    }
  });

  return (
    <>
      <div className="space-y-2 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">Join SkillBridge</h1>
        <p className="text-sm text-on-surface-variant">
          Create your account and we&apos;ll email you a verification link.
        </p>
      </div>

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
              <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-surface-container-highest p-4 transition-all peer-checked:border-primary peer-checked:bg-primary-fixed dark:peer-checked:bg-primary/20">
                <span className="material-symbols-outlined text-primary dark:peer-checked:text-primary-fixed">
                  school
                </span>
                <span className="font-headline text-sm font-bold text-primary dark:peer-checked:text-primary-fixed">
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
              <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-surface-container-highest p-4 transition-all peer-checked:border-primary peer-checked:bg-primary-fixed dark:peer-checked:bg-primary/20">
                <span className="material-symbols-outlined text-primary dark:peer-checked:text-primary-fixed">
                  architecture
                </span>
                <span className="font-headline text-sm font-bold text-primary dark:peer-checked:text-primary-fixed">
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
            Email
          </label>
          <input
            id="email"
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
          <p className="text-xs text-on-surface-variant">
            At least 8 characters.
          </p>
        </div>

        <div
          className="flex items-start gap-3 rounded-xl p-4 shadow-sm dark:shadow-none"
          style={{
            backgroundColor: "var(--surface-container-lowest)",
            border: "1px solid var(--outline-variant)",
            color: "var(--on-surface-variant)",
          }}
        >
          <div className="mt-1 flex h-5 items-center">
            <input
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              id="terms"
              type="checkbox"
              {...register("terms")}
            />
          </div>
          <div
            className="text-sm"
            style={{ color: "var(--on-surface-variant)" }}
          >
            <label
              className="leading-none font-medium"
              style={{ color: "var(--on-surface-variant)" }}
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
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
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
