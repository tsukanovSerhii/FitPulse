import { SEO } from '@/shared/seo/SEO'
import { Footer } from '@/app/layout/Footer'
import { FAQ_JSON_LD, FaqSection, FeaturesSection, FinalCta, HeroSection, HowItWorksSection, LandingNav, PricingSection, StatsBand } from '@/features/landing'

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
