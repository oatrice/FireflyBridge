import { describe, expect, it, beforeAll } from "bun:test";
import { hotlines } from "../../scripts/data";

/**
 * Unit Tests for Popular Hotlines Feature
 * These tests validate the seed data structure without requiring database connection
 * Suitable for CI/CD pipelines
 */

describe("Popular Hotlines - Seed Data Validation", () => {
    let popularHotlines: any[];

    beforeAll(() => {
        // Filter popular hotlines from seed data
        popularHotlines = hotlines.filter((h: any) => h.isPopular === true);
    });

    describe("Data Integrity", () => {
        it("should have exactly 9 popular hotlines", () => {
            expect(popularHotlines.length).toBe(9);
        });

        it("all popular hotlines should have isPopular = true", () => {
            const allPopular = popularHotlines.every((h: any) => h.isPopular === true);
            expect(allPopular).toBe(true);
        });

        it("non-popular hotlines should not have isPopular = true", () => {
            const nonPopular = hotlines.filter((h: any) => !h.isPopular);
            const noneMarkedPopular = nonPopular.every((h: any) => h.isPopular !== true);
            expect(noneMarkedPopular).toBe(true);
        });
    });

    describe("DisplayOrder Validation", () => {
        it("should have sequential displayOrder (1-9)", () => {
            const orders = popularHotlines
                .map((h: any) => h.displayOrder)
                .sort((a: number, b: number) => a - b);
            const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            expect(orders).toEqual(expected);
        });

        it("should have no duplicate displayOrder values", () => {
            const orders = popularHotlines.map((h: any) => h.displayOrder);
            const uniqueOrders = new Set(orders);
            expect(orders.length).toBe(uniqueOrders.size);
        });

        it("should have no gaps in displayOrder sequence", () => {
            const orders = popularHotlines
                .map((h: any) => h.displayOrder)
                .sort((a: number, b: number) => a - b);

            for (let i = 0; i < orders.length; i++) {
                expect(orders[i]).toBe(i + 1);
            }
        });

        it("all popular hotlines should have displayOrder > 0", () => {
            const allPositive = popularHotlines.every((h: any) => h.displayOrder > 0);
            expect(allPositive).toBe(true);
        });
    });

    describe("Required Fields", () => {
        it("all popular hotlines should have a name", () => {
            const allHaveNames = popularHotlines.every(
                (h: any) => h.name && h.name.length > 0
            );
            expect(allHaveNames).toBe(true);
        });

        it("all popular hotlines should have a category", () => {
            const allHaveCategory = popularHotlines.every(
                (h: any) => h.category && h.category.length > 0
            );
            expect(allHaveCategory).toBe(true);
        });

        it("all popular hotlines should have a description", () => {
            const allHaveDescription = popularHotlines.every(
                (h: any) => h.description && h.description.length > 0
            );
            expect(allHaveDescription).toBe(true);
        });

        it("all popular hotlines should have a color", () => {
            const allHaveColor = popularHotlines.every(
                (h: any) => h.color && h.color.length > 0
            );
            expect(allHaveColor).toBe(true);
        });
    });

    describe("Phone Numbers", () => {
        it("at least 8 out of 9 should have phone numbers", () => {
            const withNumbers = popularHotlines.filter(
                (h: any) => h.numbers && h.numbers.length > 0
            );
            expect(withNumbers.length).toBeGreaterThanOrEqual(8);
        });

        it("phone numbers should be in array format", () => {
            const allArrays = popularHotlines.every(
                (h: any) => Array.isArray(h.numbers) || h.numbers === undefined
            );
            expect(allArrays).toBe(true);
        });

        it("phone numbers should not be empty strings", () => {
            popularHotlines.forEach((h: any) => {
                if (h.numbers && h.numbers.length > 0) {
                    h.numbers.forEach((num: string) => {
                        expect(num.length).toBeGreaterThan(0);
                    });
                }
            });
        });
    });

    describe("Specific Popular Hotlines", () => {
        const expectedPopular = [
            "ป่อเต็กตึ๊ง",
            "กู้ภัยหาดใหญ่",
            "มูลนิธิร่วมกตัญญู",
            "มูลนิธิองค์กรทำดี (บุ๋ม ปนัดดา)",
            "โครงการพลังน้ำใจ/โรงครัวเปิ้ล นาคร",
            "มูลนิธิใจถึงใจ (ฝันดี-ฝันเด่น)",
            "มูลนิธิกระจกเงา",
            "กันจอมพลังช่วยสู้",
            "มูลนิธิเพื่อการส่งเสริมและพัฒนาสังคม",
        ];

        it("should contain all expected popular hotlines", () => {
            const actualNames = popularHotlines.map((h: any) => h.name);
            expectedPopular.forEach((name) => {
                expect(actualNames).toContain(name);
            });
        });

        it("should be in correct order by displayOrder", () => {
            const sorted = [...popularHotlines].sort(
                (a: any, b: any) => a.displayOrder - b.displayOrder
            );
            const actualNames = sorted.map((h: any) => h.name);
            expect(actualNames).toEqual(expectedPopular);
        });

        it("'ป่อเต็กตึ๊ง' should have displayOrder: 1", () => {
            const item = popularHotlines.find((h: any) => h.name === "ป่อเต็กตึ๊ง");
            expect(item).toBeDefined();
            expect(item.displayOrder).toBe(1);
        });

        it("'มูลนิธิเพื่อการส่งเสริมและพัฒนาสังคม' should have displayOrder: 9", () => {
            const item = popularHotlines.find(
                (h: any) => h.name === "มูลนิธิเพื่อการส่งเสริมและพัฒนาสังคม"
            );
            expect(item).toBeDefined();
            expect(item.displayOrder).toBe(9);
        });
    });

    describe("Data Structure Validation", () => {
        it("all hotlines should be valid objects", () => {
            hotlines.forEach((h: any) => {
                expect(typeof h).toBe("object");
                expect(h).not.toBeNull();
            });
        });

        it("links field should be object or undefined", () => {
            popularHotlines.forEach((h: any) => {
                if (h.links !== undefined) {
                    expect(typeof h.links).toBe("object");
                }
            });
        });

        it("color should be valid Tailwind class", () => {
            popularHotlines.forEach((h: any) => {
                expect(h.color).toMatch(/^bg-\w+-\d{3}$/);
            });
        });
    });

    describe("Business Logic", () => {
        it("popular hotlines should cover different categories", () => {
            const categories = new Set(popularHotlines.map((h: any) => h.category));
            // Should have at least 2 different categories
            expect(categories.size).toBeGreaterThanOrEqual(2);
        });

        it("should include both emergency and foundation hotlines", () => {
            const hasEmergency = popularHotlines.some((h: any) =>
                h.category === "ฉุกเฉิน"
            );
            const hasFoundation = popularHotlines.some((h: any) =>
                h.category === "มูลนิธิ" || h.category === "อาสาสมัคร"
            );

            expect(hasEmergency).toBe(true);
            expect(hasFoundation).toBe(true);
        });
    });
});

describe("All Hotlines - General Validation", () => {
    it("should have more than 50 total hotlines", () => {
        expect(hotlines.length).toBeGreaterThan(50);
    });

    it("all hotlines should have unique names", () => {
        const names = hotlines.map((h: any) => h.name);
        const uniqueNames = new Set(names);
        expect(names.length).toBe(uniqueNames.size);
    });

    it("all hotlines should have valid categories", () => {
        const validCategories = [
            "ฉุกเฉิน",
            "การแพทย์",
            "ดับเพลิง",
            "จราจร",
            "ทางน้ำ",
            "สาธารณภัย",
            "หน่วยงานรัฐ",
            "ท้องถิ่น",
            "สาธารณูปโภค",
            "มูลนิธิ",
            "อาสาสมัคร",
            "ขนส่ง",
        ];

        hotlines.forEach((h: any) => {
            expect(validCategories).toContain(h.category);
        });
    });
});
