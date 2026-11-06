import { defineConfig } from 'prisma/config'

// URLs are optional so `prisma generate` works in image builds without a database.
// Migrations need a direct connection (advisory locks): with Neon, DATABASE_URL may be the
// -pooler address for the app and DIRECT_DATABASE_URL the direct one for the CLI.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
})
