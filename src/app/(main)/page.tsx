import CtaSection from "@/Components/LandingPage/CtaSection";
import FeaturedTutorsSection from "@/Components/LandingPage/FeaturedTutorsSection";
import Hero from "@/Components/LandingPage/Hero";
import StatsSection from "@/Components/LandingPage/StatsSection";
import SubjectsSection from "@/Components/LandingPage/SubjectsSection";
import TrustSection from "@/Components/LandingPage/TrustSection";
import { getLandingPageData } from "@/lib/public-api";

export default async function Home() {
  const landingData = await getLandingPageData();

  return (
    <>
      <Hero />
      <StatsSection stats={landingData.stats} />
      <FeaturedTutorsSection tutors={landingData.featuredTutors} />
      <SubjectsSection subjects={landingData.subjects} />
      <TrustSection />
      <CtaSection />
    </>
  );
}
