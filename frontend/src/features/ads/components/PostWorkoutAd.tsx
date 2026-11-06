import { useEffect, useState } from 'react'
import { Modal } from '@/shared/ui'
import { DEMO_CAMPAIGNS } from '../model/campaigns'
import {
  ADS_ENABLED,
  canShowInterstitial,
  getInterstitialShownAt,
  markInterstitialShown,
  pickCampaign,
} from '../model/selection'
import { AdLabel } from './AdSlot'

/** Premium interstitial after a saved workout, at most once a day. */
export function PostWorkoutAd({ trigger }: { trigger: boolean }) {
  const [ad] = useState(() => pickCampaign(DEMO_CAMPAIGNS, 'post-workout'))
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!trigger || !ADS_ENABLED || !ad || !canShowInterstitial(getInterstitialShownAt())) return
    const id = window.setTimeout(() => {
      setOpen(true)
      markInterstitialShown()
    }, 1200)
    return () => clearTimeout(id)
  }, [trigger, ad])

  if (!ad) return null

  return (
    <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="md" eyebrow={<AdLabel />} title={ad.title}>
      <div className="space-y-4">
        {ad.imageSrc && <img src={ad.imageSrc} alt="" className="aspect-video w-full rounded-md object-cover" />}
        <p className="text-sm text-fg-muted">{ad.body}</p>
        <a
          href={ad.href}
          target="_blank"
          rel="sponsored noopener"
          className="flex h-12 items-center justify-center rounded-md bg-accent text-sm font-semibold uppercase text-on-accent hover:bg-accent-hover"
        >
          {ad.cta}
        </a>
      </div>
    </Modal>
  )
}
