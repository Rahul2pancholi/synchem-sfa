import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page renders form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="text"], input[name="username"], input[id*="username"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="text"], input[name="username"]').first().fill('invalid@test.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    // Expect an error message to appear
    await expect(page.locator('[role="alert"], .ant-message, .ant-form-item-explain-error').first()).toBeVisible({ timeout: 8000 });
  });

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="text"], input[type="email"]').first()).toBeVisible();
  });
});
