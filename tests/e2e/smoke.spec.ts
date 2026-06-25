import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('app loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('platform login page renders', async ({ page }) => {
    await page.goto('/platform/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page has correct title', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Synchem SFA/i);
  });
});
