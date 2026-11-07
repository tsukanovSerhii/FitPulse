import type { User as UserDto } from '@fitpulse/contracts'
import type { PrismaClient, SessionRecord, SessionRepo, User } from '../deps.js'

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan === 'PRO' ? 'pro' : 'free',
    createdAt: user.createdAt.toISOString(),
  }
}

export function createUserSessionRepo(prisma: PrismaClient): SessionRepo {
  const select = {
    id: true,
    userId: true,
    refreshTokenHash: true,
    expiresAt: true,
    revokedAt: true,
    remember: true,
    previousTokenHash: true,
    rotatedAt: true,
  } as const
  const toRecord = ({ userId, ...rest }: Omit<SessionRecord, 'accountId'> & { userId: string }): SessionRecord => ({
    ...rest,
    accountId: userId,
  })

  return {
    async create({ accountId, ...data }) {
      return prisma.session.create({ data: { ...data, userId: accountId }, select: { id: true } })
    },
    async findByTokenHash(hash) {
      const row = await prisma.session.findUnique({ where: { refreshTokenHash: hash }, select })
      return row && toRecord(row)
    },
    async findByPreviousHash(hash) {
      const row = await prisma.session.findFirst({ where: { previousTokenHash: hash }, select })
      return row && toRecord(row)
    },
    async rotate(id, expectedHash, data) {
      // Only the request that still holds the current token may replace it
      const { count } = await prisma.session.updateMany({ where: { id, refreshTokenHash: expectedHash }, data })
      return count === 1
    },
    async revoke(id) {
      await prisma.session.update({ where: { id }, data: { revokedAt: new Date() } })
    },
    async revokeAllForAccount(accountId) {
      const active = await prisma.session.findMany({ where: { userId: accountId, revokedAt: null }, select: { id: true } })
      await prisma.session.updateMany({ where: { userId: accountId, revokedAt: null }, data: { revokedAt: new Date() } })
      return active.map((row) => row.id)
    },
  }
}
