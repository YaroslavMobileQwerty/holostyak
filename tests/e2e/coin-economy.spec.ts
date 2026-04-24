import { test, expect } from '@playwright/test'

test.describe('coin economy (guest)', () => {
  test('coins page shows donation block', async ({ page }) => {
    await page.goto('/coins')
    await expect(page.getByRole('heading', { name: /донат і бали/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /як задонатити/i })).toBeVisible()
    await expect(page.getByTestId('coins-guest-login')).toBeVisible()
  })

  test('wallet redirects guest to login', async ({ page }) => {
    await page.goto('/wallet')
    await expect(page).toHaveURL(/\/login/)
  })
})
