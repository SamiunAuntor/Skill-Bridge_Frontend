"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PasswordVisibilityToggle from "@/Components/Auth/PasswordVisibilityToggle";
import { authClient } from "@/lib/auth-client";
import { formatAuthError } from "@/lib/auth-errors";

const resetSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

const fieldClass = (invalid: boolean) =>
  `h-14 w-full rounded-md border-none bg-surface-container-highest px-4 text-base leading-normal text-on-surface placeholder:leading-normal focus:ring-2 focus:ring-surface-tint/40 ${
    invalid ? "ring-2 ring-red-400/70" : ""
  }`;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const urlError = useMemo(() => searchParams.get("error"), [searchParams]);

  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "" },
  });

  const tokenInvalid =
    urlError === "INVALID_TOKEN" || urlError === "invalid_token";

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    if (!token) {
      setApiError("Missing reset token. Open the link from your email again.");
      return;
    }
    try {
      const { error: err } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });
      if (err) {
        setApiError(err.message || "Could not reset password.");
        return;
      }
      router.push("/login?reset=1");
    } catch (e) {
      setApiError(formatAuthError(e));
    }
  });

  if (tokenInvalid) {
    return (
      <div className="space-y-4 text-sm text-on-surface-variant">
        <p className="rounded-lg bg-red-100 px-4 py-3 text-red-900" role="alert">
          This reset link is invalid or expired. Request a new one from the
          forgot password page.
        </p>
        <Link
          className="block text-center font-bold text-primary hover:underline"
          href="/forgot-password"
        >
          Forgot password
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-4 text-sm text-on-surface-variant">
        <p className="rounded-lg bg-tertiary-fixed/40 px-4 py-3 text-on-tertiary-fixed-variant">
          Open the password reset link from your email. If the link has expired,
          request a new one.
        </p>
        <Link
          className="block text-center font-bold text-primary hover:underline"
          href="/forgot-password"
        >
          Forgot password
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      {apiError && (
        <div
          className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {apiError}
        </div>
      )}
      <div className="space-y-2">
        <label
          className="block text-sm font-medium text-on-surface"
          htmlFor="new-password"
        >
          New password
        </label>
        <div className="relative">
          <input
            id="new-password"
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
        <p className="text-xs text-on-surface-variant">At least 8 characters.</p>
      </div>
      <button
        className="signature-cta w-full rounded-md py-4 font-headline text-lg font-bold tracking-tight text-on-primary transition-all duration-300 hover:shadow-lg disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
