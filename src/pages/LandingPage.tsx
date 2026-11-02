import { Link } from 'react-router-dom'
import { SEO } from '@/components/common/SEO'
import { Footer } from '@/components/layout/Footer'
import { buttonClasses } from '@/components/ui'
import { FeaturesSection } from '@/features/landing/components/FeaturesSection'
import { HeroSection } from '@/features/landing/components/HeroSection'
import { HowItWorksSection } from '@/features/landing/components/HowItWorksSection'
import { LandingNav } from '@/features/landing/components/LandingNav'
import { PricingSection } from '@/features/landing/components/PricingSection'

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SEO
        title="FitPulse — трекер силових тренувань"
        description="План, техніка вправ і прогрес в одному застосунку. Створений для тренувань у залі з телефона."
      />
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <section className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-28">
            <h2 className="text-5xl leading-[1.05] text-fg sm:text-6xl">
              Наступне тренування
              <br />
              <span className="text-accent">вже сьогодні</span>
            </h2>
            <Link to="/register" className={buttonClasses('primary', 'lg')}>
              Створити акаунт
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
