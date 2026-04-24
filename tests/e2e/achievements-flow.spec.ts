import { test } from '@playwright/test'

test('guest can open leaderboard', async ({ page }) => {
  await page.goto('/leaderboard')
  await page.getByRole('heading', { name: /Лідерборд/i }).waitFor()
})

test.fixme('full achievements flow needs seeded bets and admin resolve', async () => {
  // Placeholder for streak + notification flow after test DB seed
})
