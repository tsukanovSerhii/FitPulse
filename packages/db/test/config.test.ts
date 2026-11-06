import { afterEach, describe, expect, it, vi } from 'vitest'

const saved = { ...process.env }

async function loadConfig(env: Record<string, string | undefined>) {
  process.env = { ...saved, ...env }
  vi.resetModules()
  const { default: config } = await import('../prisma.config.ts')
  return config
}

afterEach(() => {
  process.env = { ...saved }
})

describe('prisma.config', () => {
  it('migrations use DIRECT_DATABASE_URL when set', async () => {
    const config = await loadConfig({
      DATABASE_URL: 'postgresql://u:p@ep-x-pooler.neon.tech/db',
      DIRECT_DATABASE_URL: 'postgresql://u:p@ep-x.neon.tech/db',
    })
    expect(config.datasource?.url).toBe('postgresql://u:p@ep-x.neon.tech/db')
  })

  it('ignores an empty DIRECT_DATABASE_URL left blank in the dashboard', async () => {
    const config = await loadConfig({ DATABASE_URL: 'postgresql://u:p@db:5432/fitpulse', DIRECT_DATABASE_URL: '' })
    expect(config.datasource?.url).toBe('postgresql://u:p@db:5432/fitpulse')
  })

  it('falls back to DATABASE_URL', async () => {
    const config = await loadConfig({ DATABASE_URL: 'postgresql://u:p@db:5432/fitpulse', DIRECT_DATABASE_URL: undefined })
    expect(config.datasource?.url).toBe('postgresql://u:p@db:5432/fitpulse')
  })
})
