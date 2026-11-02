/** Чим вищий рівень, тим помітніший формат і вища ціна розміщення. */
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
  /** Вага в ротації серед кампаній одного рівня */
  weight?: number
}
