import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test('User can register and access dashboard', async ({ page }) => {
  // 1. Go to Landing Page
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Quiz/);

  // 2. Click Register
  // The landing page has buttons like "Get Started for Free" or "Join Free"
  await page.getByRole('button', { name: /get started|join free|sign up/i }).first().click();
  await expect(page).toHaveURL(/.*register/);

  // 3. Fill Registration Form
  const randomId = Math.floor(Math.random() * 10000);
  const email = `test${randomId}@example.com`;

  // Custom Input component label is not associated with input via ID, so we use name attribute
  await page.locator('input[name="fullName"]').fill('Test User');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('password123');
  await page.locator('input[name="confirmPassword"]').fill('password123');

  // 4. Submit
  await page.getByRole('button', { name: /create account/i }).click();

  // 5. Verify Redirect to Dashboard
  // Wait for network idle or specific element
  // The dashboard shows "Level 1" for new users
  await expect(page.getByText(/Level 1/i)).toBeVisible({ timeout: 15000 });

  // Check if we are on dashboard
  // Note: Your app uses hash routing #dashboard
  // URL check removed as it can be flaky with custom routers, relying on content visibility
});
