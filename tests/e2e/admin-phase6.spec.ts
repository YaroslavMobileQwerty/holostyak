import { test, expect } from '@playwright/test'

test('unauthenticated /admin/audit → login', async ({ page }) => {
  await page.goto('/admin/audit')
  await expect(page).toHaveURL(/\/login(\?.*)?$/)
})

test.fixme('admin can open new admin routes (needs admin session)', async () => {
  // needs test credentials
})
