import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS, type Exercise, type MuscleGroup } from '@/features/exercises/model'
import { ALL_DAYS, DAY_LABELS, type PlanTemplate } from '@/features/workoutPlan/model'
import { absoluteUrl, fullTitle } from '@/shared/seo/meta'

/*
 * One source for the public catalog: URLs, titles and descriptions used by the pages at runtime and
 * by the build step that writes a static HTML copy of each page for search engines.
 */

export const exerciseSlug = (id: string) => id.replace(/^ex-/, '')
export const programSlug = (id: string) => id.replace(/^tpl-/, '')
export const exercisePath = (id: string) => `/exercise/${exerciseSlug(id)}`
export const programPath = (id: string) => `/program/${programSlug(id)}`
export const CATALOG_PATH = '/catalog'

/** Muscle sections of the catalog, in the order a gym-goer thinks of them. */
export const CATALOG_SECTIONS: { title: string; muscles: MuscleGroup[] }[] = [
  { title: 'Груди', muscles: ['chest'] },
  { title: 'Спина', muscles: ['back'] },
  { title: 'Ноги й сідниці', muscles: ['legs', 'glutes', 'calves'] },
  { title: 'Плечі', muscles: ['shoulders'] },
  { title: 'Руки', muscles: ['biceps', 'triceps'] },
  { title: 'Прес і кор', muscles: ['abs'] },
  { title: 'Кардіо', muscles: ['cardio'] },
]

const fits = (title: string) => fullTitle(title).length <= 60
const firstFitting = (candidates: string[], min: number, max: number) =>
  candidates.find((c) => c.length >= min && c.length <= max) ?? candidates[candidates.length - 1].slice(0, max)

/** "Жим штанги лежачи: техніка виконання", shortened to fit the 60 characters search engines show. */
export function exerciseTitle(e: Pick<Exercise, 'name'>): string {
  return [`${e.name}: техніка виконання`, `${e.name}: техніка`, e.name].find(fits) ?? e.name
}

export function exerciseDescription(e: Pick<Exercise, 'description' | 'primaryMuscle' | 'equipment'>): string {
  const muscle = MUSCLE_GROUP_LABELS[e.primaryMuscle].toLowerCase()
  return firstFitting(
    [
      `${e.description} Техніка по кроках, типові помилки й заміна.`,
      `${e.description} Техніка по кроках і типові помилки.`,
      e.description,
      `${e.description} Вправа на ${muscle}: ${EQUIPMENT_LABELS[e.equipment].toLowerCase()}, техніка по кроках і типові помилки.`,
    ],
    70,
    160,
  )
}

export const programDays = (t: PlanTemplate) => ALL_DAYS.filter((day) => (t.schedule[day]?.length ?? 0) > 0)

export function programTitle(t: Pick<PlanTemplate, 'name'>): string {
  return [`${t.name}: програма тренувань`, `${t.name}: програма`, t.name].find(fits) ?? t.name
}

export function programDescription(t: PlanTemplate): string {
  const sentences = t.description.split(/(?<=\.)\s+/)
  return firstFitting([t.description, sentences[0], `${sentences[0]} Розклад на тиждень, вправи й підходи для кожного дня.`], 70, 160)
}

export const CATALOG_META = {
  title: 'Каталог вправ і програм тренувань для залу',
  description: 'Понад сто вправ з технікою виконання та готові програми тренувань на 2–6 днів: груди, спина, ноги, плечі, руки, прес і кардіо.',
}

/* ---------- Structured data ---------- */

export function exerciseJsonLd(e: Exercise) {
  const steps = e.technique?.steps ?? []
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `${e.name}: техніка виконання`,
      description: e.description,
      ...(e.frames && { image: absoluteUrl(e.frames[0]) }),
      step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text })),
    },
    breadcrumbs([
      ['Каталог', CATALOG_PATH],
      [e.name, exercisePath(e.id)],
    ]),
  ]
}

export function programJsonLd(t: PlanTemplate) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ExercisePlan',
      name: t.name,
      description: t.description,
      activityFrequency: `${programDays(t).length} тренувань на тиждень`,
      activityDuration: `PT${t.minutes}M`,
    },
    breadcrumbs([
      ['Каталог', CATALOG_PATH],
      [t.name, programPath(t.id)],
    ]),
  ]
}

function breadcrumbs(items: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absoluteUrl(path) })),
  }
}

/* ---------- Static HTML for crawlers; React replaces it once the app starts ---------- */

const esc = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const list = (items: string[], ordered = false) => `<${ordered ? 'ol' : 'ul'}>${items.map((i) => `<li>${i}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`
const link = (href: string, text: string) => `<a href="${href}">${esc(text)}</a>`
const page = (body: string) => `<main class="mx-auto max-w-3xl space-y-4 px-5 py-10">${body}<p>${link('/register', 'Почати тренування у FitPulse безкоштовно')}</p></main>`

export function exerciseHtml(e: Exercise, related: Exercise[]): string {
  const t = e.technique
  return page(
    [
      `<nav>${link(CATALOG_PATH, 'Каталог вправ')} › ${esc(MUSCLE_GROUP_LABELS[e.primaryMuscle])}</nav>`,
      `<h1>${esc(e.name)}</h1>`,
      `<p>${esc([DIFFICULTY_LABELS[e.difficulty], EQUIPMENT_LABELS[e.equipment], `${e.defaultSets} × ${e.defaultReps}`].join(' · '))}</p>`,
      `<p>${esc(e.description)}</p>`,
      t ? `<h2>Техніка виконання</h2>${list(t.steps.map((s) => `<strong>${esc(s.title)}.</strong> ${esc(s.text)}`), true)}` : '',
      t?.cues.length ? `<h2>Ключові моменти</h2>${list(t.cues.map(esc))}` : '',
      t?.mistakes.length ? `<h2>Типові помилки</h2>${list(t.mistakes.map(esc))}` : '',
      related.length ? `<h2>Схожі вправи</h2>${list(related.map((r) => link(exercisePath(r.id), r.name)))}` : '',
    ].join(''),
  )
}

export function programHtml(t: PlanTemplate, names: Map<string, string>): string {
  return page(
    [
      `<nav>${link(CATALOG_PATH, 'Каталог програм')}</nav>`,
      `<h1>${esc(t.name)}</h1>`,
      `<p>${esc(t.description)}</p>`,
      ...programDays(t).map(
        (day) =>
          `<h2>${esc(DAY_LABELS[day])}</h2>${list(
            t.schedule[day]!.map((e) => `${link(exercisePath(e.exerciseId), names.get(e.exerciseId) ?? 'Вправа')} — ${e.sets} × ${e.reps}`),
          )}`,
      ),
    ].join(''),
  )
}

export function catalogHtml(exercises: Exercise[], templates: PlanTemplate[]): string {
  return page(
    [
      `<h1>${esc(CATALOG_META.title)}</h1>`,
      `<p>${esc(CATALOG_META.description)}</p>`,
      ...CATALOG_SECTIONS.map(
        (section) =>
          `<h2>${esc(section.title)}</h2>${list(exercises.filter((e) => section.muscles.includes(e.primaryMuscle)).map((e) => link(exercisePath(e.id), e.name)))}`,
      ),
      `<h2>Програми тренувань</h2>${list(templates.map((t) => link(programPath(t.id), t.name)))}`,
    ].join(''),
  )
}
