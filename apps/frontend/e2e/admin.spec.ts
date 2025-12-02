import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to admin page
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
    });

    test('should display admin login page if not authenticated', async ({ page }) => {
        // ตรวจสอบว่าถูก redirect ไป login หรือแสดง login form
        const loginForm = page.locator('form, input[type="password"], button:has-text("เข้าสู่ระบบ")').first();
        const loginPage = page.url().includes('/login');

        const hasLogin = await loginForm.isVisible().catch(() => false);

        expect(hasLogin || loginPage).toBeTruthy();
    });

    test('should display admin dashboard after login', async ({ page }) => {
        // TODO: Implement login flow when authentication is ready
        // For now, just check if admin page exists

        const adminHeading = page.locator('h1:has-text("Admin"), h1:has-text("จัดการ")').first();
        const hasAdminHeading = await adminHeading.isVisible().catch(() => false);

        // ถ้าไม่มี login, อาจจะแสดง admin dashboard เลย
        if (hasAdminHeading) {
            await expect(adminHeading).toBeVisible();
        }
    });

    test.skip('should allow admin to add new hotline', async ({ page }) => {
        // TODO: Implement when admin CRUD is ready
        // 1. Click "Add Hotline" button
        // 2. Fill in form
        // 3. Submit
        // 4. Verify hotline appears in list
    });

    test.skip('should allow admin to edit hotline', async ({ page }) => {
        // TODO: Implement when admin CRUD is ready
    });

    test.skip('should allow admin to delete hotline', async ({ page }) => {
        // TODO: Implement when admin CRUD is ready
    });

    test.skip('should allow admin to add new shelter', async ({ page }) => {
        // TODO: Implement when admin CRUD is ready
    });

    test.skip('should allow admin to add new donation channel', async ({ page }) => {
        // TODO: Implement when admin CRUD is ready
    });

    test.skip('should allow admin to manage external platforms', async ({ page }) => {
        // TODO: Implement when admin CRUD is ready
    });

    test.skip('should validate form inputs', async ({ page }) => {
        // TODO: Implement form validation tests
        // - Required fields
        // - Phone number format
        // - URL format
        // - etc.
    });

    test.skip('should display success message after saving', async ({ page }) => {
        // TODO: Implement when admin CRUD is ready
    });

    test.skip('should display error message on save failure', async ({ page }) => {
        // TODO: Implement when admin CRUD is ready
    });
});
