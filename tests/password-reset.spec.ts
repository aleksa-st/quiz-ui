import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test('User can reset password', async ({ page }) => {
    // 1. Register a new user
    // Skipped to focus on Password Reset flow specifically
    const randomId = Math.floor(Math.random() * 10000);
    const email = `reset${randomId}@example.com`;
    const password = 'password123';
    const newPassword = 'newpassword123';

    await page.goto('http://localhost:3000/#register');

    await page.locator('input[name="fullName"]').fill('Reset User');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').fill(password);

    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for login/dashboard
    await expect(page).toHaveURL(/.*#dashboard/);

    // Force basic logout in main context just in case, but rely on new context for test
    await page.goto('http://localhost:3000/#login');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    // 2. Forgot Password Flow
    // Create a new context to ensure no auth state (Mocking a fresh browser session)
    const newContext = await page.context().browser().newContext();
    const newPage = await newContext.newPage();
    newPage.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await newPage.goto('http://localhost:3000/#login');

    // Mock the API response to ensure flow continuity without DB dependency
    await newPage.route('**/api/forgot-password', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: 'OTP sent', data: { otp: '123456' } })
        });
    });

    await newPage.click('text=Forgot password?');

    // Verify navigation and content
    await expect(newPage).toHaveURL(/.*#forgot-password/);
    await expect(newPage.getByRole('heading', { name: /forgot password/i })).toBeVisible();
    await expect(newPage.locator('input[type="email"]')).toBeVisible();

    // Setup interception to capture OTP on the new page
    let otp = '';
    await newPage.route('**/api/forgot-password', async route => {
        const response = await route.fetch();
        const json = await response.json();
        otp = json.otp; // Capture OTP from response
        await route.fulfill({ response, json });
    });

    await newPage.locator('input[type="email"]').fill(email);
    await newPage.getByRole('button', { name: /send reset code/i }).click();

    // 3. Reset Password Flow
    await expect(newPage.getByText(/Enter the OTP/i)).toBeVisible();

    // Wait for the OTP to be captured
    await newPage.waitForTimeout(1000);
    if (!otp) console.error('OTP not captured!');
    console.log('Captured OTP:', otp);

    await newPage.locator('input[placeholder="123456"]').fill(otp);
    await newPage.locator('input[placeholder="••••••••"]').first().fill(newPassword);
    await newPage.locator('input[placeholder="••••••••"]').nth(1).fill(newPassword);

    await newPage.getByRole('button', { name: /reset password/i }).click();

    // 4. Verify Login with New Password
    await expect(newPage.getByRole('heading', { name: /sign in/i })).toBeVisible();

    await newPage.locator('input[name="email"]').fill(email);
    await newPage.locator('input[name="password"]').fill(newPassword);
    await newPage.getByRole('button', { name: /sign in/i }).click();

    // 5. Verify Dashboard access
    await expect(newPage.getByText(/Level 1/i)).toBeVisible();

    await newContext.close();
});
