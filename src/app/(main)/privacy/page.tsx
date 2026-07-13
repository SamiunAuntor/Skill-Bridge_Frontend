import LegalPage, { type LegalSection } from "@/Components/Legal/LegalPage";

export const metadata = {
  title: "Privacy Policy | SkillBridge",
  description:
    "Understand what information SkillBridge collects, why it is used, and the choices available to learners and tutors.",
};

const sections: LegalSection[] = [
  {
    title: "Information we collect",
    paragraphs: [
      "SkillBridge collects information you provide when creating and managing an account, using the marketplace, or communicating through the platform.",
    ],
    items: [
      "Account details such as name, email address, profile image, role, and authentication information.",
      "Tutor profile information such as biography, education, subjects, experience, hourly rate, and availability.",
      "Booking, session, payment-status, review, and notification records created while using SkillBridge.",
      "Technical information needed for security and session operation, which may include device, browser, IP address, and authentication-session data.",
    ],
  },
  {
    title: "How we use information",
    items: [
      "Operate accounts, tutor discovery, bookings, payments, live-session coordination, reviews, and dashboards.",
      "Protect users, enforce role-based access, prevent misuse, and diagnose service problems.",
      "Send account, booking, payment, and session notifications when those services are enabled.",
      "Improve platform reliability and understand how core product features perform.",
    ],
  },
  {
    title: "Payments and service providers",
    paragraphs: [
      "Payments are processed using Stripe. SkillBridge does not store complete payment-card details. Media uploads may be handled through Cloudinary, live meeting functionality may use Zoom, and transactional messages may be delivered through configured email providers.",
      "These providers process only the information needed to deliver their services and operate under their own privacy terms.",
    ],
  },
  {
    title: "When information is shared",
    paragraphs: [
      "Public tutor profile information and published reviews are visible to visitors. Information may also be shared with the student or tutor involved in a booking when needed to deliver the session.",
      "SkillBridge does not sell personal information. Information may be disclosed when required by law, to protect platform users, or during a legitimate business transfer subject to appropriate safeguards.",
    ],
  },
  {
    title: "Data retention and security",
    paragraphs: [
      "Information is retained for as long as it is needed to provide the service, maintain transaction and session records, meet legal obligations, resolve disputes, and protect the platform. Retention periods can differ by record type.",
      "SkillBridge uses access controls, password protection, validated requests, and secure service integrations. No internet service can guarantee absolute security, so users should protect their credentials and report suspicious activity promptly.",
    ],
  },
  {
    title: "Your choices",
    items: [
      "Review and update supported profile information from your dashboard.",
      "Control the information included in your public tutor profile, subject to required platform fields.",
      "Request correction or deletion of eligible personal information, while understanding that some transaction or security records may need to be retained.",
      "Sign out of active sessions and keep your password and account access secure.",
    ],
  },
  {
    title: "Children and policy updates",
    paragraphs: [
      "SkillBridge is not designed for children to use independently where parental consent is legally required. A parent or guardian should supervise any permitted use by a minor.",
      "This policy may change as the platform and legal requirements evolve. Material updates will be reflected on this page with a revised update date.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Your information"
      title="Privacy Policy"
      introduction="This policy explains how SkillBridge handles information across tutor discovery, accounts, bookings, payments, sessions, reviews, and role-based dashboards."
      lastUpdated="July 13, 2026"
      sections={sections}
    />
  );
}
