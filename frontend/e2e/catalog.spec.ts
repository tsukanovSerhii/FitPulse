import { expect, test } from '@playwright/test'

test('search engines get a static page for every exercise', async ({ request }) => {
  const html = await (await request.get('/exercise/bench-press')).text()
  expect(html).toContain('<title>Жим штанги лежачи: техніка виконання | FitPulse</title>')
  expect(html).toContain('<link rel="canonical" href="https://fitpulse-web-7fbg.onrender.com/exercise/bench-press"')
  expect(html).toContain('<h1>Жим штанги лежачи</h1>')
  expect(html).toContain('"@type":"HowTo"')

  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('/exercise/bench-press</loc>')
  expect(sitemap).toContain('/program/ppl-3</loc>')
})

test('a visitor browses the public catalog without an account', async ({ page }) => {
  await page.goto('/catalog')
  await expect(page.getByRole('heading', { name: 'Вправи й програми тренувань', level: 1 })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')

  await page.getByRole('link', { name: /^Румунська тяга Ноги/ }).click()
  await expect(page).toHaveURL('/exercise/romanian-deadlift')
  await expect(page.getByRole('heading', { name: 'Румунська тяга', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Інші варіанти/ })).toBeVisible()
  await expect(page).toHaveTitle('Румунська тяга: техніка виконання | FitPulse')

  await page.getByRole('navigation', { name: 'Навігація' }).getByRole('link', { name: 'Каталог' }).click()
  await page.getByRole('link', { name: /Сила 5×5/ }).click()
  await expect(page).toHaveURL('/program/strength-5x5')
  await expect(page.getByRole('heading', { name: 'Сила 5×5', level: 1 })).toBeVisible()
  await page.getByRole('link', { name: 'Створити акаунт безкоштовно' }).click()
  await expect(page).toHaveURL('/register')
})
