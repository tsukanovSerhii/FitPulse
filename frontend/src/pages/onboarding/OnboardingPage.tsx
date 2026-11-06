import { useMemo, useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { addBodyEntry } from '@/features/body/model'
import { JOINT_LABELS, setMyEquipment, setMyLimits, type Joint } from '@/features/exercises/model'
import {
  EXPERIENCE_LABELS,
  PLACE_LABELS,
  equipmentFor,
  profileFromAnswers,
  recommendTemplates,
  type Experience,
  type OnboardingAnswers,
  type TrainingPlace,
} from '@/features/onboarding'
import { FITNESS_GOAL_LABELS, needsOnboarding, updateProfileAsync, type FitnessGoal, type UserProfile } from '@/features/profile/model'
import { setWeeklyGoal } from '@/features/progress/model'
import { PLAN_TEMPLATES } from '@/features/workoutPlan/catalog'
import { PLAN_GOAL_LABELS, planFromTemplate, savePlanAsync, setActivePlanAsync, templateDays, type DayOfWeek, type PlanTemplate } from '@/features/workoutPlan/model'
import { SEO } from '@/shared/seo/SEO'
import { SESSION_KEYS, removeFromSession } from '@/shared/storage/sessionStorage'
import { useSessionState } from '@/shared/storage/useSessionState'
import { Button, Card, Checkbox, Input, SegmentedControl } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { PAGE_META } from '../meta'

// Numbers stay strings while typing, so an empty field is not a zero
interface Draft {
  step: number
  gender: UserProfile['gender']
  age: string
  heightCm: string
  weightKg: string
  targetWeightKg: string
  goal: FitnessGoal | null
  experience: Experience | null
  days: number
  place: TrainingPlace
  limits: Joint[]
}

const INITIAL_DRAFT: Draft = {
  step: 1,
  gender: 'male',
  age: '',
  heightCm: '',
  weightKg: '',
  targetWeightKg: '',
  goal: null,
  experience: null,
  days: 3,
  place: 'gym',
  limits: [],
}

const STEPS = 5
const RANGES = {
  age: [14, 90, 'Вкажіть вік від 14 до 90 років'],
  heightCm: [120, 230, 'Вкажіть зріст від 120 до 230 см'],
  weightKg: [30, 250, 'Вкажіть вагу від 30 до 250 кг'],
  targetWeightKg: [30, 250, 'Вкажіть бажану вагу від 30 до 250 кг'],
} as const
type NumberField = keyof typeof RANGES

// Weekdays a template with this many sessions lands on
const WEEKDAYS: Record<number, DayOfWeek[]> = {
  2: ['monday', 'thursday'],
  3: ['monday', 'wednesday', 'friday'],
  4: ['monday', 'tuesday', 'thursday', 'friday'],
  5: ['monday', 'tuesday', 'wednesday', 'friday', 'saturday'],
  6: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
}

function numberErrors(draft: Draft): Partial<Record<NumberField, string>> {
  const errors: Partial<Record<NumberField, string>> = {}
  for (const field of Object.keys(RANGES) as NumberField[]) {
    const [min, max, message] = RANGES[field]
    const value = Number(draft[field])
    if (draft[field].trim() === '' || !Number.isFinite(value) || value < min || value > max) errors[field] = message
  }
  return errors
}

const toAnswers = (draft: Draft): OnboardingAnswers => ({
  gender: draft.gender,
  age: Math.round(Number(draft.age)),
  heightCm: Number(draft.heightCm),
  weightKg: Number(draft.weightKg),
  targetWeightKg: Number(draft.targetWeightKg),
  goal: draft.goal ?? 'general_health',
  experience: draft.experience ?? 'none',
  days: draft.days,
  place: draft.place,
  limits: draft.limits,
})

/** A vertical list of options that behaves like radio buttons. */
function ChoiceList<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T | null; onChange: (value: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md border px-4 py-3 text-left text-sm transition-colors',
            value === option.value ? 'border-accent bg-accent/10 font-semibold' : 'border-line hover:border-fg-subtle',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function StepShell({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="font-sans text-2xl font-bold normal-case tracking-tight">{title}</h1>
        {hint && <p className="text-sm text-fg-muted">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

const entries = <K extends string>(labels: Record<K, string>) => (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }))

export function OnboardingPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { profile, status } = useAppSelector((state) => state.profile)
  const [draft, setDraft] = useSessionState<Draft>(SESSION_KEYS.ONBOARDING_DRAFT, INITIAL_DRAFT)
  const [errors, setErrors] = useState<Partial<Record<NumberField | 'goal' | 'experience', string>>>({})
  const [saving, setSaving] = useState(false)
  const answers = useMemo(() => toAnswers(draft), [draft])
  const picks = useMemo(() => (draft.step === STEPS ? recommendTemplates(PLAN_TEMPLATES, answers) : []), [draft.step, answers])

  if (status === 'succeeded' && !needsOnboarding(profile) && !saving) return <Navigate to="/" replace />

  const set = <K extends keyof Draft>(field: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const next = () => {
    const found =
      draft.step === 1
        ? numberErrors(draft)
        : draft.step === 2 && !draft.goal
          ? { goal: 'Оберіть мету' }
          : draft.step === 3 && !draft.experience
            ? { experience: 'Оберіть досвід' }
            : {}
    setErrors(found)
    if (Object.keys(found).length === 0) setDraft((d) => ({ ...d, step: Math.min(STEPS, d.step + 1) }))
  }

  const finish = async (template: PlanTemplate | null) => {
    setSaving(true)
    const now = new Date()
    await Promise.all([
      dispatch(addBodyEntry({ date: now.toISOString(), weightKg: answers.weightKg })),
      dispatch(setWeeklyGoal(answers.days)),
      dispatch(setMyEquipment(equipmentFor(answers.place))),
      dispatch(setMyLimits(answers.limits)),
    ])
    if (template) {
      const days = templateDays(template).length === answers.days ? WEEKDAYS[answers.days] : undefined
      const plan = planFromTemplate(template, { days, now })
      await dispatch(savePlanAsync(plan))
      await dispatch(setActivePlanAsync(plan.id))
    }
    // The profile goes last: once it is saved, the questionnaire counts as done
    await dispatch(updateProfileAsync(profileFromAnswers(profile, answers, now)))
    removeFromSession(SESSION_KEYS.ONBOARDING_DRAFT)
    navigate(template ? '/' : '/plans', { replace: true })
  }

  const numberInput = (field: NumberField, label: string, placeholder: string) => (
    <Input
      label={label}
      type="number"
      inputMode="decimal"
      placeholder={placeholder}
      value={draft[field]}
      onChange={(e) => set(field, e.target.value)}
      error={errors[field]}
    />
  )

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-4 py-8">
      <SEO {...PAGE_META.onboarding} />
      <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
        Крок {draft.step} з {STEPS}
      </p>

      {draft.step === 1 && (
        <StepShell title="Розкажіть про себе" hint="Від цього залежать ІМТ, норма калорій і поради ваги в тренуванні">
          <SegmentedControl
            label="Стать"
            value={draft.gender}
            onChange={(value) => set('gender', value)}
            options={[
              { value: 'male', label: 'Чоловіча' },
              { value: 'female', label: 'Жіноча' },
              { value: 'other', label: 'Інша' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            {numberInput('age', 'Вік', '25')}
            {numberInput('heightCm', 'Зріст, см', '175')}
            {numberInput('weightKg', 'Вага, кг', '70')}
            {numberInput('targetWeightKg', 'Бажана вага, кг', '68')}
          </div>
        </StepShell>
      )}

      {draft.step === 2 && (
        <StepShell title="Яка ваша мета?">
          <ChoiceList label="Мета" options={entries(FITNESS_GOAL_LABELS)} value={draft.goal} onChange={(value) => set('goal', value)} />
          {errors.goal && <p className="text-sm text-danger">{errors.goal}</p>}
        </StepShell>
      )}

      {draft.step === 3 && (
        <StepShell title="Досвід і графік" hint="Скільки днів на тиждень — стільки й буде ваша ціль тижня">
          <ChoiceList label="Досвід" options={entries(EXPERIENCE_LABELS)} value={draft.experience} onChange={(value) => set('experience', value)} />
          {errors.experience && <p className="text-sm text-danger">{errors.experience}</p>}
          <SegmentedControl
            label="Днів на тиждень"
            value={String(draft.days)}
            onChange={(value) => set('days', Number(value))}
            options={['2', '3', '4', '5', '6'].map((value) => ({ value, label: value }))}
          />
        </StepShell>
      )}

      {draft.step === 4 && (
        <StepShell title="Де тренуєтесь" hint="Вправи підберемо під обладнання і не навантажимо те, що болить">
          <ChoiceList label="Де" options={entries(PLACE_LABELS)} value={draft.place} onChange={(value) => set('place', value)} />
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm font-semibold">Що варто берегти</legend>
            {entries(JOINT_LABELS).map(({ value, label }) => (
              <Checkbox
                key={value}
                label={label}
                checked={draft.limits.includes(value)}
                onChange={(e) => set('limits', e.target.checked ? [...draft.limits, value] : draft.limits.filter((j) => j !== value))}
              />
            ))}
          </fieldset>
        </StepShell>
      )}

      {draft.step === 5 && (
        <StepShell title="Ваша перша програма" hint="Підібрали під вашу мету, досвід і графік. Її можна змінити будь-коли">
          <div className="grid gap-3">
            {picks.map((template) => (
              <Card key={template.id} className="space-y-2 p-4">
                <p className="font-semibold">{template.name}</p>
                <p className="text-sm text-fg-muted">
                  {PLAN_GOAL_LABELS[template.goal]} · {templateDays(template).length} дн. на тиждень · ≈ {template.minutes} хв
                </p>
                <Button size="sm" isLoading={saving} onClick={() => finish(template)} aria-label={`Обрати ${template.name}`}>
                  Обрати
                </Button>
              </Card>
            ))}
          </div>
          <Button variant="ghost" disabled={saving} onClick={() => finish(null)}>
            Складу програму сам
          </Button>
        </StepShell>
      )}

      <div className="mt-auto flex gap-3">
        {draft.step > 1 && (
          <Button variant="outline" disabled={saving} onClick={() => setDraft((d) => ({ ...d, step: d.step - 1 }))}>
            Назад
          </Button>
        )}
        {draft.step < STEPS && (
          <Button className="flex-1" onClick={next}>
            Далі
          </Button>
        )}
      </div>
    </main>
  )
}
