import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { seedAdmin } from '../src/index.js'
import { createTestClient, truncateAll } from './helpers.js'

const prisma = createTestClient()

beforeEach(() => truncateAll(prisma))
afterAll(() => prisma.$disconnect())

describe('seedAdmin', () => {
  it('seedAdmin creates the admin once', async () => {
    const input = { email: 'admin@fitpulse.app', password: 'correct horse battery staple' }

    expect(await seedAdmin(prisma, input)).toEqual({ created: true })
    const admin = await prisma.adminUser.findUniqueOrThrow({ where: { email: input.email } })
    expect(admin.role).toBe('ADMIN')
    expect(admin.passwordHash.startsWith('$argon2id$')).toBe(true)
    expect(admin.passwordHash).not.toBe(input.password)

    expect(await seedAdmin(prisma, input)).toEqual({ created: false })
    expect(await prisma.adminUser.count()).toBe(1)
  })
})
