import { SEO } from '@/shared/seo/SEO'
import { Footer } from '@/app/layout/Footer'
import { FAQ_JSON_LD } from '@/features/landing/faq'
import { FaqSection } from '@/features/landing/components/FaqSection'
import { FeaturesSection } from '@/features/landing/components/FeaturesSection'
import { FinalCta } from '@/features/landing/components/FinalCta'
import { HeroSection } from '@/features/landing/components/HeroSection'
import { HowItWorksSection } from '@/features/landing/components/HowItWorksSection'
import { LandingNav } from '@/features/landing/components/LandingNav'
import { PricingSection } from '@/features/landing/components/PricingSection'
import { StatsBand } from '@/features/landing/components/StatsBand'

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SEO
        title="FitPulse — програма тренувань у залі, техніка вправ і прогрес"
        description="Безкоштовний трекер тренувань для телефона: програми на тиждень, техніка кожної вправи, таймер відпочинку та прогрес у залі. Почніть за хвилину."
        jsonLd={FAQ_JSON_LD}
      />
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
