// Creates the first admin from SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD. Safe to run again.
import { hashPassword } from '@fitpulse/server-core'
import { createPrismaClient } from '../src/client.js'
import { seedAdmin } from '../src/seed-admin.js'

const { DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env

if (!DATABASE_URL || !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
  console.error('Set DATABASE_URL, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to seed the first admin')
  process.exit(1)
}

const prisma = createPrismaClient(DATABASE_URL)
try {
  const { created } = await seedAdmin(prisma, { email: SEED_ADMIN_EMAIL, password: SEED_ADMIN_PASSWORD }, hashPassword)
  console.log(created ? `Admin ${SEED_ADMIN_EMAIL} created` : `Admin ${SEED_ADMIN_EMAIL} already exists`)
} finally {
  await prisma.$disconnect()
}
