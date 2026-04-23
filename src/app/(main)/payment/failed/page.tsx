import { redirect } from "next/navigation";
import PaymentFailedClient from "@/Components/Payment/PaymentFailedClient";
import { getServerAuthSession } from "@/lib/auth/server-session";

type PaymentFailedPageProps = {
  searchParams: Promise<{
    booking?: string;
    payment_intent?: string;
    next?: string;
  }>;
};

export default async function PaymentFailedPage({
  searchParams,
}: PaymentFailedPageProps) {
  const session = await getServerAuthSession();
  const query = await searchParams;
  const bookingId = query.booking?.trim() ?? "";
  const paymentIntentId = query.payment_intent?.trim() ?? "";
  const returnTo = query.next?.trim() || "/tutors";

  if (!session?.user) {
    redirect(`/login?next=${encodeURIComponent(`/payment/failed?next=${returnTo}`)}`);
  }

  if (session.user.role !== "student") {
    redirect("/dashboard");
  }

  return (
    <section className="pb-20 pt-10">
      <div className="mx-auto w-11/12 max-w-[900px]">
        <PaymentFailedClient
          bookingId={bookingId}
          paymentIntentId={paymentIntentId}
          returnTo={returnTo}
        />
      </div>
    </section>
  );
}
