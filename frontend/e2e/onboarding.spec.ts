import { expect, test } from '@playwright/test'
import { answerOnboarding } from './helpers.ts'

test('a new user answers the questionnaire and lands on the dashboard with the chosen program', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel("Ім'я").fill('Ірина Нова')
  await page.getByLabel('Email').fill(`onboarding-${Date.now()}@test.ua`)
  await page.getByLabel('Пароль', { exact: true }).fill('secret123')
  await page.getByRole('button', { name: 'Створити акаунт' }).click()

  await answerOnboarding(page)
  const choose = page.getByRole('button', { name: /^Обрати / }).first()
  const program = (await choose.getAttribute('aria-label'))!.replace(/^Обрати /, '')
  await choose.click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Перше тренування' })).toBeVisible()
  await page.goto('/plans')
  await expect(page.getByText(program).first()).toBeVisible()

  // The questionnaire is not shown again
  await page.goto('/onboarding')
  await expect(page).toHaveURL('/')
})
