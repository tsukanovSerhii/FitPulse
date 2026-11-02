import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { cn } from '@/shared/lib/cn'
import { DEMO_CAMPAIGNS } from '../model/campaigns'
import { ADS_ENABLED, pickCampaign } from '../model/selection'
import type { AdCampaign, AdPlacement } from '../model/types'

export function AdLabel({ className }: { className?: string }) {
  return (
    <span className={cn('text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-subtle', className)}>Реклама</span>
  )
}

function PremiumAd({ ad }: { ad: AdCampaign }) {
  return (
    <a
      href={ad.href}
      target="_blank"
      rel="sponsored noopener"
      className="group grid overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-line-strong sm:grid-cols-[1fr_200px]"
    >
      <div className="space-y-2 p-5">
        <AdLabel />
        <p className="font-display text-xl uppercase text-fg">{ad.title}</p>
        <p className="text-sm text-fg-muted">{ad.body}</p>
        <span className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-accent">
          {ad.cta} <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
      {ad.imageSrc && <img src={ad.imageSrc} alt="" loading="lazy" className="hidden h-full w-full object-cover sm:block" />}
    </a>
  )
}

function StandardAd({ ad }: { ad: AdCampaign }) {
  return (
    <a
      href={ad.href}
      target="_blank"
      rel="sponsored noopener"
      className="flex h-full flex-col justify-between gap-4 rounded-lg border border-dashed border-line-strong bg-surface p-5 transition-colors hover:border-accent"
    >
      <div className="space-y-2">
        <AdLabel />
        <p className="font-semibold text-fg">{ad.title}</p>
        <p className="text-sm text-fg-muted">{ad.body}</p>
      </div>
      <span className="text-sm font-semibold text-accent">{ad.cta}</span>
    </a>
  )
}

function BasicAd({ ad }: { ad: AdCampaign }) {
  return (
    <a href={ad.href} target="_blank" rel="sponsored noopener" className="block rounded-md px-2 py-1.5 text-xs hover:bg-surface-2">
      <AdLabel className="mr-1.5" />
      <span className="text-fg-muted">{ad.title}</span>
    </a>
  )
}

/** Renders nothing when ads are disabled or a workout is in progress. */
export function AdSlot({ placement, className }: { placement: AdPlacement; className?: string }) {
  const isTraining = useAppSelector((state) => state.workoutSession.isActive)
  const [ad] = useState(() => pickCampaign(DEMO_CAMPAIGNS, placement))

  if (!ADS_ENABLED || isTraining || !ad) return null

  return (
    <aside aria-label="Реклама" className={className}>
      {ad.tier === 'premium' && <PremiumAd ad={ad} />}
      {ad.tier === 'standard' && <StandardAd ad={ad} />}
      {ad.tier === 'basic' && <BasicAd ad={ad} />}
    </aside>
  )
}
