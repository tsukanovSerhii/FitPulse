import { describe, expect, it } from 'vitest'
import { ConfigError, baseEnvSchema, parseConfig } from '../src/index.js'

const minimal = {
  DATABASE_URL: 'postgresql://fitpulse:fitpulse@localhost:5432/fitpulse',
  REDIS_URL: 'redis://localhost:6379',
}

describe('parseConfig', () => {
  it('parses defaults', () => {
    const config = parseConfig(baseEnvSchema, minimal)
    expect(config.HOST).toBe('0.0.0.0')
    expect(config.LOG_LEVEL).toBe('info')
    expect(config.NODE_ENV).toBe('development')
  })

  it('accepts rediss urls', () => {
    const config = parseConfig(baseEnvSchema, { ...minimal, REDIS_URL: 'rediss://default:pw@host:6380' })
    expect(config.REDIS_URL).toBe('rediss://default:pw@host:6380')
  })

  it('lists every missing variable', () => {
    expect(() => parseConfig(baseEnvSchema, {})).toThrow(ConfigError)
    try {
      parseConfig(baseEnvSchema, {})
    } catch (error) {
      expect((error as Error).message).toContain('DATABASE_URL')
      expect((error as Error).message).toContain('REDIS_URL')
    }
  })

  it('coerces PORT', () => {
    expect(parseConfig(baseEnvSchema, { ...minimal, PORT: '8080' }).PORT).toBe(8080)
  })
})
