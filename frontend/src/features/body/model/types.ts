export type BodyMetric = 'weightKg' | 'waistCm' | 'chestCm' | 'hipsCm' | 'armCm'

export const BODY_METRICS: { key: BodyMetric; label: string; unit: string; step: number }[] = [
  { key: 'weightKg', label: 'Вага', unit: 'кг', step: 0.1 },
  { key: 'waistCm', label: 'Талія', unit: 'см', step: 0.5 },
  { key: 'chestCm', label: 'Груди', unit: 'см', step: 0.5 },
  { key: 'hipsCm', label: 'Стегна', unit: 'см', step: 0.5 },
  { key: 'armCm', label: 'Біцепс', unit: 'см', step: 0.5 },
]

export type BodyEntry = { id: string; date: string } & Partial<Record<BodyMetric, number>>

export interface BodyState {
  entries: BodyEntry[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}
