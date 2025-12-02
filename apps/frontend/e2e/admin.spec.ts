import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Mock the auth session endpoint
        await page.route('**/api/auth/get-session', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: {
                        id: 'test-admin-id',
                        name: 'Test Admin',
                        email: 'test-admin@example.com',
                        role: 'admin',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        emailVerified: true
                    },
                    session: {
                        id: 'test-session-id',
                        userId: 'test-admin-id',
                        token: 'test-token',
                        expiresAt: new Date(Date.now() + 86400000).toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                })
            });
        });

        // Navigate to admin page
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
    });

    test('should display admin dashboard after login', async ({ page }) => {
        const adminHeading = page.locator('h1:has-text("ภาพรวม"), h1:has-text("Overview")').first();
        await expect(adminHeading).toBeVisible();
        await expect(page.getByText('ยินดีต้อนรับ, Test Admin')).toBeVisible();
    });

    test('should allow admin to add, edit, and delete hotline', async ({ page }) => {
        // 1. Navigate to Hotlines
        await page.click('a[href="/admin/hotlines"]');
        await expect(page).toHaveURL(/\/admin\/hotlines/);

        // 2. Add New Hotline
        await page.click('button:has-text("เพิ่มข้อมูล")');

        // Fill form
        const testName = `Test Hotline ${Date.now()}`;
        await page.fill('input[name="name"]', testName);

        // Check if category is a select
        const categorySelect = page.locator('select');
        if (await categorySelect.isVisible()) {
            await categorySelect.selectOption('ทั่วไป');
        } else {
            await page.fill('input[name="category"]', 'ทั่วไป');
        }

        // Handle numbers input
        const numberInput = page.locator('input[placeholder*="08x-xxx-xxxx"]');
        if (await numberInput.isVisible()) {
            await numberInput.first().fill('02-123-4567');
        }

        await page.click('button:has-text("บันทึกข้อมูล")');

        // Verify it appears in the list
        await expect(page.getByText(testName)).toBeVisible();

        // 3. Edit Hotline
        // Find the row with the test name and click edit
        const row = page.locator(`tr:has-text("${testName}")`).first();
        await row.locator('button[title="แก้ไข"]').click();

        // Change name
        const newName = `${testName} Updated`;
        await page.fill('input[name="name"]', newName);
        await page.click('button:has-text("บันทึกข้อมูล")');

        // Verify update
        await expect(page.getByText(newName)).toBeVisible();
        await expect(page.getByText(testName)).not.toBeVisible();

        // 4. Delete Hotline
        const updatedRow = page.locator(`tr:has-text("${newName}")`).first();

        page.on('dialog', dialog => dialog.accept());

        await updatedRow.locator('button[title="ลบ"]').click();

        const deleteConfirm = page.locator('button:has-text("ยืนยัน"), button:has-text("Confirm")');
        if (await deleteConfirm.isVisible()) {
            await deleteConfirm.click();
        }

        // Verify deletion
        await expect(page.getByText(newName)).not.toBeVisible();
    });

    test('should allow admin to navigate to shelters', async ({ page }) => {
        await page.click('a[href="/admin/shelters"]');
        await expect(page).toHaveURL(/\/admin\/shelters/);
        await expect(page.locator('h1')).toContainText('Shelters');
    });

    test('should allow admin to navigate to donations', async ({ page }) => {
        await page.click('a[href="/admin/donations"]');
        await expect(page).toHaveURL(/\/admin\/donations/);
        await expect(page.locator('h1')).toContainText('Donations');
    });

    test('should allow admin to navigate to external links', async ({ page }) => {
        await page.click('a[href="/admin/external-links"]');
        await expect(page).toHaveURL(/\/admin\/external-links/);
        await expect(page.locator('h1')).toContainText('External Links');
    });
});
