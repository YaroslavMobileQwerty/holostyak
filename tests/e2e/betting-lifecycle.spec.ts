import { test, expect } from '@playwright/test'

test('guest: episodes list opens first episode without crash', async ({ page }) => {
  await page.goto('/episodes')
  const link = page.locator('a[href^="/episode/"]').first()
  if ((await link.count()) === 0) {
    test.skip(true, 'No episode links in list (empty catalog)')
  }
  await link.click()
  await expect(
    page.getByText(/Випуск не знайдено|Ставки ще не опубліковано/),
  ).toBeVisible()
})

// Повний цикл: створення події, place_bet, resolve — після test credentials + seed; SQL через supabase.
