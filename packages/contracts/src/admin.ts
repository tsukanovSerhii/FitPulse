import { z } from 'zod'

export const adminRoleSchema = z.enum(['manager', 'admin'])

export const adminStatsSchema = z.object({
  users: z.number().int(),
  newUsers7d: z.number().int(),
  newUsers30d: z.number().int(),
  activeUsers7d: z.number().int(),
  workouts: z.number().int(),
  workouts7d: z.number().int(),
  proUsers: z.number().int(),
  blockedUsers: z.number().int(),
})

export const userListQuerySchema = z.object({
  query: z.string().trim().max(100).default(''),
  status: z.enum(['all', 'active', 'blocked']).default('all'),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
})

export const adminUserRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  plan: z.enum(['free', 'pro']),
  createdAt: z.string(),
  blockedAt: z.string().nullable(),
})

export const userListSchema = z.object({
  items: z.array(adminUserRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

export const adminUserDetailSchema = adminUserRowSchema.extend({
  workouts: z.number().int(),
  bodyEntries: z.number().int(),
  lastSyncAt: z.string().nullable(),
  activeSessions: z.number().int(),
})

export const updateUserRequestSchema = z.object({ plan: z.enum(['free', 'pro']) })

export const staffMemberSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  role: adminRoleSchema,
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
})

export const createStaffRequestSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Вкажіть коректний email')),
  password: z.string().min(12, 'Щонайменше 12 символів').max(128),
  role: adminRoleSchema,
})

export const updateStaffRequestSchema = z
  .object({ role: adminRoleSchema.optional(), disabled: z.boolean().optional() })
  .refine((body) => body.role !== undefined || body.disabled !== undefined, 'Нічого не змінено')

export const auditEntrySchema = z.object({
  id: z.string().uuid(),
  adminEmail: z.string().nullable(),
  action: z.string(),
  targetId: z.string().nullable(),
  details: z.unknown(),
  createdAt: z.string(),
})

export const auditPageSchema = z.object({ items: z.array(auditEntrySchema), page: z.number().int(), hasMore: z.boolean() })

export type AdminRole = z.infer<typeof adminRoleSchema>
export type AdminStats = z.infer<typeof adminStatsSchema>
export type UserListQuery = z.infer<typeof userListQuerySchema>
export type AdminUserRow = z.infer<typeof adminUserRowSchema>
export type UserList = z.infer<typeof userListSchema>
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>
export type StaffMember = z.infer<typeof staffMemberSchema>
export type AuditEntry = z.infer<typeof auditEntrySchema>
export type AuditPage = z.infer<typeof auditPageSchema>
