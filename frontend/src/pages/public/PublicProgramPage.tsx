import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { BUILT_IN_EXERCISES } from '@/features/exercises/catalog'
import { PLAN_TEMPLATES } from '@/features/workoutPlan/catalog'
import { DAY_LABELS, PLAN_GOAL_LABELS, PLAN_LEVEL_LABELS } from '@/features/workoutPlan/model'
import { SEO } from '@/shared/seo/SEO'
import { plural } from '@/shared/lib/formatters'
import { Badge, Section } from '@/shared/ui'
import { CATALOG_PATH, exercisePath, programDays, programDescription, programJsonLd, programSlug, programTitle } from './content'
import { PublicLayout, StartCta } from './PublicLayout'
import { PublicNotFound } from './PublicNotFound'

const names = new Map(BUILT_IN_EXERCISES.map((e) => [e.id, e.name]))

export function PublicProgramPage() {
  const { slug = '' } = useParams()
  const template = PLAN_TEMPLATES.find((t) => programSlug(t.id) === slug)
  const jsonLd = useMemo(() => template && programJsonLd(template), [template])

  if (!template) return <PublicNotFound what="Такої програми в каталозі немає." />
  const days = programDays(template)

  return (
    <PublicLayout crumbs={[{ label: 'Каталог', to: CATALOG_PATH }, { label: 'Програми', to: `${CATALOG_PATH}#programs` }, { label: template.name }]}>
      <SEO title={programTitle(template)} description={programDescription(template)} jsonLd={jsonLd} />
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Програма тренувань</p>
          <h1 className="text-4xl leading-[1.08] text-fg sm:text-5xl">{template.name}</h1>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge size="sm">{PLAN_LEVEL_LABELS[template.level]}</Badge>
            <Badge size="sm">{PLAN_GOAL_LABELS[template.goal]}</Badge>
            <span className="text-xs text-fg-subtle">{plural(days.length, ['день', 'дні', 'днів'])} на тиждень</span>
            <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
              <Clock className="size-3.5" aria-hidden="true" />~{template.minutes} хв
            </span>
          </div>
          <p className="text-lg text-fg-muted">{template.description}</p>
        </header>

        {days.map((day, i) => (
          <Section key={day} title={`Тренування ${i + 1} · ${DAY_LABELS[day]}`}>
            <ol className="divide-y divide-line rounded-lg border border-line bg-surface">
              {template.schedule[day]!.map((exercise, j) => (
                <li key={j} className="flex items-baseline justify-between gap-3 px-4 py-3">
                  <Link to={exercisePath(exercise.exerciseId)} className="min-w-0 text-sm font-medium text-fg hover:text-accent">
                    {names.get(exercise.exerciseId) ?? 'Вправа'}
                  </Link>
                  <span className="shrink-0 font-mono text-xs text-fg-muted tabular">
                    {exercise.sets} × {exercise.reps} · {exercise.restSeconds} с
                  </span>
                </li>
              ))}
            </ol>
          </Section>
        ))}

        <StartCta title="Тренуйтеся за цією програмою" text="Додайте її до своїх, оберіть дні тижня, і FitPulse проведе кожне тренування: підходи, вага, таймер відпочинку." />
      </article>
    </PublicLayout>
  )
}
