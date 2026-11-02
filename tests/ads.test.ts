import { describe, expect, it } from 'vitest'
import { canShowInterstitial, INTERSTITIAL_COOLDOWN_MS, pickCampaign } from '@/features/ads/model/selection'
import type { AdCampaign } from '@/features/ads/model/types'

const ad = (id: string, tier: AdCampaign['tier'], weight?: number): AdCampaign => ({
  id,
  tier,
  weight,
  advertiser: 'a',
  title: 't',
  body: 'b',
  cta: 'c',
  href: '#',
})

describe('ads selection', () => {
  it('picks only tiers allowed for the placement', () => {
    const campaigns = [ad('b', 'basic'), ad('p', 'premium')]
    expect(pickCampaign(campaigns, 'sidebar')?.id).toBe('b')
    expect(pickCampaign(campaigns, 'dashboard')?.id).toBe('p')
  })

  it('falls back to the next tier when the preferred one is empty', () => {
    expect(pickCampaign([ad('p', 'premium')], 'catalog')?.id).toBe('p')
    expect(pickCampaign([ad('b', 'basic')], 'catalog')).toBeNull()
  })

  it('rotates by weight', () => {
    const campaigns = [ad('light', 'premium', 1), ad('heavy', 'premium', 3)]
    expect(pickCampaign(campaigns, 'dashboard', () => 0.1)?.id).toBe('light')
    expect(pickCampaign(campaigns, 'dashboard', () => 0.5)?.id).toBe('heavy')
  })

  it('caps interstitials to once per cooldown', () => {
    const now = 1_000_000_000
    expect(canShowInterstitial(null, now)).toBe(true)
    expect(canShowInterstitial(now - 1000, now)).toBe(false)
    expect(canShowInterstitial(now - INTERSTITIAL_COOLDOWN_MS, now)).toBe(true)
  })
})
