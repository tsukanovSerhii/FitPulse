import { expect, test } from '@playwright/test'
import { signUp } from './helpers.ts'

test('variants share one card and the gym equipment filter is remembered', async ({ page }) => {
  await signUp(page)
  await page.goto('/exercises')

  await page.getByRole('button', { name: /^Груди Жим лежачи/ }).click()
  const detail = page.getByRole('dialog', { name: 'Жим штанги лежачи' })
  await detail.getByRole('radio', { name: 'Сміт' }).click()
  await expect(page.getByRole('dialog', { name: 'Жим лежачи в тренажері Сміта' })).toBeVisible()
  await expect(page.getByText('Замінити на…')).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Фільтри' }).click()
  const filters = page.getByRole('dialog', { name: 'Фільтри' })
  await filters.getByRole('button', { name: 'Гантелі', exact: true }).click()
  await filters.getByRole('button', { name: /^Показати/ }).click()
  await expect(page.getByRole('button', { name: /^Груди Жим гантелей лежачи/ })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: /^Груди Жим гантелей лежачи/ })).toBeVisible()
})

test('an exercise is swapped during a workout before any set', async ({ page }) => {
  await signUp(page)
  await page.goto('/workout')
  await page.getByRole('button', { name: /Понеділок/ }).first().click()
  await expect(page.getByRole('heading', { name: 'Жим штанги лежачи' })).toBeVisible()

  await page.getByRole('button', { name: 'Замінити вправу' }).click()
  await page.getByRole('dialog', { name: 'Замінити вправу' }).getByRole('button', { name: /Жим лежачи в тренажері Сміта/ }).click()
  await expect(page.getByRole('heading', { name: 'Жим лежачи в тренажері Сміта' })).toBeVisible()

  await page.getByRole('button', { name: /Підхід 1 виконано/ }).click()
  await page.getByRole('button', { name: 'Пропустити' }).click()
  await expect(page.getByRole('button', { name: 'Замінити вправу' })).toBeHidden()
})

test('the catalog renders cards a page at a time while scrolling', async ({ page }) => {
  await signUp(page)
  await page.goto('/exercises')
  const cards = page.getByRole('article')
  await expect(cards).toHaveCount(24)
  await page.getByRole('button', { name: /^Показати ще/ }).scrollIntoViewIfNeeded()
  await expect.poll(() => cards.count()).toBeGreaterThan(24)
})
