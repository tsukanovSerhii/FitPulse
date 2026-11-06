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

test('timers keep counting while the screen is off', async ({ page }) => {
  // Page timers stop firing while the clock jumps, as on a phone with the screen off
  await page.clock.install()
  await signUp(page)
  await page.goto('/workout')
  await page.getByRole('button', { name: /Понеділок/ }).first().click()
  await page.getByRole('button', { name: /Підхід 1 виконано/ }).click()

  const rest = page.getByRole('region', { name: 'Відпочинок' })
  await expect(rest).toContainText('01:30')

  const now = await page.evaluate(() => Date.now())
  await page.clock.setSystemTime(now + 60_000)
  await page.clock.runFor(1000)
  await expect(rest).toContainText('00:29')
  await expect(page.getByRole('banner').getByText(/^01:0\d$/)).toBeVisible()

  // Minimised, the workout keeps time in the tab bar too
  await page.getByRole('button', { name: 'Згорнути тренування' }).click()
  await page.clock.setSystemTime(now + 180_000)
  await page.clock.runFor(1000)
  await expect(page.getByRole('link', { name: /Тренування триває, 03:0\d/ })).toBeVisible()
})

test('rest settings from the profile apply in a workout and can be changed from the timer', async ({ page }) => {
  await signUp(page)
  await page.goto('/profile')
  const timer = page.getByRole('region', { name: 'Таймер відпочинку' })
  await timer.getByRole('radio', { name: 'Свій' }).click()
  for (let i = 0; i < 2; i++) await timer.getByRole('button', { name: /мінус 15/ }).click()

  await page.goto('/workout')
  await page.getByRole('button', { name: /Понеділок/ }).first().click()
  await page.getByRole('button', { name: /Підхід 1 виконано/ }).click()
  const rest = page.getByRole('region', { name: 'Відпочинок' })
  await expect(rest).toContainText(/01:0\d/)

  await rest.getByRole('button', { name: 'Налаштування таймера' }).click()
  const dialog = page.getByRole('dialog', { name: 'Таймер відпочинку' })
  await dialog.getByRole('radio', { name: '30 с' }).click()
  await dialog.getByRole('switch', { name: 'Запускати автоматично' }).click()
  await page.keyboard.press('Escape')
  await expect(rest.getByRole('button', { name: 'Плюс 30 секунд' })).toBeVisible()

  await rest.getByRole('button', { name: 'Пропустити' }).click()
  await page.getByRole('button', { name: /Підхід 2 виконано/ }).click()
  await expect(rest).toBeHidden()
})

test('a finished workout can be edited and the exercise history follows', async ({ page }) => {
  await signUp(page)
  await page.goto('/workout')
  await page.getByRole('button', { name: /Понеділок/ }).first().click()
  await page.getByRole('button', { name: /Підхід 1 виконано/ }).click()
  await page.getByRole('button', { name: 'Завершити', exact: true }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Завершити' }).click()
  await page.getByRole('dialog', { name: 'Чудова робота' }).getByRole('button', { name: 'Зберегти' }).click()
  await expect(page).toHaveURL('/progress')

  await page.goto('/progress/journal')
  // The demo journal has older entries; ours is the one with a single set
  await page.getByRole('button', { name: /· 1 підх\./ }).click()
  // Regression: the calendar column once widened the page, and the phone zoomed out so dialogs slid aside
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= (visualViewport?.width ?? innerWidth))).toBe(true)
  await page.getByRole('button', { name: 'Редагувати' }).click()
  const editor = page.getByRole('dialog')
  await editor.getByLabel('Підхід 1: вага').fill('150')
  await editor.getByRole('button', { name: 'Зберегти' }).click()
  await expect(page.getByText('Зміни збережено')).toBeVisible()

  await page.getByRole('link', { name: 'Жим штанги лежачи' }).first().click()
  await expect(page).toHaveURL('/progress/exercise/ex-bench-press')
  await expect(page.getByRole('heading', { name: 'Жим штанги лежачи' })).toBeVisible()
  await expect(page.getByText('150', { exact: true }).first()).toBeVisible()
})

test('the last workout can be repeated from the dashboard', async ({ page }) => {
  await signUp(page)
  // New accounts have an empty journal, so record one workout first
  await page.goto('/workout')
  await page.getByRole('button', { name: /Понеділок/ }).first().click()
  await page.getByRole('button', { name: /Підхід 1 виконано/ }).click()
  await page.getByRole('button', { name: 'Завершити', exact: true }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Завершити' }).click()
  await page.getByRole('button', { name: 'Зберегти' }).click()
  await expect(page).toHaveURL('/progress')
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Ціль тижня' })).toBeVisible()
  await page.getByRole('button', { name: 'Повторити це тренування' }).click()
  await expect(page).toHaveURL('/workout')
  await expect(page.getByRole('button', { name: /Підхід 1 виконано/ })).toBeVisible()
})
