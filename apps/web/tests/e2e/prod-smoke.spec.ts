/**
 * E2E smoke tests for production. Run with:
 *   pnpm test:e2e --project=prod
 *   ENIGMA_BOX_BASE_URL=https://enigma-box.nard.uk pnpm test:e2e --project=prod
 *
 * No local server is started; the prod project uses the deployed base URL.
 */

import { test, expect } from '@playwright/test'

test.describe('prod pages', () => {
  test('homepage shows EnigmaBox and auth links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /EnigmaBox/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
  })

  test('register page loads', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })
})
