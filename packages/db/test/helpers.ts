import { createPrismaClient, type PrismaClient } from '../src/index.js'

export function testDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL must point at the test database (fitpulse_test) for integration tests')
  return url
}

export function createTestClient(): PrismaClient {
  return createPrismaClient(testDatabaseUrl())
}

export async function truncateAll(prisma: PrismaClient) {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "admin_audit_log", "sync_records", "password_reset_tokens", "sessions", "users", "admin_sessions", "admin_users" CASCADE')
}
