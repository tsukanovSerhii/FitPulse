import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Badge, buttonClasses } from '@/shared/ui'
import { SUBSCRIPTION_PLANS } from '@/features/auth/model/plans'
import { formatNumber } from '@/shared/lib/formatters'
import { cn } from '@/shared/lib/cn'
import { SectionHeader } from './SectionHeader'

export function PricingSection() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-7xl space-y-14 px-5 py-24 sm:px-8 lg:py-32">
        <SectionHeader
          id="pricing-title"
          index={4}
          label="Тарифи"
          title="Почніть безкоштовно"
          lead="Базовий тариф безкоштовний назавжди. Розширені можливості з'являться в підписках Pro і «Тренер»."
        />
        <ul className="grid gap-4 lg:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <li
              key={plan.id}
              className={cn(
                'flex flex-col rounded-lg border bg-surface p-6 sm:p-10',
                plan.id === 'pro' ? 'border-accent' : 'border-line',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-3xl text-fg">{plan.name}</h3>
                {!plan.available && <Badge variant="neutral">Незабаром</Badge>}
              </div>
              <p className="mt-3 text-base text-fg-muted">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-semibold text-fg tabular">{formatNumber(plan.priceUah)} ₴</span>
                <span className="text-sm text-fg-subtle">{plan.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-base text-fg-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.available ? (
                <Link to="/register" className={buttonClasses('primary', 'md', 'mt-8 w-full')}>
                  Почати безкоштовно
                </Link>
              ) : (
                <span className={buttonClasses('outline', 'md', 'mt-8 w-full pointer-events-none opacity-60')} aria-disabled="true">
                  Скоро
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
