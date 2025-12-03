import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Admin Pages Accessibility', () => {
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

        // Mock data endpoints to ensure stability
        await page.route('**/api/hotlines', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: '1', name: 'Test Hotline', numbers: [{ id: '1', value: '123' }], category: 'General' }])
            });
        });
        await page.route('**/api/shelters', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: '1', name: 'Test Shelter', location: 'Test Location', status: 'Open' }])
            });
        });
        await page.route('**/api/donations', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: '1', name: 'Test Donation', bankName: 'Bank', accountNumber: '123' }])
            });
        });
        await page.route('**/api/external-links', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: '1', name: 'Test Link', url: 'https://example.com', category: 'General' }])
            });
        });

        // Navigate to admin dashboard first
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
    });

    test.fixme('Hotlines Admin Page should not have any accessibility violations', async ({ page }) => {
        await page.locator('a[href="/admin/hotlines"]').click();
        await page.waitForSelector('h1:has-text("จัดการเบอร์โทรฉุกเฉิน")');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test.fixme('Shelters Admin Page should not have any accessibility violations', async ({ page }) => {
        await page.locator('a[href="/admin/shelters"]').click();
        await page.waitForSelector('h1:has-text("จัดการศูนย์พักพิง")');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test.fixme('Donations Admin Page should not have any accessibility violations', async ({ page }) => {
        await page.locator('a[href="/admin/donations"]').click();
        await page.waitForSelector('h1:has-text("จัดการการบริจาค")');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test.fixme('External Links Admin Page should not have any accessibility violations', async ({ page }) => {
        await page.locator('a[href="/admin/external-links"]').click();
        await page.waitForSelector('h1:has-text("จัดการลิงก์ภายนอก")');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
