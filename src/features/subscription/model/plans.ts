import type { SubscriptionPlan } from './types'

export interface PlanInfo {
  id: SubscriptionPlan
  name: string
  priceUah: number
  period: string
  description: string
  features: string[]
  available: boolean
}

export const SUBSCRIPTION_PLANS: PlanInfo[] = [
  {
    id: 'free',
    name: 'Старт',
    priceUah: 0,
    period: 'назавжди',
    description: 'Все необхідне, щоб тренуватися за планом.',
    features: ['Каталог вправ з технікою', 'До 3 програм тренувань', 'Журнал і особисті рекорди', 'Таймер відпочинку'],
    available: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUah: 149,
    period: 'на місяць',
    description: 'Для тих, хто тренується системно.',
    features: ['Необмежені програми', 'Розширена аналітика прогресу', 'Синхронізація між пристроями', 'Без реклами'],
    available: false,
  },
  {
    id: 'team',
    name: 'Тренер',
    priceUah: 399,
    period: 'на місяць',
    description: 'Для персональних тренерів і невеликих залів.',
    features: ['До 20 клієнтів', 'Призначення програм клієнтам', 'Звіти по клієнтах', 'Брендування'],
    available: false,
  },
]

export const PLAN_NAMES: Record<SubscriptionPlan, string> = {
  free: 'Старт',
  pro: 'Pro',
  team: 'Тренер',
}
