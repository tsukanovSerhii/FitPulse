import { toast } from 'sonner'
import React, { useEffect } from 'react'
import { Trophy, History, Dumbbell } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { useLocation } from 'react-router-dom'
import { PostWorkoutAd } from '@/features/ads/components/PostWorkoutAd'
import { fetchProgress, deleteWorkoutLogAsync } from '@/features/progress/model/progressSlice'
import { StatsGrid } from '@/features/progress/components/StatsGrid'
import { WorkoutHistoryItem } from '@/features/progress/components/WorkoutHistoryItem'
import { PRCard } from '@/features/progress/components/PRCard'
import { HistoryListSkeleton, StatsGridSkeleton } from '@/features/progress/components/ProgressSkeleton'
import { LoadingRegion, Skeleton } from '@/shared/ui'
import { EmptyState, PageHeader, confirmAction } from '@/shared/ui'
import { SEO } from '@/shared/seo/SEO'

export const ProgressPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { history, personalRecords, status } = useAppSelector((state) => state.progress)

  useEffect(() => {
    
    if (history.length === 0) {
      dispatch(fetchProgress())
    }
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

  const location = useLocation()
  const justFinished = Boolean((location.state as { justFinished?: boolean } | null)?.justFinished)

  const prList = Object.values(personalRecords)
  const isLoading = (status === 'idle' || status === 'loading') && history.length === 0

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PostWorkoutAd trigger={justFinished} />
      <SEO title="Прогрес та аналітика" description="Аналітика вашого фітнес-прогресу: сумарний піднятий тоннаж, час у залі, графік занять та особисті рекорди." />
      <PageHeader
        index={4}
        eyebrow="Аналітика"
        title="Прогрес"
        description="Відстежуйте об'єм навантажень, час у залі та особисті силові максимуми"
      />

      {isLoading ? <StatsGridSkeleton /> : <StatsGrid history={history} personalRecords={personalRecords} />}

      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-display font-black text-fg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          Особисті силові рекорди (Personal Records)
        </h3>

        {isLoading ? (
          <LoadingRegion label="Завантаження рекордів" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </LoadingRegion>
        ) : prList.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-8 h-8 text-warning" />}
            title="Рекордів ще немає"
            description="Завершуйте тренування та фіксуйте вагу — рекорди будуть автоматично розраховуватися тут."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prList.map((pr) => (
              <PRCard key={pr.exerciseId} pr={pr} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-display font-black text-fg flex items-center gap-2">
            <History className="w-5 h-5 text-accent" />
            Історія завершених занять ({history.length})
          </h3>
        </div>

        {isLoading ? (
          <HistoryListSkeleton />
        ) : history.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="w-8 h-8 text-accent" />}
            title="Журнал тренувань порожній"
            description="Ви ще не зафіксували жодного тренування. Перейдіть до розділу «Тренування» та завершіть першу сесію!"
          />
        ) : (
          <div className="space-y-3">
            {history.map((log) => (
              <WorkoutHistoryItem key={log.id} log={log} onDelete={handleDeleteLog} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
