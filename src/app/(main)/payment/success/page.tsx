import { redirect } from "next/navigation";
import PaymentResultClient from "@/Components/Payment/PaymentResultClient";
import { getServerAuthSession } from "@/lib/auth/server-session";

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    booking?: string;
    payment_intent?: string;
    next?: string;
    processing?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const session = await getServerAuthSession();
  const query = await searchParams;
  const bookingId = query.booking?.trim() ?? "";
  const paymentIntentId = query.payment_intent?.trim() ?? "";
  const returnTo = query.next?.trim() || "/dashboard/student/sessions";
  const processing = query.processing === "1";

  if (!session?.user) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/payment/success?booking=${bookingId}&payment_intent=${paymentIntentId}`
      )}`
    );
  }

  if (session.user.role !== "student") {
    redirect("/dashboard");
  }

  if (!bookingId || !paymentIntentId) {
    redirect(`/payment/failed?next=${encodeURIComponent(returnTo)}`);
  }

  return (
    <section className="pb-20 pt-10">
      <div className="mx-auto w-11/12 max-w-[1100px]">
        <PaymentResultClient
          bookingId={bookingId}
          paymentIntentId={paymentIntentId}
          returnTo={returnTo}
          processing={processing}
        />
      </div>
    </section>
  );
}

