import { expect, test } from '@playwright/test'
import { signUp } from './helpers.ts'

test('a workout recorded on one device appears on another', async ({ browser }) => {
  const phone = await browser.newPage()
  const { email } = await signUp(phone)

  await phone.goto('/workout')
  await phone.getByRole('button', { name: /Понеділок/ }).first().click()
  await phone.getByRole('button', { name: /Підхід 1 виконано/ }).click()
  await phone.getByRole('button', { name: 'Завершити', exact: true }).click()
  await phone.getByRole('alertdialog').getByRole('button', { name: 'Завершити' }).click()
  await phone.getByRole('button', { name: 'Зберегти' }).click()
  await expect(phone).toHaveURL('/progress')
  // The sync runs two seconds after the change
  await phone.goto('/profile')
  await expect(phone.getByText(/Синхронізовано/)).toBeVisible({ timeout: 15_000 })

  // A second device: its own storage, the same account
  const laptop = await (await browser.newContext()).newPage()
  await laptop.goto('/login')
  await laptop.getByLabel('Email').fill(email)
  await laptop.getByLabel('Пароль', { exact: true }).fill('secret123')
  await laptop.getByRole('button', { name: 'Увійти' }).click()
  // The phone's profile, program and workout arrive with the first sync
  await expect(laptop.getByRole('region', { name: 'Підсумки' })).toContainText('Тренувань1', { timeout: 15_000 })

  await laptop.goto('/progress/journal')
  const month = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' }).format(new Date())
  await expect(laptop.getByRole('region', { name: month }).getByText(/1 трен\./)).toBeVisible({ timeout: 15_000 })
})
