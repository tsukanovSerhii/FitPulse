import { useEffect, useMemo, useState } from 'react'
import { Calendar, Plus, Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { SEO } from '@/shared/seo/SEO'
import { Button, EmptyState, IconButton, PageHeader, SearchInput } from '@/shared/ui'
import { fetchExercises } from '@/features/exercises/model/exercisesSlice'
import { AddExerciseToDayModal } from '@/features/workoutPlan/components/AddExerciseToDayModal'
import { PlanCard } from '@/features/workoutPlan/components/PlanCard'
import { PlanEditorModal } from '@/features/workoutPlan/components/PlanEditorModal'
import { PlanListSkeleton } from '@/features/workoutPlan/components/PlanListSkeleton'
import { usePlanActions } from '@/features/workoutPlan/hooks/usePlanActions'
import { searchPlans } from '@/features/workoutPlan/lib/search'
import type { DayOfWeek, WorkoutPlan } from '@/features/workoutPlan/model/types'
import { fetchPlans } from '@/features/workoutPlan/model/workoutPlanSlice'
import { SESSION_KEYS } from '@/shared/storage/sessionStorage'
import { useSessionState } from '@/shared/storage/useSessionState'

export function WorkoutPlansPage() {
  const dispatch = useAppDispatch()
  const actions = usePlanActions()
  const { plans, activePlanId, status } = useAppSelector((state) => state.workoutPlan)
  const allExercises = useAppSelector((state) => state.exercises.items)

  // null expandedId means everything collapsed; a missing one falls back to the active plan
  const [view, setView] = useSessionState<{ query: string; expandedId?: string | null }>(SESSION_KEYS.PLANS_VIEW, { query: '' })
  const { query, expandedId } = view
  const setQuery = (next: string) => setView((v) => ({ ...v, query: next }))
  const setExpandedId = (next: string | null) => setView((v) => ({ ...v, expandedId: next }))
  const [editor, setEditor] = useState<{ open: boolean; plan: WorkoutPlan | null }>({ open: false, plan: null })
  const [dayEditor, setDayEditor] = useState<{ planId: string; day: DayOfWeek } | null>(null)

  useEffect(() => {
    if (plans.length === 0) dispatch(fetchPlans())
    if (allExercises.length === 0) dispatch(fetchExercises())
  }, [dispatch, plans.length, allExercises.length])

  const openPlanId = expandedId === undefined ? activePlanId : expandedId
  const visiblePlans = useMemo(() => searchPlans(plans, allExercises, query, activePlanId), [plans, allExercises, query, activePlanId])
  const dayEditorPlan = dayEditor ? (plans.find((p) => p.id === dayEditor.planId) ?? null) : null

  const openCreate = () => setEditor({ open: true, plan: null })

  return (
    <div className="space-y-4">
      <SEO title="Програми тренувань" description="Тижневі спліти: Push/Pull/Legs, Full Body. Підходи, повторення та дні відпочинку." />
      <PageHeader
        compact
        title="Програми"
        description="Тижневі спліти та розклад"
        actions={
          <>
            <IconButton label="Нова програма" icon={<Plus />} onClick={openCreate} className="border border-line sm:hidden" />
            <Button className="hidden sm:inline-flex" onClick={openCreate} icon={<Plus />}>
              Нова програма
            </Button>
          </>
        }
      />

      {plans.length > 0 && <SearchInput label="Пошук програми" placeholder="Пошук за назвою або вправою" value={query} onChange={setQuery} />}

      {status !== 'succeeded' && status !== 'failed' && plans.length === 0 ? (
        <PlanListSkeleton />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<Calendar />}
          title="Програм ще немає"
          description="Створіть тижневий план, щоб систематизувати тренування."
          action={
            <Button onClick={openCreate} icon={<Plus />}>
              Створити програму
            </Button>
          }
        />
      ) : visiblePlans.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="Нічого не знайдено"
          description={`Немає програм за запитом «${query}».`}
          action={
            <Button variant="outline" size="sm" onClick={() => setQuery('')}>
              Очистити пошук
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {visiblePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActive={plan.id === activePlanId}
              expanded={openPlanId === plan.id}
              onToggle={() => setExpandedId(openPlanId === plan.id ? null : plan.id)}
              allExercises={allExercises}
              onSetActive={actions.setActive}
              onEdit={() => setEditor({ open: true, plan })}
              onEditDay={(planId, day) => setDayEditor({ planId, day })}
              onDelete={actions.remove}
              onStartDayWorkout={actions.startDay}
            />
          ))}
        </div>
      )}

      <PlanEditorModal
        key={editor.plan?.id ?? 'new'}
        isOpen={editor.open}
        onClose={() => setEditor({ open: false, plan: null })}
        onSave={actions.save}
        initialPlan={editor.plan}
      />

      <AddExerciseToDayModal
        isOpen={dayEditor !== null}
        onClose={() => setDayEditor(null)}
        plan={dayEditorPlan}
        day={dayEditor?.day ?? null}
        allExercises={allExercises}
        onAddExercise={actions.addExercise}
        onRemoveExercise={actions.removeExercise}
        onUpdateExercise={actions.updateExercise}
      />
    </div>
  )
}
