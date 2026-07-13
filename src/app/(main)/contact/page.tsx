import { Clock3, Mail, MessageSquareText } from "lucide-react";
import ContactForm from "@/Components/Contact/ContactForm";

export const metadata = {
  title: "Contact | SkillBridge",
  description: "Contact the SkillBridge team about accounts, bookings, tutoring, or platform support.",
};

export default function ContactPage() {
  return (
    <main className="px-6 pb-24 pt-8 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[2rem] bg-primary-container p-8 text-white md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary-fixed">Contact SkillBridge</p>
          <h1 className="mt-4 font-headline text-4xl font-black tracking-tight md:text-5xl">How can we help?</h1>
          <p className="mt-5 text-lg leading-8 text-on-primary-container">Send questions about accounts, tutors, bookings, sessions, payments, or platform access. Every message is stored securely for the team to review.</p>
          <div className="mt-10 space-y-4">
            <Info icon={Mail} title="Email" value="support@skillbridge.com" />
            <Info icon={Clock3} title="Response time" value="Usually within 1–2 business days" />
            <Info icon={MessageSquareText} title="Best support" value="Include relevant booking or account details—never your password." />
          </div>
        </section>
        <section className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_18px_50px_rgba(0,51,88,0.08)] sm:p-8 md:p-10">
          <h2 className="font-headline text-3xl font-extrabold text-primary">Send us a message</h2>
          <p className="mt-3 mb-8 text-on-surface-variant">All fields are required. Please provide enough detail for us to understand the issue.</p>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}

function Info({ icon: Icon, title, value }: { icon: typeof Mail; title: string; value: string }) {
  return <div className="flex gap-4 rounded-2xl bg-white/10 p-4"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-secondary-fixed" /><div><p className="font-bold">{title}</p><p className="mt-1 text-sm leading-6 text-on-primary-container">{value}</p></div></div>;
}
