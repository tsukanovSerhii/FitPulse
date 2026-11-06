import { describe, expect, it } from 'vitest'
import {
  ErrorCode,
  loginRequestSchema,
  nameSchema,
  passwordSchema,
  registerRequestSchema,
  updateMeRequestSchema,
} from '../src/index.js'

describe('auth contracts', () => {
  it('email is trimmed and lowercased', () => {
    const data = registerRequestSchema.parse({ name: 'Ira', email: ' Ira@Mail.COM ', password: 'secret123', remember: true })
    expect(data.email).toBe('ira@mail.com')
  })

  it('password shorter than 8 is rejected', () => {
    expect(passwordSchema.safeParse('short1').success).toBe(false)
    expect(passwordSchema.safeParse('secret12').success).toBe(true)
  })

  it('name is trimmed and needs 2 chars', () => {
    expect(nameSchema.parse('  Ira  ')).toBe('Ira')
    expect(nameSchema.safeParse(' I ').success).toBe(false)
  })

  it('login accepts any non-empty password', () => {
    expect(loginRequestSchema.safeParse({ email: 'a@b.ua', password: 'x', remember: false }).success).toBe(true)
    expect(loginRequestSchema.safeParse({ email: 'a@b.ua', password: '', remember: false }).success).toBe(false)
  })

  it('updateMe allows name only', () => {
    expect(updateMeRequestSchema.parse({ name: 'Nova' })).toEqual({ name: 'Nova' })
  })

  it('exposes the auth error codes', () => {
    expect(ErrorCode.EmailTaken).toBe('EMAIL_TAKEN')
    expect(ErrorCode.RefreshRetry).toBe('REFRESH_RETRY')
    expect(ErrorCode.RateLimited).toBe('RATE_LIMITED')
  })
})
