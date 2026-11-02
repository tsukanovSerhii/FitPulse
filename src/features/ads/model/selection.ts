import type { AdCampaign, AdPlacement, AdTier } from './types'

export const ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED === 'true'

export const PLACEMENT_TIERS: Record<AdPlacement, AdTier[]> = {
  dashboard: ['premium'],
  catalog: ['standard', 'premium'],
  sidebar: ['basic'],
  'post-workout': ['premium'],
}

export const CATALOG_AD_EVERY = 8

export const INTERSTITIAL_COOLDOWN_MS = 24 * 60 * 60 * 1000
const INTERSTITIAL_KEY = 'fitpulse_ad_interstitial_at'

/** Picks the highest allowed tier, then a weighted random campaign. `random` is injectable for tests. */
export function pickCampaign(
  campaigns: AdCampaign[],
  placement: AdPlacement,
  random: () => number = Math.random,
): AdCampaign | null {
  for (const tier of PLACEMENT_TIERS[placement]) {
    const pool = campaigns.filter((c) => c.tier === tier)
    if (pool.length === 0) continue
    const total = pool.reduce((sum, c) => sum + (c.weight ?? 1), 0)
    let roll = random() * total
    for (const campaign of pool) {
      roll -= campaign.weight ?? 1
      if (roll < 0) return campaign
    }
    return pool[pool.length - 1]
  }
  return null
}

export function canShowInterstitial(lastShownAt: number | null, now = Date.now()) {
  return lastShownAt === null || now - lastShownAt >= INTERSTITIAL_COOLDOWN_MS
}

export function getInterstitialShownAt(): number | null {
  try {
    const raw = localStorage.getItem(INTERSTITIAL_KEY)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

export function markInterstitialShown(now = Date.now()) {
  try {
    localStorage.setItem(INTERSTITIAL_KEY, String(now))
  } catch {
    // storage unavailable: skip frequency capping
  }
}
