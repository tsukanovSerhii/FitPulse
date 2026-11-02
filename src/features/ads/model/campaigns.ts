import type { AdCampaign } from './types'

/** Демо-кампанії: показують формати, доки немає реальних рекламодавців. */
export const DEMO_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'demo-premium',
    tier: 'premium',
    advertiser: 'FitPulse Partners',
    title: 'Ваш бренд на головному екрані',
    body: 'Спонсорська картка з фото для спортивного харчування, екіпірування чи залів.',
    cta: 'Стати партнером',
    href: 'mailto:ads@fitpulse.app?subject=Premium',
    imageSrc: '/images/deadlift.webp',
  },
  {
    id: 'demo-standard',
    tier: 'standard',
    advertiser: 'FitPulse Partners',
    title: 'Нативне розміщення в каталозі',
    body: 'Картка між вправами — для тренерів, магазинів і сервісів.',
    cta: 'Дізнатися умови',
    href: 'mailto:ads@fitpulse.app?subject=Standard',
  },
  {
    id: 'demo-basic',
    tier: 'basic',
    advertiser: 'FitPulse Partners',
    title: 'Текстове оголошення',
    body: 'Короткий рядок у навігації.',
    cta: 'Розмістити',
    href: 'mailto:ads@fitpulse.app?subject=Basic',
  },
]
