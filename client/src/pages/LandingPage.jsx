import HeroSection from "@/components/HeroSection";
import QuotesSection from "@/components/QuotesSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function LandingPage({ onHost, onJoin, onSolo, hostUser, onLogin, onLogout, onHistory, onReports, onGoogleLogin }) {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection 
        onHost={onHost} 
        onJoin={onJoin} 
        onSolo={onSolo} 
        onHistory={onHistory}
        onReports={onReports}
        onLogin={onLogin}
        onLogout={onLogout}
        hostUser={hostUser}
      />
      <QuotesSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection onJoin={onJoin} />
