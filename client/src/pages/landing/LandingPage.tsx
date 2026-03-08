import { Navigation } from './sections/navigation';
import { HeroSection } from './sections/hero-section';
import { SeoIntroSection } from './sections/seo-intro-section';
import { ProblemSection } from './sections/problem-section';
import { SolutionSection } from './sections/solution-section';
import { FeaturesSection } from './sections/features-section';
import { HowItWorksSection } from './sections/how-it-works-section';
import { ProductPreviewSection } from './sections/product-preview-section';
import { BenefitsSection } from './sections/benefits-section';
import { PricingSection } from './sections/pricing-section';
import { FAQSection } from './sections/faq-section';
import { ContactSection } from './sections/contact-section';
import { CTASection } from './sections/cta-section';
import { Footer } from './sections/footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      <Navigation />
      <HeroSection />
      <SeoIntroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ProductPreviewSection />
      <BenefitsSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <CTASection />
      <Footer />
    </main>
  );
}
