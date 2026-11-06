import type { PrismaClient } from './generated/prisma/client.js'

/** Creates the first ADMIN account; does nothing when that email already exists. */
export async function seedAdmin(
  prisma: PrismaClient,
  input: { email: string; password: string },
  hash: (password: string) => Promise<string>,
): Promise<{ created: boolean }> {
  const existing = await prisma.adminUser.findUnique({ where: { email: input.email } })
  if (existing) return { created: false }

  await prisma.adminUser.create({ data: { email: input.email, passwordHash: await hash(input.password), role: 'ADMIN' } })
  return { created: true }
}
