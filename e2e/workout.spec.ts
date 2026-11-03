import { expect, test } from '@playwright/test'
import { signUp } from './helpers.ts'

test('a workout is recorded and appears in the journal', async ({ page }) => {
  await signUp(page)
  await page.goto('/workout')
  await page.getByRole('button', { name: /Понеділок/ }).first().click()
  await expect(page.getByRole('heading', { name: 'Жим штанги лежачи' })).toBeVisible()

  await page.getByRole('button', { name: /Підхід 1 виконано/ }).click()
  await page.getByRole('button', { name: /Пропустити/ }).click()
  await page.getByRole('button', { name: /Підхід 2 виконано/ }).click()

  await page.getByRole('button', { name: 'Завершити', exact: true }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Завершити' }).click()
  await expect(page.getByRole('dialog', { name: 'Чудова робота' })).toBeVisible()
  await page.getByRole('button', { name: 'Зберегти' }).click()

  await expect(page).toHaveURL('/progress')
  const journal = page.getByRole('region', { name: 'Журнал' }).or(page.locator('section', { hasText: 'Журнал' }))
  await expect(journal.getByText(/Понеділок/).first()).toBeVisible()
})
