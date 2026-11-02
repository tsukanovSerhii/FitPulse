import { AlertTriangle, CheckCircle2, Flame, Zap, type LucideIcon } from 'lucide-react'
import { MuscleMap } from '@/components/common/muscle-map/MuscleMap'
import { ExerciseMotionPlayer } from '@/components/common/motion-player/ExerciseMotionPlayer'
import { cn } from '@/utils/cn'
import type { Exercise } from '../../model/types'
import { guideTips } from './guideContent'

export function TechniqueTab({ exercise }: { exercise: Exercise }) {
  return (
    <div className="animate-fade-in space-y-5">
      <ExerciseMotionPlayer exercise={exercise} showTabSwitcher={false} />
      <section className="space-y-3">
        <h3 className="font-sans text-sm font-bold normal-case tracking-normal text-fg">Покрокова інструкція</h3>
        <ol className="space-y-2">
          {(exercise.instructions ?? []).map((step) => (
            <li key={step.step} className="flex items-start gap-3 rounded-md border border-line bg-surface-2 p-3 text-sm text-fg-muted">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-soft font-mono text-xs font-bold text-accent">
                {step.step}
              </span>
              <span className="pt-0.5">{step.description}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

export function AnatomyTab({ exercise }: { exercise: Exercise }) {
  return (
    <div className="animate-fade-in space-y-4">
      <MuscleMap primaryMuscle={exercise.primaryMuscle} muscleGroups={exercise.muscleGroups} />
      {exercise.calories && (
        <p className="flex items-center gap-2 rounded-md border border-warning/20 bg-warning-soft p-3.5 text-sm text-fg-muted">
          <Flame className="size-4 shrink-0 text-warning" aria-hidden="true" />
          Енерговитрати: <strong className="text-fg">~{exercise.calories} ккал/хв</strong>
        </p>
      )}
    </div>
  )
}

const TONES = {
  danger: 'border-danger/30 bg-danger-soft text-danger',
  accent: 'border-accent/30 bg-accent-soft text-accent',
  warning: 'border-warning/30 bg-warning-soft text-warning',
}

function TipList({ title, icon: Icon, tone, items }: { title: string; icon: LucideIcon; tone: keyof typeof TONES; items: string[] }) {
  return (
    <section className={cn('space-y-2.5 rounded-lg border p-4', TONES[tone])}>
      <h3 className="flex items-center gap-2 font-sans text-sm font-bold normal-case tracking-normal">
        <Icon className="size-4" aria-hidden="true" />
        {title}
      </h3>
      <ul className="list-disc space-y-2 pl-5 text-sm text-fg marker:text-current">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export function GuideTab({ exercise }: { exercise: Exercise }) {
  const tips = guideTips(exercise)
  return (
    <div className="animate-fade-in space-y-4">
      <TipList title="Типові помилки" icon={AlertTriangle} tone="danger" items={tips.commonMistakes} />
      <TipList title="Поради новачкам" icon={CheckCircle2} tone="accent" items={tips.beginnerTips} />
      <TipList title="Для досвідчених" icon={Zap} tone="warning" items={tips.proTips} />
    </div>
  )
}
