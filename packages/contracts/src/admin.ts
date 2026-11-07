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
  /** Country of the most recent sign-in, ISO code */
  country: z.string().nullable().optional(),
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
  minutes7d: z.number().int(),
  minutes30d: z.number().int(),
  /** Minutes per day for the last 30 days, oldest first */
  activity: z.array(z.object({ day: z.string(), minutes: z.number().int() })),
  sessions: z.array(z.lazy(() => userSessionSchema)),
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

// --- Analytics ------------------------------------------------------------------------------

export const analyticsQuerySchema = z.object({ days: z.coerce.number().int().pipe(z.union([z.literal(7), z.literal(30), z.literal(90)])).default(30) })

const periodTotalsSchema = z.object({
  signups: z.number().int(),
  activeUsers: z.number().int(),
  workouts: z.number().int(),
  minutesPerActive: z.number(),
})

export const analyticsOverviewSchema = z.object({
  days: z.number().int(),
  series: z.array(z.object({ day: z.string(), signups: z.number().int(), active: z.number().int(), workouts: z.number().int(), minutes: z.number().int() })),
  current: periodTotalsSchema,
  previous: periodTotalsSchema,
  /** Share of users who signed up 8–14 days ago and were active in the last 7 days, 0–1; null without such users */
  retention: z.number().nullable(),
})

const countsSchema = z.array(z.object({ name: z.string(), count: z.number().int() }))

export const analyticsDevicesSchema = z.object({ deviceTypes: countsSchema, os: countsSchema, browsers: countsSchema, appModes: countsSchema })

export const analyticsGeoSchema = z.object({
  countries: countsSchema,
  cities: z.array(z.object({ name: z.string(), country: z.string(), count: z.number().int() })),
})

export const userSessionSchema = z.object({
  id: z.string().uuid(),
  deviceType: z.string().nullable(),
  os: z.string().nullable(),
  browser: z.string().nullable(),
  appMode: z.string().nullable(),
  country: z.string().nullable(),
  city: z.string().nullable(),
  ipPrefix: z.string().nullable(),
  createdAt: z.string(),
  lastSeenAt: z.string().nullable(),
  active: z.boolean(),
})

export type AnalyticsOverview = z.infer<typeof analyticsOverviewSchema>
export type AnalyticsDevices = z.infer<typeof analyticsDevicesSchema>
export type AnalyticsGeo = z.infer<typeof analyticsGeoSchema>
export type UserSession = z.infer<typeof userSessionSchema>
