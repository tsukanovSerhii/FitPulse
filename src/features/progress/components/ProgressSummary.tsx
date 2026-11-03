import { Stat } from '@/shared/ui'
import { formatNumber } from '@/shared/lib/formatters'
import type { PersonalRecord, WorkoutHistoryLog } from '../model/types'

interface ProgressSummaryProps {
  history: WorkoutHistoryLog[]
  personalRecords: Record<string, PersonalRecord>
}

export function ProgressSummary({ history, personalRecords }: ProgressSummaryProps) {
  const totalSeconds = history.reduce((sum, log) => sum + log.durationSeconds, 0)
  const totalVolumeKg = history.reduce((sum, log) => sum + log.totalVolumeKg, 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.round((totalSeconds % 3600) / 60)

  return (
    <section
      aria-label="Підсумки"
      className="grid grid-cols-2 rounded-lg border border-line bg-surface lg:grid-cols-4 [&>*]:border-line [&>*]:p-4 sm:[&>*]:p-5 [&>*:nth-child(odd)]:border-r lg:[&>*:not(:last-child)]:border-r [&>*:nth-child(-n+2)]:border-b lg:[&>*:nth-child(-n+2)]:border-b-0"
    >
      <Stat label="Тренувань" value={history.length} hint="усього" />
      <Stat label="Тоннаж" value={formatNumber(totalVolumeKg / 1000, 1)} unit="т" hint={`${formatNumber(totalVolumeKg)} кг`} />
      <Stat label="Час у залі" value={hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}` : minutes} unit={hours > 0 ? 'год' : 'хв'} />
      <Stat label="Рекорди" value={Object.keys(personalRecords).length} hint="за вправами" accent />
    </section>
  )
}
