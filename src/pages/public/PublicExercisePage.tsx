import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { MuscleMap, PointList, TechniquePlayer, alternativesFor, variantsOf, type Exercise } from '@/features/exercises'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/features/exercises/model'
import { BUILT_IN_EXERCISES } from '@/features/exercises/catalog'
import { SEO } from '@/shared/seo/SEO'
import { Section } from '@/shared/ui'
import { CATALOG_PATH, exerciseDescription, exerciseJsonLd, exercisePath, exerciseSlug, exerciseTitle } from './content'
import { PublicLayout, StartCta } from './PublicLayout'
import { PublicNotFound } from './PublicNotFound'

function ExerciseLinks({ items, label }: { items: Exercise[]; label: (e: Exercise) => string }) {
  return (
    <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
      {items.map((item) => (
        <li key={item.id}>
          <Link to={exercisePath(item.id)} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-fg">{item.name}</span>
              <span className="block text-xs text-fg-subtle">{label(item)}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function PublicExercisePage() {
  const { slug = '' } = useParams()
  const exercise = BUILT_IN_EXERCISES.find((e) => exerciseSlug(e.id) === slug)
  const variants = useMemo(() => (exercise ? variantsOf(exercise, BUILT_IN_EXERCISES).filter((v) => v.id !== exercise.id) : []), [exercise])
  const alternatives = useMemo(() => (exercise ? alternativesFor(exercise, BUILT_IN_EXERCISES) : []), [exercise])
  const jsonLd = useMemo(() => exercise && exerciseJsonLd(exercise), [exercise])

  if (!exercise) return <PublicNotFound what="Такої вправи в каталозі немає." />
  const muscle = MUSCLE_GROUP_LABELS[exercise.primaryMuscle]
  const technique = exercise.technique

  return (
    <PublicLayout crumbs={[{ label: 'Каталог', to: CATALOG_PATH }, { label: muscle, to: `${CATALOG_PATH}#${exercise.primaryMuscle}` }, { label: exercise.name }]}>
      <SEO title={exerciseTitle(exercise)} description={exerciseDescription(exercise)} image={exercise.frames?.[0]} jsonLd={jsonLd} />
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{muscle}</p>
          <h1 className="text-4xl leading-[1.08] text-fg sm:text-5xl">{exercise.name}</h1>
          <p className="text-sm text-fg-subtle">
            {[DIFFICULTY_LABELS[exercise.difficulty], EQUIPMENT_LABELS[exercise.equipment], `${exercise.defaultSets} × ${exercise.defaultReps}`, `відпочинок ${exercise.defaultRestSeconds} с`].join(' · ')}
          </p>
          <p className="text-lg text-fg-muted">{exercise.description}</p>
        </header>

        <TechniquePlayer exercise={exercise} />

        {technique && (
          <div className="grid gap-6 sm:grid-cols-2">
            <PointList title="Ключові моменти" items={technique.cues} tone="do" />
            <PointList title="Типові помилки" items={technique.mistakes} tone="avoid" />
          </div>
        )}

        <Section title="Задіяні м’язи">
          <MuscleMap primaryMuscle={exercise.primaryMuscle} muscleGroups={exercise.muscleGroups} />
        </Section>

        {technique?.advanced && technique.advanced.length > 0 && (
          <Section title="Для досвідчених">
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg-muted marker:text-fg-subtle">
              {technique.advanced.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </Section>
        )}

        {variants.length > 0 && (
          <Section title={`Інші варіанти: ${exercise.variant!.groupName.toLowerCase()}`}>
            <ExerciseLinks items={variants} label={(v) => v.variant!.label} />
          </Section>
        )}

        {alternatives.length > 0 && (
          <Section title="Схожі вправи">
            <ExerciseLinks items={alternatives} label={(a) => `${EQUIPMENT_LABELS[a.equipment]} · ${DIFFICULTY_LABELS[a.difficulty]}`} />
          </Section>
        )}

        <StartCta title="Записуйте кожен підхід" text="FitPulse підкаже вагу на сьогодні, запустить таймер відпочинку й збереже прогрес у цій вправі." />
      </article>
    </PublicLayout>
  )
}
