import { redirect } from "next/navigation";
import PaymentCheckoutClient from "@/Components/Payment/PaymentCheckoutClient";
import { getServerAuthSession } from "@/lib/auth/server-session";

type CheckoutPageProps = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{
    payment_intent?: string;
    next?: string;
  }>;
};

export default async function PaymentCheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const session = await getServerAuthSession();
  const { bookingId } = await params;
  const query = await searchParams;
  const paymentIntentId = query.payment_intent?.trim() ?? "";
  const returnTo = query.next?.trim() || "/tutors";

  if (!session?.user) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/payment/checkout/${bookingId}?payment_intent=${paymentIntentId}&next=${returnTo}`
      )}`
    );
  }

  if (session.user.role !== "student") {
    redirect("/dashboard");
  }

  if (!paymentIntentId) {
    redirect(
      `/payment/failed?booking=${encodeURIComponent(
        bookingId
      )}&next=${encodeURIComponent(returnTo)}`
    );
  }

  return (
    <section className="pb-20 pt-10">
      <div className="mx-auto w-11/12 max-w-[1220px]">
        <PaymentCheckoutClient
          bookingId={bookingId}
          paymentIntentId={paymentIntentId}
          returnTo={returnTo}
        />
      </div>
    </section>
  );
}
