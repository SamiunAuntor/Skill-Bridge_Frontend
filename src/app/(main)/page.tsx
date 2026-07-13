import CtaSection from "@/Components/LandingPage/CtaSection";
import FaqSection from "@/Components/LandingPage/FaqSection";
import FeaturedTutorsSection from "@/Components/LandingPage/FeaturedTutorsSection";
import Hero from "@/Components/LandingPage/Hero";
import HowItWorksSection from "@/Components/LandingPage/HowItWorksSection";
import LearningExperienceSection from "@/Components/LandingPage/LearningExperienceSection";
import StatsSection from "@/Components/LandingPage/StatsSection";
import SubjectsSection from "@/Components/LandingPage/SubjectsSection";
import TrustSection from "@/Components/LandingPage/TrustSection";
import TutorOpportunitySection from "@/Components/LandingPage/TutorOpportunitySection";
import { getLandingPageData } from "@/lib/public-api";
import { getLandingPageFallbackData } from "@/lib/public-page-fallbacks";

export const revalidate = 60;

export default async function Home() {
  const landingData = await getLandingPageData().catch(() =>
    getLandingPageFallbackData()
  );

  return (
    <>
      <Hero activeStudents={landingData.stats.activeStudents} />
      <StatsSection stats={landingData.stats} />
      <FeaturedTutorsSection tutors={landingData.featuredTutors} />
      <SubjectsSection subjects={landingData.subjects} />
      <HowItWorksSection />
      <LearningExperienceSection />
      <TrustSection platformReviews={landingData.platformReviews ?? []} />
      <TutorOpportunitySection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
