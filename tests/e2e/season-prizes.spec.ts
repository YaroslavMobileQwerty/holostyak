import { test, expect } from '@playwright/test'

test('guest /prizes redirects to login', async ({ page }) => {
  await page.goto('/prizes')
  await expect(page).toHaveURL(/\/login/)
})

test.fixme('admin finalize: потрібні test admin + seed (фаза 7)', async () => {
  // Повний сценарій: finalize → /prizes → доставка → /admin/prizes
})
