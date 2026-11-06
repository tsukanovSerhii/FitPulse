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
