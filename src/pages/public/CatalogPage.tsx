import { Link } from 'react-router-dom'
import { MUSCLE_GROUP_LABELS } from '@/features/exercises/model'
import { BUILT_IN_EXERCISES } from '@/features/exercises/catalog'
import { PLAN_TEMPLATES } from '@/features/workoutPlan/catalog'
import { PLAN_LEVEL_LABELS } from '@/features/workoutPlan/model'
import { SEO } from '@/shared/seo/SEO'
import { plural } from '@/shared/lib/formatters'
import { Section } from '@/shared/ui'
import { CATALOG_META, CATALOG_SECTIONS, exercisePath, programDays, programPath } from './content'
import { PublicLayout, StartCta } from './PublicLayout'

export function CatalogPage() {
  return (
    <PublicLayout>
      <SEO {...CATALOG_META} />
      <div className="space-y-10">
        <header className="max-w-3xl space-y-3">
          <h1 className="text-4xl leading-[1.08] text-fg sm:text-5xl">Вправи й програми тренувань</h1>
          <p className="text-lg text-fg-muted">
            {plural(BUILT_IN_EXERCISES.length, ['вправа', 'вправи', 'вправ'])} з фото-демонстрацією техніки, типовими помилками й заміною та{' '}
            {plural(PLAN_TEMPLATES.length, ['готова програма', 'готові програми', 'готових програм'])} на 2–6 днів.
          </p>
        </header>

        <nav aria-label="Групи м’язів" className="flex flex-wrap gap-2">
          {CATALOG_SECTIONS.map((section) => (
            <a key={section.title} href={`#${section.muscles[0]}`} className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold text-fg-muted hover:text-fg">
              {section.title}
            </a>
          ))}
          <a href="#programs" className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold text-fg-muted hover:text-fg">
            Програми
          </a>
        </nav>

        {CATALOG_SECTIONS.map((section) => {
          const items = BUILT_IN_EXERCISES.filter((e) => section.muscles.includes(e.primaryMuscle))
          return (
            <section key={section.title} id={section.muscles[0]} aria-labelledby={`${section.muscles[0]}-title`} className="scroll-mt-6 space-y-3">
              <h2 id={`${section.muscles[0]}-title`} className="text-2xl text-fg">
                {section.title} <span className="font-mono text-base text-fg-subtle tabular">{items.length}</span>
              </h2>
              <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((exercise) => (
                  <li key={exercise.id}>
                    <Link to={exercisePath(exercise.id)} className="flex items-baseline justify-between gap-3 border-b border-line py-2 text-sm text-fg hover:text-accent">
                      <span className="min-w-0">{exercise.name}</span>
                      {section.muscles.length > 1 && <span className="shrink-0 text-xs text-fg-subtle">{MUSCLE_GROUP_LABELS[exercise.primaryMuscle]}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}

        <Section title="Програми тренувань">
          <ul id="programs" className="grid scroll-mt-6 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PLAN_TEMPLATES.map((template) => (
              <li key={template.id}>
                <Link to={programPath(template.id)} className="block h-full rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong">
                  <span className="block font-semibold text-fg">{template.name}</span>
                  <span className="mt-1 block text-xs text-fg-subtle">
                    {PLAN_LEVEL_LABELS[template.level]} · {plural(programDays(template).length, ['день', 'дні', 'днів'])} · ~{template.minutes} хв
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <StartCta title="Тренуйтеся з FitPulse" text="Безкоштовний трекер для залу: програма на тиждень, підказки ваги, таймер відпочинку й журнал прогресу." />
      </div>
    </PublicLayout>
  )
}
