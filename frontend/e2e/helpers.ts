import { expect, type Page } from '@playwright/test'

export async function signUp(page: Page, name = 'Марія Тестова') {
  const email = `user-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.ua`
  await page.goto('/register')
  await page.getByLabel("Ім'я").fill(name)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Пароль', { exact: true }).fill('secret123')
  await page.getByRole('button', { name: 'Створити акаунт' }).click()
  await expect(page).toHaveURL('/')
  return { name, email }
}
