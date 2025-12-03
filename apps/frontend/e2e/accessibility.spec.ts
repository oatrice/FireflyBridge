import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Admin Pages Accessibility', () => {
    test('Hotlines Admin Page should not have any accessibility violations', async ({ page }) => {
        await page.goto('/admin/hotlines');

        // Wait for content to load
        await page.waitForSelector('h1:has-text("จัดการเบอร์โทรฉุกเฉิน")');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Shelters Admin Page should not have any accessibility violations', async ({ page }) => {
        await page.goto('/admin/shelters');

        // Wait for content to load
        await page.waitForSelector('h1:has-text("จัดการศูนย์พักพิง")');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Donations Admin Page should not have any accessibility violations', async ({ page }) => {
        await page.goto('/admin/donations');

        // Wait for content to load
        await page.waitForSelector('h1:has-text("จัดการการบริจาค")');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('External Links Admin Page should not have any accessibility violations', async ({ page }) => {
        await page.goto('/admin/external-links');

        // Wait for content to load
        await page.waitForSelector('h1:has-text("จัดการลิงก์ภายนอก")');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
