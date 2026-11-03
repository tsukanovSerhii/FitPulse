import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Dumbbell, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { PostWorkoutAd } from '@/features/ads'
import {
  deleteWorkoutLogAsync,
  fetchProgress,
  ListSkeleton,
  ProgressCharts,
  ProgressSummary,
  RecordList,
  SummarySkeleton,
  WorkoutHistoryItem,
} from '@/features/progress'
import { SEO } from '@/shared/seo/SEO'
import { confirmAction, EmptyState, PageHeader, Section } from '@/shared/ui'

export function ProgressPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { history, personalRecords, status } = useAppSelector((state) => state.progress)

  useEffect(() => {
    if (history.length === 0) dispatch(fetchProgress())
  }, [dispatch, history.length])

  const handleDeleteLog = async (id: string) => {
    const confirmed = await confirmAction({
      title: 'Видалити тренування з журналу?',
      description: 'Особисті рекорди буде перераховано.',
      confirmLabel: 'Видалити',
      destructive: true,
    })
    if (!confirmed) return
    await dispatch(deleteWorkoutLogAsync(id))
    toast.success('Запис видалено')
  }

  const justFinished = Boolean((location.state as { justFinished?: boolean } | null)?.justFinished)
  const records = Object.values(personalRecords)
  const isLoading = (status === 'idle' || status === 'loading') && history.length === 0

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PostWorkoutAd trigger={justFinished} />
      <SEO title="Прогрес" description="Журнал тренувань, тоннаж, час у залі та особисті рекорди." />
      <PageHeader compact title="Прогрес" description="Журнал тренувань і особисті рекорди" />

      {isLoading ? <SummarySkeleton /> : <ProgressSummary history={history} personalRecords={personalRecords} />}

      {!isLoading && history.length > 0 && <ProgressCharts history={history} />}

      <Section title="Особисті рекорди">
        {isLoading ? (
          <ListSkeleton label="Завантаження рекордів" />
        ) : records.length === 0 ? (
          <EmptyState icon={<Trophy />} title="Рекордів ще немає" description="Завершуйте тренування з вагою, і найкращі результати з'являться тут." />
        ) : (
          <RecordList records={records} />
        )}
      </Section>

      <Section title="Журнал" aside={<span className="font-mono text-xs text-fg-subtle tabular">{history.length}</span>}>
        {isLoading ? (
          <ListSkeleton label="Завантаження журналу" />
        ) : history.length === 0 ? (
          <EmptyState icon={<Dumbbell />} title="Журнал порожній" description="Завершіть перше тренування, і воно з'явиться тут." />
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {history.map((log) => (
              <WorkoutHistoryItem key={log.id} log={log} onDelete={handleDeleteLog} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
