import HeroSection from "@/components/HeroSection";
import QuotesSection from "@/components/QuotesSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import LeaderboardSection from "@/components/LeaderboardSection";
import CommunitySummarySection from "@/components/CommunitySummarySection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <QuotesSection />
      <FeaturesSection />
      <CommunitySummarySection />
      <HowItWorksSection />
      <LeaderboardSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
