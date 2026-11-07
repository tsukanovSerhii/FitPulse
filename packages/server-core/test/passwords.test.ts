import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from '../src/index.js'

describe('passwords', () => {
  it('verifyPassword accepts the right password and rejects others', async () => {
    const hash = await hashPassword('correct horse')
    expect(hash.startsWith('$argon2id$')).toBe(true)
    expect(await verifyPassword(hash, 'correct horse')).toBe(true)
    expect(await verifyPassword(hash, 'wrong horse')).toBe(false)
  })

  it('verifyPassword returns false for a malformed hash', async () => {
    expect(await verifyPassword('not-a-hash', 'anything')).toBe(false)
  })
})

describe('password hashing under load', () => {
  it('uses explicit argon2id costs', async () => {
    expect(await hashPassword('x-password')).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/)
  })

  it('a flood of hashes is refused instead of exhausting memory', async () => {
    const results = await Promise.allSettled(Array.from({ length: 40 }, (_, i) => hashPassword(`password-${i}`)))
    const refused = results.filter((r) => r.status === 'rejected')
    expect(refused.length).toBeGreaterThan(0)
    expect((refused[0] as PromiseRejectedResult).reason).toMatchObject({ statusCode: 503, code: 'SERVICE_UNAVAILABLE' })
    // Later calls work again once the queue drains
    await expect(hashPassword('after')).resolves.toMatch(/^\$argon2id/)
  })
})
