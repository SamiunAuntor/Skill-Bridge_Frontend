import CtaSection from "@/Components/LandingPage/CtaSection";
import FeaturedTutorsSection from "@/Components/LandingPage/FeaturedTutorsSection";
import Hero from "@/Components/LandingPage/Hero";
import StatsSection from "@/Components/LandingPage/StatsSection";
import SubjectsSection from "@/Components/LandingPage/SubjectsSection";
import TrustSection from "@/Components/LandingPage/TrustSection";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsSection />
      <FeaturedTutorsSection />
      <SubjectsSection />
      <TrustSection />
      <CtaSection />
    </>
  );
}
