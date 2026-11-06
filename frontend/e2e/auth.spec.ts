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
