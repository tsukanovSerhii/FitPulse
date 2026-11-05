import { expect, test } from '@playwright/test'
import { signUp } from './helpers.ts'

test('a body measurement is logged and updates the profile weight', async ({ page }) => {
  await signUp(page)
  await page.goto('/progress')
  await expect(page.getByRole('heading', { name: 'Підсумок' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Розділи прогресу' }).getByRole('link', { name: 'Тіло' }).click()
  await expect(page).toHaveURL('/progress/body')

  await page.getByLabel('Вага, кг').fill('78.5')
  await page.getByLabel('Талія, см').fill('82')
  await page.getByRole('button', { name: 'Додати вимір' }).click()
  await expect(page.getByText('Вимір збережено')).toBeVisible()
  await expect(page.getByText(/вага 78,5 кг · талія 82 см/)).toBeVisible()

  await page.getByRole('link', { name: 'Профіль' }).first().click()
  await expect(page).toHaveURL('/profile')
  await expect(page.getByText('78.5', { exact: false }).or(page.getByText('78,5', { exact: false })).first()).toBeVisible()
})
