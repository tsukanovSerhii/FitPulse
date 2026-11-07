import { z } from 'zod'

export const SYNC_LIMITS = { changes: 500, page: 500, recordBytes: 64 * 1024, idLength: 100 } as const

export const syncKindSchema = z.enum(['workout', 'body', 'plan', 'exercise', 'setting'])

export const syncChangeSchema = z.object({
  kind: syncKindSchema,
  id: z.string().min(1).max(SYNC_LIMITS.idLength),
  /** null deletes the record */
  data: z.unknown().nullable(),
  updatedAt: z.string().datetime({ offset: true }),
})

export const syncRequestSchema = z.object({
  /** The last seq the device has received, as a decimal string; "0" before the first sync */
  cursor: z.string().regex(/^\d+$/),
  changes: z.array(syncChangeSchema).max(SYNC_LIMITS.changes),
})

export const syncResponseSchema = z.object({
  applied: z.number().int(),
  cursor: z.string(),
  hasMore: z.boolean(),
  changes: z.array(syncChangeSchema),
})

export type SyncKind = z.infer<typeof syncKindSchema>
export type SyncChange = z.infer<typeof syncChangeSchema>
export type SyncRequest = z.infer<typeof syncRequestSchema>
export type SyncResponse = z.infer<typeof syncResponseSchema>
