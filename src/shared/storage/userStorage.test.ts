import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryStorage } from '../testing/memoryStorage'
import { STORAGE_KEYS } from './localStorage'
import { SESSION_KEYS } from './sessionStorage'
import { clearUserData, currentUserId, hasUserData, loadUserData, saveUserData } from './userStorage'

const storage = installMemoryStorage()
const signIn = (id: string) => storage.local.set(STORAGE_KEYS.SESSION, JSON.stringify(id))
const signInForTab = (id: string) => storage.session.set(SESSION_KEYS.AUTH_SESSION, JSON.stringify(id))

describe('userStorage', () => {
  beforeEach(() => storage.clear())

  it('reads the signed-in user, preferring the tab session', () => {
    expect(currentUserId()).toBeNull()
    signIn('a')
    expect(currentUserId()).toBe('a')
    signInForTab('b')
    expect(currentUserId()).toBe('b')
  })

  it('keeps each account’s data apart', () => {
    signIn('a')
    saveUserData(STORAGE_KEYS.WORKOUT_HISTORY, ['a-log'])
    signIn('b')
    expect(hasUserData(STORAGE_KEYS.WORKOUT_HISTORY)).toBe(false)
    saveUserData(STORAGE_KEYS.WORKOUT_HISTORY, ['b-log'])
    signIn('a')
    expect(loadUserData(STORAGE_KEYS.WORKOUT_HISTORY, [])).toEqual(['a-log'])
  })

  it('hands data saved before accounts existed to the first account only', () => {
    storage.local.set(STORAGE_KEYS.WORKOUT_PLANS, JSON.stringify(['old-plan']))
    signIn('a')
    expect(loadUserData(STORAGE_KEYS.WORKOUT_PLANS, [])).toEqual(['old-plan'])
    expect(storage.local.has(STORAGE_KEYS.WORKOUT_PLANS)).toBe(false)
    signIn('b')
    expect(loadUserData(STORAGE_KEYS.WORKOUT_PLANS, [])).toEqual([])
  })

  it('clears only the current account', () => {
    signIn('a')
    saveUserData(STORAGE_KEYS.USER_PROFILE, { name: 'A' })
    signIn('b')
    saveUserData(STORAGE_KEYS.USER_PROFILE, { name: 'B' })
    clearUserData()
    expect(hasUserData(STORAGE_KEYS.USER_PROFILE)).toBe(false)
    signIn('a')
    expect(loadUserData(STORAGE_KEYS.USER_PROFILE, null)).toEqual({ name: 'A' })
  })
})
