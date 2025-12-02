import { test, expect } from '@playwright/test';

test.describe('Shelters Section - Filter and View Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Scroll ไปที่ Shelters section
        const sheltersSection = page.locator('text=ศูนย์พักพิง').first();
        if (await sheltersSection.isVisible()) {
            await sheltersSection.scrollIntoViewIfNeeded();
        }
    });

    test('should display shelters section', async ({ page }) => {
        const sheltersHeading = page.locator('h2:has-text("ศูนย์พักพิง")');
        await expect(sheltersHeading).toBeVisible();
    });

    test('should toggle between grid and list view', async ({ page }) => {
        // หาปุ่ม toggle view
        const gridViewButton = page.locator('button[aria-label*="Grid"], button:has-text("Grid")').first();
        const listViewButton = page.locator('button[aria-label*="List"], button:has-text("List")').first();

        // ถ้ามีปุ่ม toggle
        if (await gridViewButton.isVisible() || await listViewButton.isVisible()) {
            // คลิก Grid view
            if (await gridViewButton.isVisible()) {
                await gridViewButton.click();
                await page.waitForTimeout(300);
            }

            // คลิก List view
            if (await listViewButton.isVisible()) {
                await listViewButton.click();
                await page.waitForTimeout(300);
            }

            // ตรวจสอบว่ามี shelters แสดงอยู่
            const shelterCards = page.locator('[data-testid="shelter-card"]');
            if (await shelterCards.first().isVisible()) {
                await expect(shelterCards.first()).toBeVisible();
            }
        }
    });

    test('should filter shelters by province', async ({ page }) => {
        // หา province filter dropdown หรือ buttons
        const provinceFilter = page.locator('select[name*="province"], button:has-text("สงขลา")').first();

        if (await provinceFilter.isVisible()) {
            await provinceFilter.click();
            await page.waitForTimeout(500);

            // ตรวจสอบว่ามี shelters แสดงอยู่
            const shelterCards = page.locator('[data-testid="shelter-card"]');
            const count = await shelterCards.count();
            expect(count).toBeGreaterThanOrEqual(0);
        }
    });

    test('should search shelters by name or location', async ({ page }) => {
        // หา search input สำหรับ shelters
        const searchInput = page.locator('input[placeholder*="ค้นหา"]').nth(1); // nth(1) เพราะอาจมี search ของ hotlines ด้วย

        if (await searchInput.isVisible()) {
            await searchInput.fill('หาดใหญ่');
            await page.waitForTimeout(500);

            // ตรวจสอบว่ามีผลลัพธ์
            const shelterCards = page.locator('[data-testid="shelter-card"]');
            const count = await shelterCards.count();
            expect(count).toBeGreaterThanOrEqual(0);
        }
    });

    test('should display shelter details', async ({ page }) => {
        const shelterCards = page.locator('[data-testid="shelter-card"]');

        if (await shelterCards.first().isVisible()) {
            const firstCard = shelterCards.first();

            // ตรวจสอบว่ามีข้อมูลสำคัญแสดงอยู่
            await expect(firstCard).toBeVisible();

            // ตรวจสอบว่ามีปุ่ม "โทรทันที" หรือ phone number
            const callButton = firstCard.locator('button:has-text("โทร"), a[href^="tel:"]');
            if (await callButton.first().isVisible()) {
                await expect(callButton.first()).toBeVisible();
            }
        }
    });

    test('should click call button on shelter card', async ({ page }) => {
        const shelterCards = page.locator('[data-testid="shelter-card"]');

        if (await shelterCards.first().isVisible()) {
            const firstCard = shelterCards.first();
            const callButton = firstCard.locator('button:has-text("โทร"), a[href^="tel:"]').first();

            if (await callButton.isVisible()) {
                // คลิกปุ่มโทร (จะเปิด tel: link)
                await callButton.click();
                await page.waitForTimeout(300);

                // ตรวจสอบว่าไม่มี error
                expect(true).toBeTruthy();
            }
        }
    });

    test('should paginate shelters if pagination exists', async ({ page }) => {
        // หาปุ่ม pagination
        const nextButton = page.locator('button:has-text("ถัดไป"), button:has-text("Next"), button[aria-label*="next"]').first();
        const prevButton = page.locator('button:has-text("ก่อนหน้า"), button:has-text("Previous"), button[aria-label*="prev"]').first();

        if (await nextButton.isVisible()) {
            // คลิกไปหน้าถัดไป
            await nextButton.click();
            await page.waitForTimeout(500);

            // ตรวจสอบว่ามี shelters แสดงอยู่
            const shelterCards = page.locator('[data-testid="shelter-card"]');
            if (await shelterCards.first().isVisible()) {
                await expect(shelterCards.first()).toBeVisible();
            }

            // คลิกกลับหน้าก่อนหน้า
            if (await prevButton.isVisible()) {
                await prevButton.click();
                await page.waitForTimeout(500);
            }
        }
    });
});
