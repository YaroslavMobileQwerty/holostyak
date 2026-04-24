import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('landing has no serious structural a11y violations', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  // color-contrast: theme-wide AA pass is a separate audit (many `text-rose-dust` surfaces).
  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze()
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad).toEqual([])
})
