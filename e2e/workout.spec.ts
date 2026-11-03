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
  await page.getByRole('navigation', { name: 'Розділи прогресу' }).getByRole('link', { name: 'Журнал' }).click()
  await expect(page).toHaveURL('/progress/journal')

  const month = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' }).format(new Date())
  const group = page.getByRole('region', { name: month })
  await expect(group.getByText(/Понеділок/).first()).toBeVisible()
  await expect(group.getByText(/1 трен\./)).toBeVisible()
})

test('a free workout is logged set by set and saved as a plan', async ({ page }) => {
  await signUp(page)
  await page.goto('/workout')
  await page.getByRole('button', { name: 'Почати' }).click()

  for (const name of ['Тяга верхнього блока широким хватом', 'Жим гантелей сидячи']) {
    const picker = page.getByRole('dialog', { name: 'Додати вправу' })
    if (!(await picker.isVisible())) await page.getByRole('button', { name: 'Додати вправу' }).click()
    await picker.getByRole('searchbox').fill(name)
    await picker.getByRole('button', { name: new RegExp(name) }).click()
    await expect(page.getByRole('heading', { name })).toBeVisible()
    await page.getByRole('button', { name: /Підхід 1 виконано/ }).click()
    await page.getByRole('button', { name: 'Пропустити' }).click()
  }

  await page.getByRole('button', { name: 'Завершити' }).first().click()
  const summary = page.getByRole('dialog', { name: 'Чудова робота' })
  await summary.getByText('Зберегти як програму').click()
  await summary.getByLabel('Назва програми').fill('Спина й плечі')
  await summary.getByRole('button', { name: 'Зберегти' }).click()

  await expect(page).toHaveURL('/progress')
  await page.goto('/plans')
  await expect(page.getByText('Спина й плечі')).toBeVisible()
  await expect(page.getByText('1 день · 2 вправи')).toBeVisible()
})
