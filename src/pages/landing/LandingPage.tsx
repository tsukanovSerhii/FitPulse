import { SEO } from '@/shared/seo/SEO'
import { Footer } from '@/app/layout/Footer'
import { FAQ_JSON_LD, FaqSection, FeaturesSection, FinalCta, HeroSection, HowItWorksSection, LandingNav, PricingSection, StatsBand } from '@/features/landing'
import { PAGE_META } from '../meta'

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SEO {...PAGE_META.landing} jsonLd={FAQ_JSON_LD} />
      <LandingNav />
      <main>
        <HeroSection />
        <StatsBand />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
