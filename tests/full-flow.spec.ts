import { test, expect } from '@playwright/test';

test.setTimeout(120000); // 2 minutes for the full flow

test('Full Quiz Journey', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
    console.log('Starting Full Quiz Journey...');

    // 1. Login
    await page.goto('http://127.0.0.1:3000/#login');
    await page.getByPlaceholder('you@example.com').fill('jeeva.manikandan.m.sc@gmail.com');
    await page.getByPlaceholder('••••••••').fill('123456789');
    await page.getByRole('button', { name: /sign in/i }).click();

    // 2. Dashboard
    console.log('Waiting for Dashboard...');
    await expect(page).toHaveURL(/.*#dashboard/, { timeout: 10000 });

    // 3. Navigate to Quiz Details via UI
    console.log('Navigating to Explore...');
    await page.getByRole('button', { name: /Explore/i }).first().click();

    console.log('Selecting "Basic Computers" quiz...');
    // Find the card containing "Basic Computers" and click its "Start Quiz" button
    const card = page.locator('div.group').filter({ hasText: 'Basic Computers' }).first();
    await card.waitFor({ state: 'visible' });
    await card.getByRole('button', { name: /Start Quiz/i }).click();

    // 4. Verify Quiz Details page
    console.log('Verifying Quiz Details page...');
    await expect(page.getByRole('heading', { name: /Basic Computers/i })).toBeVisible();

    // 5. Start Quiz
    console.log('Starting Quiz Play...');
    await page.getByRole('button', { name: /Start Quiz Now/i }).click();

    // 6. Wait for questions to load
    console.log('Waiting for questions to load...');
    await page.waitForSelector('h2', { state: 'visible', timeout: 30000 });

    // 5. Take Quiz (1 to 10 questions)
    for (let i = 0; i < 10; i++) {
        console.log(`Answering Question ${i + 1}/10...`);

        // Wait for question text to arrive
        await page.waitForSelector('h2', { state: 'visible' });

        // Click the first answer option (Button A)
        // Note: The button text starts with "A " (e.g. "A Power Supply")
        const optionA = page.getByRole('button', { name: /^A\s/i }).first();
        await optionA.waitFor({ state: 'visible' });
        await optionA.click();

        // Wait for the auto-advance animation (1.5s in code)
        if (i < 9) {
            await page.waitForTimeout(2000);
        }
    }

    // 6. Results page
    console.log('Waiting for Results Page...');
    await expect(page).toHaveURL(/.*quiz-results/, { timeout: 15000 });

    const resultsHeader = page.getByRole('heading', { level: 1 });
    await expect(resultsHeader).toBeVisible();

    const resultsText = await resultsHeader.innerText();
    console.log('Results Page Heading:', resultsText);

    const validHeadings = ['Good Attempt!', 'Great Job!', 'Outstanding!', 'Results'];
    const isValid = validHeadings.some(h => resultsText.includes(h) || h === resultsText);
    expect(isValid).toBeTruthy();

    console.log('Journey Completed Successfully!');
});
