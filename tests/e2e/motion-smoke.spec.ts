import { test, expect } from '@playwright/test'

test('public routes navigate without error', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // Header nav is desktop-only (`md:flex`); use direct navigation for stable e2e on mobile.
  await page.goto('/show')
  await expect(page).toHaveURL(/\/show/)
  expect(errors, errors.join('\n')).toEqual([])
})
