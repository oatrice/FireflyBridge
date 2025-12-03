import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/login');

    // Check if Auth is enabled
    const comingSoon = page.getByText('Coming Soon');
    if (await comingSoon.isVisible()) {
        console.error('Authentication is disabled (NEXT_PUBLIC_ENABLE_AUTH != true). Please enable it to run E2E tests.');
        // We can either fail or skip. Failing is better to alert the user.
        throw new Error('Authentication is disabled. Set NEXT_PUBLIC_ENABLE_AUTH=true in your environment.');
    }

    // 2. Select Email Login Method
    // The default might be 'phone', so we explicitly click 'Email'
    await page.getByRole('button', { name: 'Email' }).click();

    // 3. Fill in Credentials
    // Ensure you have these set in your .env file or CI environment
    const email = process.env.TEST_EMAIL || 'admin@example.com';
    const password = process.env.TEST_PASSWORD || 'password123';

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // 4. Submit Form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 5. Wait for successful login (redirect to /admin)
    try {
        await page.waitForURL('/admin', { timeout: 15000 });
    } catch (e) {
        console.error('Login failed or timed out. Please check your credentials and ensure the test user exists.');
        throw e;
    }

    // 6. Save authentication state
    await page.context().storageState({ path: authFile });
});
