import { expect, test } from '@playwright/test'
import { signUp } from './helpers.ts'

test('a new plan gets an exercise on Monday', async ({ page }) => {
  await signUp(page)
  await page.goto('/plans')
  await page.getByRole('button', { name: 'Нова програма' }).first().click()

  const editor = page.getByRole('dialog', { name: 'Нова програма' })
  await editor.getByLabel('Назва').fill('Мій спліт')
  await editor.getByRole('button', { name: 'Створити' }).click()
  await expect(editor).toBeHidden()

  await page.getByRole('button', { name: /Мій спліт/ }).click()
  // Regression: the card's action row once overflowed the phone and zoomed the page out
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Додати вправи на понеділок' }).click()

  const day = page.getByRole('dialog', { name: 'Понеділок' })
  await day.getByLabel('Вправа').selectOption({ label: 'Присідання зі штангою на плечах' })
  await day.getByRole('button', { name: 'Додати до дня' }).click()
  await expect(day.getByText('Присідання зі штангою на плечах').first()).toBeVisible()
  await day.getByRole('button', { name: 'Готово' }).click()

  await expect(page.getByText('1 день · 1 вправа')).toBeVisible()
})

test('a template goes on the weekdays the user picks', async ({ page }) => {
  await signUp(page)
  await page.goto('/plans')
  const library = page.getByRole('region', { name: /Готові програми/ })
  await expect(library.getByRole('article')).toHaveCount(15)
  await library.getByRole('radio', { name: '6 днів' }).click()
  await expect(library.getByRole('article')).toHaveCount(2)
  await library.getByRole('article').filter({ hasText: 'Push / Pull / Legs на 6 днів' }).getByRole('button', { name: 'Додати' }).click()

  // Template days come preselected: Monday to Saturday. Train Tuesday to Sunday instead
  const days = page.getByRole('dialog', { name: 'Дні тренувань' })
  const confirm = days.getByRole('button', { name: 'Додати програму' })
  await days.getByRole('button', { name: 'Понеділок' }).click()
  await expect(confirm).toBeDisabled()
  await days.getByRole('button', { name: 'Неділя' }).click()
  await confirm.click()
  await expect(days).toBeHidden()

  await expect(page.getByText('Програму «Push / Pull / Legs на 6 днів» додано')).toBeVisible()
  await expect(page.getByText('6 днів · 36 вправ')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Почати тренування: неділя' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Додати вправи на понеділок' })).toBeVisible()
})

test('the training days of a plan can be changed later', async ({ page }) => {
  await signUp(page)
  await page.goto('/plans')
  await page.getByRole('button', { name: 'Дні тренувань' }).first().click()

  const days = page.getByRole('dialog', { name: 'Дні тренувань' })
  for (const day of ['Понеділок', 'Середа', "П'ятниця"]) await days.getByRole('button', { name: day }).click()
  for (const day of ['Вівторок', 'Четвер', 'Субота']) await days.getByRole('button', { name: day }).click()
  await days.getByRole('button', { name: 'Зберегти' }).click()

  await expect(page.getByText('Дні тренувань оновлено')).toBeVisible()
  for (const day of ['вівторок', 'четвер', 'субота']) await expect(page.getByRole('button', { name: `Почати тренування: ${day}` })).toBeVisible()
})
