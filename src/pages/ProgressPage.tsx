import React, { useEffect } from 'react'
import { TrendingUp, Trophy, History, Dumbbell } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProgress, deleteWorkoutLogAsync } from '@/features/progress/model/progressSlice'
import { StatsGrid } from '@/features/progress/components/StatsGrid'
import { WorkoutHistoryItem } from '@/features/progress/components/WorkoutHistoryItem'
import { PRCard } from '@/features/progress/components/PRCard'
import { EmptyState } from '@/components/common/EmptyState'
import { updatePageSEO } from '@/utils/seo'

export const ProgressPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { history, personalRecords, status } = useAppSelector((state) => state.progress)

  useEffect(() => {
    updatePageSEO({
      title: 'Прогрес та аналітика: історія тренувань, тоннаж, силові рекорди | FitPulse',
      description: 'Аналітика вашого фітнес-прогресу: сумарний піднятий тоннаж, час у залі, графік занять та особисті рекорди (Personal Records).',
      keywords: ['аналітика залу', 'щоденник ваги', 'силові рекорди атлета'],
    })
    if (history.length === 0) {
      dispatch(fetchProgress())
    }
  }, [dispatch, history.length])

  const handleDeleteLog = (id: string) => {
    if (window.confirm('Видалити цей запис із журналу тренувань?')) {
      dispatch(deleteWorkoutLogAsync(id))
    }
  }

  const prList = Object.values(personalRecords)

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Title */}
      <div className="pb-4 border-b border-white/[0.06]">
        <h1 className="text-2xl sm:text-4xl font-heading font-black text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#d4ff00]/15 border border-[#d4ff00]/30 text-[#d4ff00] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          Прогрес та аналітика
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
          Відстежуйте об'єм навантажень, час у залі та особисті силові максимуми
        </p>
      </div>

      {/* Stats Summary Grid */}
      <StatsGrid history={history} personalRecords={personalRecords} />

      {/* Personal Records (PRs) */}
      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-heading font-black text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Особисті силові рекорди (Personal Records)
        </h3>

        {prList.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-8 h-8 text-amber-400" />}
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

      {/* Workout History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-heading font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-sky-400" />
            Історія завершених занять ({history.length})
          </h3>
        </div>

        {status === 'loading' && history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Завантаження журналу тренувань...
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="w-8 h-8 text-[#d4ff00]" />}
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
