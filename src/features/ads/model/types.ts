/** Higher tier = more prominent format and higher price. */
export type AdTier = 'premium' | 'standard' | 'basic'

export type AdPlacement = 'dashboard' | 'catalog' | 'sidebar' | 'post-workout'

export interface AdCampaign {
  id: string
  tier: AdTier
  advertiser: string
  title: string
  body: string
  cta: string
  href: string
  imageSrc?: string
  weight?: number
}
