import LegalPage, { type LegalSection } from "@/Components/Legal/LegalPage";

export const metadata = {
  title: "Terms and Conditions | SkillBridge",
  description:
    "Review the rules that govern SkillBridge accounts, tutor services, bookings, payments, sessions, and platform content.",
};

const sections: LegalSection[] = [
  {
    title: "Accepting these terms",
    paragraphs: [
      "By creating an account or using SkillBridge, you agree to these Terms and Conditions and the Privacy Policy. If you do not agree, you must not use the platform.",
      "You must be legally able to enter this agreement. Where a user is a minor, a parent or guardian is responsible for supervising use and accepting these terms where required by law.",
    ],
  },
  {
    title: "Accounts and roles",
    items: [
      "Provide accurate account information and keep login credentials confidential.",
      "Use only the student, tutor, or admin permissions assigned to your account.",
      "Notify SkillBridge if you believe an account or session has been compromised.",
      "Do not create accounts to impersonate others, evade restrictions, or interfere with platform operation.",
    ],
  },
  {
    title: "Tutor responsibilities",
    paragraphs: [
      "Tutors are responsible for accurately describing their qualifications, subjects, experience, availability, and rates. They must deliver booked sessions professionally and comply with applicable education, tax, and business obligations.",
      "SkillBridge provides marketplace and management tools but does not guarantee a tutor's availability, teaching outcome, income, or suitability for every learner.",
    ],
  },
  {
    title: "Bookings, payments, and cancellations",
    items: [
      "A booking is not confirmed until the platform records the required successful payment state.",
      "Prices shown during checkout are based on the tutor and session information available when the booking is created.",
      "Payment processing is provided through Stripe and may be subject to additional provider terms.",
      "Cancellation, refund, expiry, and no-show outcomes depend on the booking status and the policies presented during the booking flow.",
    ],
  },
  {
    title: "Sessions and user conduct",
    items: [
      "Treat learners, tutors, and platform staff respectfully and communicate only for legitimate learning purposes.",
      "Do not harass users, distribute harmful content, attempt fraud, or misuse meeting and notification features.",
      "Do not probe, disrupt, scrape, reverse engineer, or bypass security and role-based access controls.",
      "Do not upload or publish content that is unlawful or infringes another person's privacy or intellectual-property rights.",
    ],
  },
  {
    title: "Reviews and platform content",
    paragraphs: [
      "Reviews must reflect genuine platform experiences. SkillBridge may hide or remove fraudulent, abusive, irrelevant, or unlawful content and may moderate academic catalog information to keep discovery consistent.",
      "You retain ownership of content you submit, while granting SkillBridge permission to host, display, process, and distribute it as needed to operate and promote the service.",
    ],
  },
  {
    title: "Suspension and termination",
    paragraphs: [
      "SkillBridge may restrict, suspend, or terminate access when an account violates these terms, creates risk for other users, is associated with fraud or abuse, or must be restricted to comply with law.",
      "Users may stop using the service at any time. Certain booking, payment, security, or legal records may remain after account access ends.",
    ],
  },
  {
    title: "Availability and liability",
    paragraphs: [
      "The platform is provided on an as-available basis. SkillBridge works to provide reliable service but cannot promise uninterrupted operation, specific learning outcomes, or the continued availability of any tutor or third-party integration.",
      "To the extent permitted by law, SkillBridge is not responsible for indirect or consequential losses arising from platform use. Rights that cannot legally be excluded remain unaffected.",
    ],
  },
  {
    title: "Changes to these terms",
    paragraphs: [
      "These terms may be updated when features, business practices, or legal obligations change. The latest version and effective update date will remain available on this page. Continued use after an update means you accept the revised terms where permitted by law.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Platform agreement"
      title="Terms and Conditions"
      introduction="These terms define the rules for using SkillBridge as a learner, tutor, administrator, or visitor across the complete session lifecycle."
      lastUpdated="July 13, 2026"
      sections={sections}
    />
  );
}
