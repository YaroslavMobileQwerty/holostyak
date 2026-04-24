import { test, expect } from '@playwright/test'

test('guest can navigate all public pages', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Зроби свою ставку/ })).toBeVisible()

  await page.goto('/show')
  await expect(
    page.getByRole('heading', { name: 'Про шоу та як працює сайт', level: 1 }),
  ).toBeVisible()

  await page.goto('/season')
  await expect(page.getByRole('heading', { name: /Холостяк 15/, level: 1 })).toBeVisible()

  await page.goto('/episodes')
  await expect(page.getByRole('heading', { name: 'Випуски', level: 1 })).toBeVisible()
  await page.locator('a[href^="/episode/"]').first().click()
  await expect(page.getByText(/Ставки скоро/)).toBeVisible()

  await page.goto('/leaderboard')
  await expect(page.getByRole('heading', { name: 'Лідерборд', level: 1 })).toBeVisible()
})

test('guest sees login button; protected pages redirect', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Увійти' }).first()).toBeVisible()

  await page.goto('/profile')
  await expect(page).toHaveURL(/\/login/)
})
