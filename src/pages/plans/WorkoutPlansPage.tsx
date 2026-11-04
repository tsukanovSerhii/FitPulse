import { useEffect, useMemo, useState } from 'react'
import { Calendar, LibraryBig, Plus, Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { SEO } from '@/shared/seo/SEO'
import { Button, EmptyState, IconButton, PageHeader, SearchInput } from '@/shared/ui'
import { fetchExercises } from '@/features/exercises'
import {
  AddExerciseToDayModal,
  PlanCard,
  PlanEditorModal,
  PlanListSkeleton,
  PlanTemplatesModal,
  TrainingDaysModal,
  usePlanActions,
  searchPlans,
  type DayOfWeek,
  type PlanTemplate,
  type WorkoutPlan,
  fetchPlans,
} from '@/features/workoutPlan'
import { useStartPlanDay } from '@/features/workoutSession'
import { SESSION_KEYS } from '@/shared/storage/sessionStorage'
import { useSessionState } from '@/shared/storage/useSessionState'
import { PAGE_META } from '../meta'

export function WorkoutPlansPage() {
  const dispatch = useAppDispatch()
  const actions = usePlanActions()
  const startPlanDay = useStartPlanDay()
  const { plans, activePlanId, status } = useAppSelector((state) => state.workoutPlan)
  const allExercises = useAppSelector((state) => state.exercises.items)

  // null expandedId means everything collapsed; a missing one falls back to the active plan
  const [view, setView] = useSessionState<{ query: string; expandedId?: string | null }>(SESSION_KEYS.PLANS_VIEW, { query: '' })
  const { query, expandedId } = view
  const setQuery = (next: string) => setView((v) => ({ ...v, query: next }))
  const setExpandedId = (next: string | null) => setView((v) => ({ ...v, expandedId: next }))
  const [editor, setEditor] = useState<{ open: boolean; plan: WorkoutPlan | null }>({ open: false, plan: null })
  const [dayEditor, setDayEditor] = useState<{ planId: string; day: DayOfWeek } | null>(null)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  // Choosing weekdays: for a template before it is added, or for one of the user's plans
  const [daysFor, setDaysFor] = useState<{ template: PlanTemplate } | { plan: WorkoutPlan } | null>(null)

  useEffect(() => {
    if (plans.length === 0) dispatch(fetchPlans())
    if (allExercises.length === 0) dispatch(fetchExercises())
  }, [dispatch, plans.length, allExercises.length])

  const openPlanId = expandedId === undefined ? activePlanId : expandedId
  const visiblePlans = useMemo(() => searchPlans(plans, allExercises, query, activePlanId), [plans, allExercises, query, activePlanId])
  const dayEditorPlan = dayEditor ? (plans.find((p) => p.id === dayEditor.planId) ?? null) : null

  const addedTemplateIds = useMemo(() => new Set(plans.flatMap((p) => (p.templateId ? [p.templateId] : []))), [plans])

  const openCreate = () => setEditor({ open: true, plan: null })
  const openTemplates = () => setTemplatesOpen(true)

  const confirmDays = async (days: DayOfWeek[]) => {
    if (!daysFor) return
    if ('plan' in daysFor) {
      await actions.setTrainingDays(daysFor.plan, days)
      setDaysFor(null)
      return
    }
    const plan = await actions.addFromTemplate(daysFor.template, days)
    setDaysFor(null)
    setTemplatesOpen(false)
    setView({ query: '', expandedId: plan.id })
  }

  return (
    <div className="space-y-4">
      <SEO {...PAGE_META.plans} />
      <PageHeader
        compact
        title="Програми"
        description="Тижневі спліти та розклад"
        actions={
          <>
            <IconButton label="Готові програми" icon={<LibraryBig />} onClick={openTemplates} className="border border-line sm:hidden" />
            <IconButton label="Нова програма" icon={<Plus />} onClick={openCreate} className="border border-line sm:hidden" />
            <Button variant="outline" className="hidden sm:inline-flex" onClick={openTemplates} icon={<LibraryBig />}>
              Готові програми
            </Button>
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
          description="Оберіть готову програму з бібліотеки або складіть власний тижневий план."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={openTemplates} icon={<LibraryBig />}>
                Готові програми
              </Button>
              <Button variant="outline" onClick={openCreate} icon={<Plus />}>
                Створити власну
              </Button>
            </div>
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
              onEditDays={() => setDaysFor({ plan })}
              onEditDay={(planId, day) => setDayEditor({ planId, day })}
              onDelete={actions.remove}
              onStartDayWorkout={startPlanDay}
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

      <PlanTemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        allExercises={allExercises}
        addedTemplateIds={addedTemplateIds}
        onAdd={(template) => setDaysFor({ template })}
      />

      {daysFor && (
        <TrainingDaysModal
          key={'plan' in daysFor ? daysFor.plan.id : daysFor.template.id}
          isOpen
          onClose={() => setDaysFor(null)}
          planName={'plan' in daysFor ? daysFor.plan.name : daysFor.template.name}
          schedule={'plan' in daysFor ? daysFor.plan.schedule : daysFor.template.schedule}
          allExercises={allExercises}
          confirmLabel={'plan' in daysFor ? 'Зберегти' : 'Додати програму'}
          onConfirm={confirmDays}
        />
      )}

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
