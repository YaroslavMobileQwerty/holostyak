import { test, expect } from '@playwright/test'

test('guest: episode page loads without crash (live layout smoke)', async ({ page }) => {
  await page.goto('/episodes')
  const link = page.locator('a[href^="/episode/"]').first()
  if ((await link.count()) === 0) {
    test.skip(true, 'No episode links (empty catalog)')
  }
  await link.click()
  await expect(
    page.getByText(/Випуск не знайдено|Ставки ще не опубліковано|Блискавки/),
  ).toBeVisible()
})

// Повний e2e (admin + user + live episode + seed) — додати окремим тестом після стабільного staging.
