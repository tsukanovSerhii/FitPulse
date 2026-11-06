import { describe, expect, it } from 'vitest'
import { passwordStrength, validateRegistration } from './validation'

describe('validation', () => {
  it('requires name, email and a password with letters and digits', () => {
    expect(validateRegistration({ name: 'A', email: 'bad', password: 'short' })).toEqual({
      name: expect.any(String),
      email: expect.any(String),
      password: expect.any(String),
    })
    expect(validateRegistration({ name: 'Ira', email: 'ira@mail.com', password: 'onlyletters' }).password).toBeDefined()
    expect(validateRegistration({ name: 'Ira', email: 'ira@mail.com', password: 'secret123' })).toEqual({})
  })

  it('scores password strength', () => {
    expect(passwordStrength('')).toBe(0)
    expect(passwordStrength('secret123')).toBe(2)
    expect(passwordStrength('Secret123!')).toBe(4)
  })
})
