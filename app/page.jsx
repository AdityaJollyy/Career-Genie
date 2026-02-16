import CtaSection from "@/components/home/CtaSection";
import FaqSection from "@/components/home/FaqSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorksSection";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function Home() {
  return (
    <>
      <div className="grid-background"></div>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* CTA Section */}
      <CtaSection />
      
    </>
  );
}
