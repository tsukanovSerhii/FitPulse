import { expect, test } from '@playwright/test'
import { signUp } from './helpers.ts'

test('a visitor signs up and lands on the dashboard', async ({ page }) => {
  await page.goto('/welcome')
  await page.getByRole('link', { name: /Почати безкоштовно/ }).first().click()
  await expect(page).toHaveURL('/register')

  await signUp(page, 'Марія Тестова')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Марія')
  await expect(page.getByText('Цей тиждень')).toBeVisible()
})

test('a signed-in user can sign out and back in', async ({ page }) => {
  const { email } = await signUp(page)
  await page.goto('/profile')
  await page.getByRole('button', { name: 'Вийти' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Вийти' }).click()
  await expect(page).toHaveURL('/welcome')

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Пароль', { exact: true }).fill('secret123')
  await page.getByRole('button', { name: 'Увійти' }).click()
  await expect(page).toHaveURL('/')
})

test('forgot password shows the confirmation', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: 'Забули пароль?' }).click()
  await expect(page).toHaveURL('/forgot-password')
  await page.getByLabel('Email').fill('nobody@test.ua')
  await page.getByRole('button', { name: 'Надіслати посилання' }).click()
  await expect(page.getByText(/Якщо акаунт з таким email існує/)).toBeVisible()
})

test('an on-device account keeps its workouts after signing in on the server', async ({ page }) => {
  const email = `local-${Date.now()}@test.ua`
  await page.goto('/login')
  // An account and a workout saved by the app before it had a server
  await page.evaluate(async (email) => {
    const encoder = new TextEncoder()
    const salt = 'e2e-salt'
    const key = await crypto.subtle.importKey('raw', encoder.encode('oldpass12'), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 100_000 }, key, 256)
    const passwordHash = Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('')
    const account = { id: 'local-e2e', name: 'Олена Локальна', email, plan: 'free', createdAt: '2026-01-01T00:00:00.000Z', salt, passwordHash }
    localStorage.setItem('fitpulse_accounts_v1', JSON.stringify([account]))
    localStorage.setItem('fitpulse_history_v1:local-e2e', JSON.stringify([{ id: 'before-server' }]))
  }, email)

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Пароль', { exact: true }).fill('oldpass12')
  await page.getByRole('button', { name: 'Увійти' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Олена')

  const stored = await page.evaluate(() => {
    const id = JSON.parse(localStorage.getItem('fitpulse_auth_session_v1') ?? 'null')
    return { id, history: localStorage.getItem(`fitpulse_history_v1:${id}`), accounts: localStorage.getItem('fitpulse_accounts_v1') }
  })
  expect(stored.id).not.toBe('local-e2e')
  expect(stored.history).toContain('before-server')
  expect(JSON.parse(stored.accounts ?? '[]')).toEqual([])
})
