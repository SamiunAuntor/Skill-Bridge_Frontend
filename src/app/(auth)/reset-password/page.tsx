import Link from "next/link";
import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <>
      <div className="space-y-2 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">New password</h1>
        <p className="text-sm text-on-surface-variant">
          Choose a strong password for your account.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-on-surface-variant">
            Loading…
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>

      <p className="text-center text-sm text-on-surface-variant">
        <Link className="font-bold text-primary hover:underline" href="/login">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
