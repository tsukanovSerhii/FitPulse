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

test('a template from the library becomes an editable plan', async ({ page }) => {
  await signUp(page)
  await page.goto('/plans')
  await page.getByRole('button', { name: 'Готові програми' }).first().click()

  const library = page.getByRole('dialog', { name: 'Готові програми' })
  await library.getByRole('radio', { name: '6 днів' }).click()
  await expect(library.getByRole('article')).toHaveCount(1)
  await library.getByRole('button', { name: 'Додати' }).click()
  await expect(library).toBeHidden()

  await expect(page.getByText('Програму «Push / Pull / Legs на 6 днів» додано')).toBeVisible()
  await expect(page.getByText('6 днів · 36 вправ')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Почати тренування: субота' })).toBeVisible()
})
