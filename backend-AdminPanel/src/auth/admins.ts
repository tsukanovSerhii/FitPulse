import type { AdminUser as AdminDto } from '@fitpulse/contracts'
import type { AdminUser, PrismaClient } from '@fitpulse/db'
import type { SessionRecord, SessionRepo } from '@fitpulse/server-core'

export function toAdminDto(admin: AdminUser): AdminDto {
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role === 'ADMIN' ? 'admin' : 'manager',
    createdAt: admin.createdAt.toISOString(),
  }
}

export function createAdminSessionRepo(prisma: PrismaClient): SessionRepo {
  const select = {
    id: true,
    adminId: true,
    refreshTokenHash: true,
    expiresAt: true,
    revokedAt: true,
    remember: true,
    previousTokenHash: true,
    rotatedAt: true,
  } as const
  const toRecord = ({ adminId, ...rest }: Omit<SessionRecord, 'accountId'> & { adminId: string }): SessionRecord => ({
    ...rest,
    accountId: adminId,
  })

  return {
    async create({ accountId, ...data }) {
      return prisma.adminSession.create({ data: { ...data, adminId: accountId }, select: { id: true } })
    },
    async findByTokenHash(hash) {
      const row = await prisma.adminSession.findUnique({ where: { refreshTokenHash: hash }, select })
      return row && toRecord(row)
    },
    async findByPreviousHash(hash) {
      const row = await prisma.adminSession.findFirst({ where: { previousTokenHash: hash }, select })
      return row && toRecord(row)
    },
    async rotate(id, expectedHash, data) {
      // Only the request that still holds the current token may replace it
      const { count } = await prisma.adminSession.updateMany({ where: { id, refreshTokenHash: expectedHash }, data })
      return count === 1
    },
    async revoke(id) {
      await prisma.adminSession.update({ where: { id }, data: { revokedAt: new Date() } })
    },
    async revokeAllForAccount(accountId) {
      const active = await prisma.adminSession.findMany({ where: { adminId: accountId, revokedAt: null }, select: { id: true } })
      await prisma.adminSession.updateMany({ where: { adminId: accountId, revokedAt: null }, data: { revokedAt: new Date() } })
      return active.map((row) => row.id)
    },
  }
}
