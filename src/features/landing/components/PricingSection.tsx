import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Badge, SectionLabel, buttonClasses } from '@/components/ui'
import { SUBSCRIPTION_PLANS } from '@/features/auth/model/plans'
import { formatNumber } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl space-y-12 px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <SectionLabel index={4}>Тарифи</SectionLabel>
          <h2 className="text-4xl leading-[1.08] text-fg sm:text-5xl">Почніть безкоштовно</h2>
        </div>
        <ul className="grid gap-4 lg:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <li
              key={plan.id}
              className={cn(
                'flex flex-col rounded-lg border bg-surface p-6 sm:p-8',
                plan.id === 'pro' ? 'border-accent' : 'border-line',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-lg font-semibold normal-case tracking-normal text-fg">{plan.name}</h3>
                {!plan.available && <Badge variant="neutral">Незабаром</Badge>}
              </div>
              <p className="mt-2 text-sm text-fg-muted">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-semibold text-fg tabular">{formatNumber(plan.priceUah)} ₴</span>
                <span className="text-sm text-fg-subtle">{plan.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-fg-muted">
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
