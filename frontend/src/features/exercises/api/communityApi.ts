import type { CommunityCatalogItem, CommunityExercise, ExerciseSubmission } from '@fitpulse/contracts'
import { apiRequest } from '@/shared/api/http'
import type { Exercise } from '../model/types'

/** Only the fields the server accepts: a custom exercise also carries legacy fields and photos. */
export function toSubmission(exercise: Omit<Exercise, 'id'>): CommunityExercise {
  const { name, primaryMuscle, muscleGroups, difficulty, equipment, description, defaultSets, defaultReps, defaultRestSeconds, technique } = exercise
  return {
    name,
    primaryMuscle,
    muscleGroups,
    difficulty,
    equipment,
    description,
    defaultSets,
    defaultReps,
    defaultRestSeconds,
    ...(technique && {
      technique: {
        steps: technique.steps.map(({ title, text }) => ({ title, text, frame: 0 as const, seconds: 0 as const })),
        cues: technique.cues,
        mistakes: technique.mistakes,
      },
    }),
  }
}

/** Exercises users share: approved ones for the catalog, and the signed-in user's own requests. */
export const communityApi = {
  async list(): Promise<Exercise[]> {
    const { items } = await apiRequest<{ items: CommunityCatalogItem[] }>('/api/exercises/community', { auth: true })
    return items
  },

  submit(exercise: Omit<Exercise, 'id'>): Promise<ExerciseSubmission> {
    return apiRequest<ExerciseSubmission>('/api/exercises/submissions', { method: 'POST', body: { exercise: toSubmission(exercise) }, auth: true })
  },

  async mine(): Promise<ExerciseSubmission[]> {
    return (await apiRequest<{ items: ExerciseSubmission[] }>('/api/exercises/submissions', { auth: true })).items
  },
}
