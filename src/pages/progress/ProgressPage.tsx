import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { PostWorkoutAd } from '@/features/ads'
import {
  deleteWorkoutLogAsync,
  fetchProgress,
  ListSkeleton,
  ProgressCharts,
  ProgressSummary,
  ProgressTabs,
  RecentWorkouts,
  RecordList,
  SummarySkeleton,
} from '@/features/progress'
import { SEO } from '@/shared/seo/SEO'
import { confirmAction, EmptyState, PageHeader, Section } from '@/shared/ui'
import { PAGE_META } from '../meta'

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
      <SEO {...PAGE_META.progress} />
      <PageHeader compact title="Прогрес" description="Журнал тренувань і особисті рекорди" />
      <ProgressTabs />

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

      {!isLoading && history.length > 0 && <RecentWorkouts history={history} records={personalRecords} onDelete={handleDeleteLog} />}
    </div>
  )
}
