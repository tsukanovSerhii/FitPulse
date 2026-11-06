import argon2 from 'argon2'
import type { PrismaClient } from './generated/prisma/client.js'

/** Creates the first ADMIN account; does nothing when that email already exists. */
export async function seedAdmin(
  prisma: PrismaClient,
  input: { email: string; password: string },
): Promise<{ created: boolean }> {
  const existing = await prisma.adminUser.findUnique({ where: { email: input.email } })
  if (existing) return { created: false }

  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id })
  await prisma.adminUser.create({ data: { email: input.email, passwordHash, role: 'ADMIN' } })
  return { created: true }
}
