import Link from "next/link";
import { Suspense } from "react";
import VerifyPendingActions from "./verify-pending-actions";

export default function VerifyPendingPage() {
  return (
    <>
      <div className="space-y-2 text-center lg:hidden">
        <h1 className="text-2xl font-bold text-primary">Check your email</h1>
        <p className="text-sm text-on-surface-variant">
          We sent a verification link. Open it to confirm your address, then you
          can sign in.
        </p>
      </div>

      <div className="space-y-6 rounded-xl bg-surface-container-low p-6 text-sm text-on-surface-variant">
        <p>
          <strong className="text-on-surface">Next steps:</strong> click the
          link in the email. After your email is verified, you can sign in on the
          login page. If you don&apos;t see the message, check spam or resend
          below.
        </p>
        <Suspense
          fallback={
            <p className="text-on-surface-variant">Loading resend options…</p>
          }
        >
          <VerifyPendingActions />
        </Suspense>
        <p className="text-center">
          <Link className="font-bold text-primary hover:underline" href="/login">
            Back to sign in
          </Link>
        </p>
      </div>
    </>
  );
}
