import { alternativesFor, variantsOf } from '@/features/exercises/model'
import { BUILT_IN_EXERCISES } from '@/features/exercises/catalog'
import { PLAN_TEMPLATES } from '@/features/workoutPlan/catalog'
import {
  CATALOG_META,
  CATALOG_PATH,
  catalogHtml,
  exerciseDescription,
  exerciseHtml,
  exerciseJsonLd,
  exercisePath,
  exerciseTitle,
  programDescription,
  programHtml,
  programJsonLd,
  programPath,
  programTitle,
} from './content'

export interface PrerenderedPage {
  path: string
  title: string
  description: string
  body: string
  jsonLd?: unknown
}

/** Every public catalog page; the build writes each one as static HTML and lists it in the sitemap. */
export function publicPages(): PrerenderedPage[] {
  const names = new Map(BUILT_IN_EXERCISES.map((e) => [e.id, e.name]))
  return [
    { path: CATALOG_PATH, ...CATALOG_META, body: catalogHtml(BUILT_IN_EXERCISES, PLAN_TEMPLATES) },
    ...BUILT_IN_EXERCISES.map((e) => {
      const related = [...variantsOf(e, BUILT_IN_EXERCISES).filter((v) => v.id !== e.id), ...alternativesFor(e, BUILT_IN_EXERCISES)]
      return {
        path: exercisePath(e.id),
        title: exerciseTitle(e),
        description: exerciseDescription(e),
        body: exerciseHtml(e, related),
        jsonLd: exerciseJsonLd(e),
      }
    }),
    ...PLAN_TEMPLATES.map((t) => ({
      path: programPath(t.id),
      title: programTitle(t),
      description: programDescription(t),
      body: programHtml(t, names),
      jsonLd: programJsonLd(t),
    })),
  ]
}
