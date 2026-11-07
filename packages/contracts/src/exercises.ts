import { z } from 'zod'

// Same keys as the app's MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS and EQUIPMENT_LABELS
export const muscleGroupSchema = z.enum(['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'cardio', 'glutes', 'calves'])
export const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced'])
export const equipmentSchema = z.enum(['barbell', 'ezbar', 'dumbbell', 'kettlebell', 'smith', 'machine', 'cables', 'crossover', 'bodyweight', 'bands'])

const line = (max: number) => z.string().trim().min(1).max(max)

/**
 * An exercise a user wrote, in the app's Exercise shape. Unknown keys are dropped, so nothing but
 * these fields is ever stored or shown to other users.
 */
export const communityExerciseSchema = z.object({
  name: z.string().trim().min(2).max(60),
  primaryMuscle: muscleGroupSchema,
  muscleGroups: z.array(muscleGroupSchema).min(1).max(10),
  difficulty: difficultySchema,
  equipment: equipmentSchema,
  description: z.string().trim().max(300),
  defaultSets: z.number().int().min(1).max(20),
  defaultReps: z.number().int().min(1).max(200),
  defaultRestSeconds: z.number().int().min(10).max(600),
  technique: z
    .object({
      steps: z.array(z.object({ title: line(40), text: line(300), frame: z.literal(0), seconds: z.literal(0) })).max(15),
      cues: z.array(line(200)).max(10),
      mistakes: z.array(line(200)).max(10),
    })
    .optional(),
})

export const submissionStatusSchema = z.enum(['pending', 'approved', 'rejected'])

export const EXERCISE_LIMITS = { submissionsPerDay: 5 } as const

export const submitExerciseRequestSchema = z.object({ exercise: communityExerciseSchema })

/** One of the signed-in user's requests to publish an exercise for everyone. */
export const exerciseSubmissionSchema = z.object({
  id: z.string().uuid(),
  status: submissionStatusSchema,
  rejectReason: z.string().nullable(),
  exercise: communityExerciseSchema,
  createdAt: z.string(),
  reviewedAt: z.string().nullable(),
})

/** An approved exercise as the app's catalog shows it; the id never clashes with built-in or custom ones. */
export const communityCatalogItemSchema = communityExerciseSchema.extend({
  id: z.string().regex(/^community-[0-9a-f-]{36}$/),
  authorName: z.string(),
})

export const communityCatalogSchema = z.object({ items: z.array(communityCatalogItemSchema) })

// --- Admin moderation ---------------------------------------------------------------------------

export const moderationQuerySchema = z.object({
  status: submissionStatusSchema.default('pending'),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
})

export const moderationItemSchema = z.object({
  id: z.string().uuid(),
  status: submissionStatusSchema,
  rejectReason: z.string().nullable(),
  exercise: communityExerciseSchema,
  author: z.object({ id: z.string().uuid(), name: z.string(), email: z.string() }),
  createdAt: z.string(),
  reviewedAt: z.string().nullable(),
})

export const moderationPageSchema = z.object({
  items: z.array(moderationItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

export const rejectExerciseRequestSchema = z.object({ reason: z.string().trim().min(3, 'Щонайменше 3 символи').max(300) })

export type CommunityExercise = z.infer<typeof communityExerciseSchema>
export type ExerciseSubmission = z.infer<typeof exerciseSubmissionSchema>
export type CommunityCatalogItem = z.infer<typeof communityCatalogItemSchema>
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>
export type ModerationItem = z.infer<typeof moderationItemSchema>
export type ModerationPage = z.infer<typeof moderationPageSchema>
