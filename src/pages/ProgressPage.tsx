import React, { useEffect } from 'react'
import { TrendingUp, Trophy, History, Dumbbell } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchProgress, deleteWorkoutLogAsync } from '@/features/progress/model/progressSlice'
import { StatsGrid } from '@/features/progress/components/StatsGrid'
import { WorkoutHistoryItem } from '@/features/progress/components/WorkoutHistoryItem'
import { PRCard } from '@/features/progress/components/PRCard'
import { EmptyState } from '@/components/common/EmptyState'

export const ProgressPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { history, personalRecords, status } = useAppSelector((state) => state.progress)

  useEffect(() => {
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
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
          <TrendingUp className="w-7 h-7 text-purple-400" />
          Прогрес та аналітика
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Відстежуйте об'єм навантажень, тривалість тренувань та особисті силові рекорди
        </p>
      </div>

      {/* Stats Summary Grid */}
      <StatsGrid history={history} personalRecords={personalRecords} />

      {/* Personal Records (PRs) */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Особисті силові рекорди (Personal Records)
        </h3>

        {prList.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-8 h-8" />}
            title="Рекордів ще немає"
            description="Завершуйте тренування та фіксуйте вагу — рекорди будуть автоматично розраховуватися тут."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prList.map((pr) => (
              <PRCard key={pr.exerciseId} pr={pr} />
            ))}
          </div>
        )}
      </section>

      {/* Workout History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Історія завершених занять ({history.length})
          </h3>
        </div>

        {status === 'loading' && history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Завантаження журналу тренувань...
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="w-8 h-8" />}
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
