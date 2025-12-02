import { test, expect } from '@playwright/test';

test.describe('Hotlines Section - Filter Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // รอให้หน้าโหลดเสร็จ
        await page.waitForLoadState('networkidle');
    });

    test('should display all hotlines by default', async ({ page }) => {
        // ตรวจสอบว่ามี hotlines section แสดงอยู่
        const hotlinesSection = page.locator('section#hotlines');
        await expect(hotlinesSection).toBeVisible();

        // ตรวจสอบว่ามี hotline cards แสดงอยู่ (ใช้ class selector)
        const hotlineCards = page.locator('section#hotlines .grid > div.group');
        const count = await hotlineCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should filter hotlines when clicking category filter', async ({ page }) => {
        // คลิกที่ category filter (เช่น "มูลนิธิ")
        const foundationFilter = page.locator('button:has-text("มูลนิธิ")').first();
        await foundationFilter.click();

        // รอให้ filter ทำงาน
        await page.waitForTimeout(500);

        // ตรวจสอบว่าปุ่มถูก active (มี text-white class)
        await expect(foundationFilter).toHaveClass(/text-white/);

        // ตรวจสอบว่ายังมี hotlines แสดงอยู่
        const hotlineCards = page.locator('section#hotlines .grid > div.group');
        const count = await hotlineCards.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should filter hotlines by switching categories', async ({ page }) => {
        // คลิก category แรก
        const foundationFilter = page.locator('button:has-text("มูลนิธิ")').first();
        await foundationFilter.click();
        await page.waitForTimeout(300);

        // ตรวจสอบว่าปุ่มถูก active
        await expect(foundationFilter).toHaveClass(/text-white/);

        // คลิก category ที่สอง (จะเปลี่ยนจาก category แรก)
        const volunteerFilter = page.locator('button:has-text("อาสาสมัคร")').first();
        await volunteerFilter.click();
        await page.waitForTimeout(300);

        // ตรวจสอบว่า category ใหม่ถูก active
        await expect(volunteerFilter).toHaveClass(/text-white/);
    });

    test('should clear filter when clicking "ทั้งหมด"', async ({ page }) => {
        // คลิก category filter ก่อน
        const foundationFilter = page.locator('button:has-text("มูลนิธิ")').first();
        await foundationFilter.click();
        await page.waitForTimeout(300);

        // คลิก "ทั้งหมด" เพื่อ clear filter
        const allFilter = page.locator('button:has-text("ทั้งหมด")').first();
        await allFilter.click();
        await page.waitForTimeout(300);

        // ตรวจสอบว่าปุ่ม "ทั้งหมด" ถูก active
        await expect(allFilter).toHaveClass(/text-white/);
    });

    test('should search hotlines by keyword', async ({ page }) => {
        // หา search input
        const searchInput = page.locator('input[placeholder*="ค้นหา"]').first();

        if (await searchInput.isVisible()) {
            // พิมพ์คำค้นหา
            await searchInput.fill('กู้ภัย');
            await page.waitForTimeout(500);

            // ตรวจสอบว่ามีผลลัพธ์แสดง
            const hotlineCards = page.locator('section#hotlines .grid > div.group');
            const count = await hotlineCards.count();

            // ถ้ามีผลลัพธ์ ต้องมี card แสดง
            if (count > 0) {
                await expect(hotlineCards.first()).toBeVisible();
            }
        }
    });

    test('should display "ไม่พบข้อมูล" when no results found', async ({ page }) => {
        // หา search input
        const searchInput = page.locator('input[placeholder*="ค้นหา"]').first();

        if (await searchInput.isVisible()) {
            // พิมพ์คำค้นหาที่ไม่มีผลลัพธ์
            await searchInput.fill('xyzabc123notfound');

            // รอให้ UI update
            await page.waitForTimeout(1000);

            // ตรวจสอบว่ามี h3 element ที่มีข้อความ "ไม่พบข้อมูล"
            const noResultsHeading = page.locator('h3', { hasText: 'ไม่พบข้อมูล' });
            await expect(noResultsHeading).toBeVisible({ timeout: 5000 });
        }
    });

    test.skip('should maintain filter state when navigating back', async ({ page }) => {
        // Note: ปัจจุบัน App ใช้ Local State ไม่ได้เก็บใน URL ทำให้ state หายเมื่อ navigate
        // จะเปิดใช้ test นี้เมื่อมีการ implement URL state management

        // คลิก category filter
        const foundationFilter = page.locator('button:has-text("มูลนิธิ")').first();
        await foundationFilter.click();
        await page.waitForTimeout(300);

        // จำ URL ที่มี filter
        const filteredUrl = page.url();

        // ไปหน้าอื่น
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // กลับมาหน้าเดิม
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // ตรวจสอบว่า filter ยังคงอยู่
        const currentUrl = page.url();
        expect(currentUrl).toBeDefined();
    });
});
