import { expect, type Page } from '@playwright/test'

/** Answers the sign-up questionnaire; ends on the step with the recommended programs. */
export async function answerOnboarding(page: Page) {
  // The first request after a quiet period may wake the API and the database
  await expect(page).toHaveURL('/onboarding', { timeout: 15_000 })
  await page.getByRole('radio', { name: 'Жіноча' }).click()
  await page.getByLabel('Вік').fill('29')
  await page.getByLabel('Зріст, см').fill('168')
  await page.getByLabel('Вага, кг', { exact: true }).fill('64')
  await page.getByLabel('Бажана вага, кг').fill('60')
  await page.getByRole('button', { name: 'Далі' }).click()
  await page.getByRole('radio', { name: /Набір м'язової маси/ }).click()
  await page.getByRole('button', { name: 'Далі' }).click()
  await page.getByRole('radio', { name: 'Більше року' }).click()
  await page.getByRole('radio', { name: '3', exact: true }).click()
  await page.getByRole('button', { name: 'Далі' }).click()
  await page.getByRole('radio', { name: 'У залі' }).click()
  await page.getByRole('button', { name: 'Далі' }).click()
  await expect(page.getByRole('heading', { name: 'Ваша перша програма' })).toBeVisible()
}

// A program whose Monday starts with the barbell bench press, which several scenarios open
async function addMondayPlan(page: Page) {
  await page.evaluate(() => {
    const userId = JSON.parse(localStorage.getItem('fitpulse_auth_session_v1') ?? 'null')
    const set = (id: string, exerciseId: string, order: number) => ({ id, exerciseId, sets: 4, reps: 8, weight: 60, restSeconds: 90, order })
    const now = new Date().toISOString()
    const plan = {
      id: 'plan-e2e',
      name: 'Спліт для тестів',
      createdAt: now,
      updatedAt: now,
      schedule: {
        monday: [set('e2e-1', 'ex-bench-press', 1), set('e2e-2', 'ex-incline-dumbbell-press', 2)],
        tuesday: [],
        wednesday: [set('e2e-3', 'ex-barbell-squat', 1)],
        thursday: [],
        friday: [set('e2e-4', 'ex-barbell-row', 1)],
        saturday: [],
        sunday: [],
      },
    }
    localStorage.setItem(`fitpulse_plans_v1:${userId}`, JSON.stringify([plan]))
    localStorage.setItem(`fitpulse_active_plan_id_v1:${userId}`, JSON.stringify(plan.id))
  })
}

/** Registers a new account, finishes the questionnaire and lands on the dashboard. */
export async function signUp(page: Page, name = 'Марія Тестова', { withPlan = true } = {}) {
  const email = `user-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.ua`
  await page.goto('/register')
  await page.getByLabel("Ім'я").fill(name)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Пароль', { exact: true }).fill('secret123')
  await page.getByRole('button', { name: 'Створити акаунт' }).click()
  await answerOnboarding(page)
  await page.getByRole('button', { name: 'Складу програму сам' }).click()
  await expect(page).toHaveURL('/plans')
  if (withPlan) await addMondayPlan(page)
  await page.goto('/')
  await expect(page).toHaveURL('/')
  return { name, email }
}
