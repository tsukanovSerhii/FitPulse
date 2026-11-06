import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { Prisma } from '../src/index.js'
import { createTestClient, truncateAll } from './helpers.js'

const prisma = createTestClient()
const inAMonth = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

beforeEach(() => truncateAll(prisma))
afterAll(() => prisma.$disconnect())

describe('schema', () => {
  it('migrations apply to an empty database', async () => {
    const extensions = await prisma.$queryRaw<{ extname: string }[]>`SELECT extname FROM pg_extension`
    expect(extensions.map((row) => row.extname)).toContain('citext')
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    expect(tables.map((row) => row.tablename)).toEqual(
      expect.arrayContaining(['users', 'sessions', 'admin_users', 'admin_sessions']),
    )
  })

  it('email is unique ignoring case', async () => {
    await prisma.user.create({ data: { email: 'Ann@x.com', passwordHash: 'hash' } })
    const duplicate = prisma.user.create({ data: { email: 'ann@x.com', passwordHash: 'hash' } })
    await expect(duplicate).rejects.toSatisfy(
      (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002',
    )
  })

  it('deleting a user deletes its sessions', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'bob@x.com',
        passwordHash: 'hash',
        sessions: {
          create: [
            { refreshTokenHash: 'a', expiresAt: inAMonth() },
            { refreshTokenHash: 'b', expiresAt: inAMonth() },
          ],
        },
      },
    })
    await prisma.user.delete({ where: { id: user.id } })
    expect(await prisma.session.count()).toBe(0)
  })
})
