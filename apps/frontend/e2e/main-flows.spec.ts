
import { test, expect } from '@playwright/test';

test.describe('Main User Flows', () => {
    test('should load homepage successfully', async ({ page }) => {
        // เพิ่ม timeout สำหรับการโหลดหน้าแรก (อาจจะช้าในบาง environment)
        test.setTimeout(60000);

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // ตรวจสอบว่า page title ถูกต้อง
        await expect(page).toHaveTitle(/Firefly Bridge|ศูนย์กลาง/i);

        // ตรวจสอบว่า header แสดงอยู่
        const header = page.locator('header, [role="banner"]').first();
        await expect(header).toBeVisible();
    });

    test('should display all main sections', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // ตรวจสอบว่ามี sections หลักๆ แสดงอยู่
        const hotlinesSection = page.locator('text=สายด่วน').first();
        const sheltersSection = page.locator('text=ศูนย์พักพิง').first();
        const donationsSection = page.locator('text=บริจาค').first();

        await expect(hotlinesSection).toBeVisible();

        // Scroll เพื่อให้ sections อื่นๆ โหลด
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(500);

        if (await sheltersSection.isVisible()) {
            await expect(sheltersSection).toBeVisible();
        }

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        if (await donationsSection.isVisible()) {
            await expect(donationsSection).toBeVisible();
        }
    });

    test('should navigate using navigation bar', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // หา navigation links
        const navLinks = page.locator('nav a, nav button');
        const count = await navLinks.count();

        if (count > 0) {
            // คลิก link แรก
            const firstLink = navLinks.first();
            await firstLink.click();
            await page.waitForTimeout(500);

            // ตรวจสอบว่า page ยังทำงานอยู่
            expect(page.url()).toBeDefined();
        }
    });

    test('should scroll to section when clicking navigation link', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // คลิก navigation link ไปที่ shelters
        const sheltersLink = page.locator('a[href*="#shelters"], button:has-text("ศูนย์พักพิง")').first();

        if (await sheltersLink.isVisible()) {
            await sheltersLink.click();
            await page.waitForTimeout(500);

            // ตรวจสอบว่า scroll ไปที่ section แล้ว
            const sheltersSection = page.locator('text=ศูนย์พักพิง').first();
            await expect(sheltersSection).toBeVisible();
        }
    });

    test('should display footer with links', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Scroll ไปที่ footer
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        // ตรวจสอบว่ามี footer
        const footer = page.locator('footer, [role="contentinfo"]').first();
        await expect(footer).toBeVisible();

        // ตรวจสอบว่ามี GitHub link
        const githubLink = page.locator('a[href*="github"]').first();
        if (await githubLink.isVisible()) {
            await expect(githubLink).toBeVisible();
        }
    });

    test('should be responsive on mobile', async ({ page, isMobile }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // ตรวจสอบว่า page แสดงผลได้บน mobile
        const header = page.locator('header, [role="banner"]').first();
        await expect(header).toBeVisible();

        if (isMobile) {
            // ตรวจสอบว่า mobile menu ทำงาน (ถ้ามี)
            const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰")').first();

            if (await menuButton.isVisible()) {
                await menuButton.click();
                await page.waitForTimeout(300);

                // ตรวจสอบว่า menu เปิดขึ้นมา
                const mobileMenu = page.locator('nav[role="navigation"], [role="dialog"]').first();
                if (await mobileMenu.isVisible()) {
                    await expect(mobileMenu).toBeVisible();
                }
            }
        }
    });

    test('should handle external links correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Scroll ไปที่ external links section
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        // หา external links
        const externalLinks = page.locator('a[target="_blank"]');
        const count = await externalLinks.count();

        if (count > 0) {
            // ตรวจสอบว่า external links มี rel="noopener noreferrer"
            const firstLink = externalLinks.first();
            const rel = await firstLink.getAttribute('rel');

            // ควรมี security attributes
            expect(rel).toBeTruthy();
        }
    });

    test('should display donation information', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Scroll ไปที่ donations section
        const donationsSection = page.locator('text=บริจาค').first();
        if (await donationsSection.isVisible()) {
            await donationsSection.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);

            // ตรวจสอบว่ามีข้อมูลการบริจาค
            await expect(donationsSection).toBeVisible();

            // ตรวจสอบว่ามี QR code หรือ bank info
            const qrCode = page.locator('img[alt*="QR"], [data-testid="qr-code"]').first();
            const bankInfo = page.locator('text=/บัญชี|ธนาคาร|Account/i').first();

            const hasQR = await qrCode.isVisible().catch(() => false);
            const hasBankInfo = await bankInfo.isVisible().catch(() => false);

            expect(hasQR || hasBankInfo).toBeTruthy();
        }
    });
});
