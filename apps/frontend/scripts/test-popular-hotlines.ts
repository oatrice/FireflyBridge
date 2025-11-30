import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import { eq, asc } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => boolean | Promise<boolean>) {
    return async () => {
        totalTests++;
        try {
            const result = await fn();
            if (result) {
                passedTests++;
                console.log(`  ✅ ${name}`);
                return true;
            } else {
                failedTests++;
                console.log(`  ❌ ${name}`);
                return false;
            }
        } catch (error) {
            failedTests++;
            console.log(`  ❌ ${name}`);
            console.log(`     Error: ${error}`);
            return false;
        }
    };
}

async function runTests() {
    console.log("\n🧪 Running Popular Hotlines Test Suite\n");
    console.log("=".repeat(80));

    // Fetch data once
    const allHotlines = await db.select().from(schema.hotlines);
    const popularHotlines = await db
        .select()
        .from(schema.hotlines)
        .where(eq(schema.hotlines.isPopular, true))
        .orderBy(asc(schema.hotlines.displayOrder));

    // Test Suite 1: Data Integrity
    console.log("\n📊 Test Suite 1: Data Integrity\n");

    await test("Database should have hotlines", () => {
        return allHotlines.length > 0;
    })();

    await test("Should have exactly 9 popular hotlines", () => {
        return popularHotlines.length === 9;
    })();

    await test("All popular hotlines should have isPopular = true", () => {
        return popularHotlines.every(h => h.isPopular === true);
    })();

    await test("Non-popular hotlines should have isPopular = false or null", () => {
        const nonPopular = allHotlines.filter(h => !h.isPopular);
        return nonPopular.every(h => h.isPopular === false || h.isPopular === null);
    })();

    // Test Suite 2: DisplayOrder Validation
    console.log("\n🔢 Test Suite 2: DisplayOrder Validation\n");

    await test("DisplayOrder should be sequential (1-9)", () => {
        const orders = popularHotlines.map(h => h.displayOrder);
        const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        return JSON.stringify(orders) === JSON.stringify(expected);
    })();

    await test("No duplicate displayOrder values", () => {
        const orders = popularHotlines.map(h => h.displayOrder);
        const uniqueOrders = new Set(orders);
        return orders.length === uniqueOrders.size;
    })();

    await test("No gaps in displayOrder sequence", () => {
        const orders = popularHotlines.map(h => h.displayOrder).sort((a, b) => a - b);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i] !== i + 1) return false;
        }
        return true;
    })();

    await test("All popular hotlines should have displayOrder > 0", () => {
        return popularHotlines.every(h => h.displayOrder && h.displayOrder > 0);
    })();

    // Test Suite 3: Required Fields
    console.log("\n📝 Test Suite 3: Required Fields\n");

    await test("All popular hotlines should have a name", () => {
        return popularHotlines.every(h => h.name && h.name.length > 0);
    })();

    await test("All popular hotlines should have a category", () => {
        return popularHotlines.every(h => h.category && h.category.length > 0);
    })();

    await test("All popular hotlines should have a description", () => {
        return popularHotlines.every(h => h.description && h.description.length > 0);
    })();

    await test("All popular hotlines should have a color", () => {
        return popularHotlines.every(h => h.color && h.color.length > 0);
    })();

    // Test Suite 4: Phone Numbers
    console.log("\n📞 Test Suite 4: Phone Numbers\n");

    const hotlinesWithNumbers = popularHotlines.filter(h => h.numbers && h.numbers.length > 0);
    const hotlinesWithoutNumbers = popularHotlines.filter(h => !h.numbers || h.numbers.length === 0);

    await test("At least 8 out of 9 popular hotlines should have phone numbers", () => {
        return hotlinesWithNumbers.length >= 8;
    })();

    await test("Phone numbers should be in array format", () => {
        return popularHotlines.every(h => Array.isArray(h.numbers) || h.numbers === null);
    })();

    if (hotlinesWithoutNumbers.length > 0) {
        console.log(`  ℹ️  ${hotlinesWithoutNumbers.length} hotline(s) without phone numbers:`);
        hotlinesWithoutNumbers.forEach(h => {
            console.log(`     - ${h.name}`);
        });
    }

    // Test Suite 5: Specific Popular Hotlines
    console.log("\n⭐ Test Suite 5: Specific Popular Hotlines\n");

    const expectedPopular = [
        "ป่อเต็กตึ๊ง",
        "กู้ภัยหาดใหญ่",
        "มูลนิธิร่วมกตัญญู",
        "มูลนิธิองค์กรทำดี (บุ๋ม ปนัดดา)",
        "โครงการพลังน้ำใจ/โรงครัวเปิ้ล นาคร",
        "มูลนิธิใจถึงใจ (ฝันดี-ฝันเด่น)",
        "มูลนิธิกระจกเงา",
        "กันจอมพลังช่วยสู้",
        "มูลนิธิเพื่อการส่งเสริมและพัฒนาสังคม"
    ];

    await test("Should contain all expected popular hotlines", () => {
        const actualNames = popularHotlines.map(h => h.name);
        return expectedPopular.every(name => actualNames.includes(name));
    })();

    await test("Popular hotlines should be in correct order", () => {
        const actualNames = popularHotlines.map(h => h.name);
        return JSON.stringify(actualNames) === JSON.stringify(expectedPopular);
    })();

    await test("'ป่อเต็กตึ๊ง' should be first (displayOrder: 1)", () => {
        return popularHotlines[0]?.name === "ป่อเต็กตึ๊ง" && popularHotlines[0]?.displayOrder === 1;
    })();

    await test("'มูลนิธิเพื่อการส่งเสริมและพัฒนาสังคม' should be last (displayOrder: 9)", () => {
        const last = popularHotlines[popularHotlines.length - 1];
        return last?.name === "มูลนิธิเพื่อการส่งเสริมและพัฒนาสังคม" && last?.displayOrder === 9;
    })();

    // Test Suite 6: API Compatibility
    console.log("\n🔌 Test Suite 6: API Compatibility\n");

    await test("All hotlines should have valid JSON structure", () => {
        try {
            JSON.stringify(allHotlines);
            return true;
        } catch {
            return false;
        }
    })();

    await test("Links field should be valid JSON or null", () => {
        return popularHotlines.every(h => {
            if (h.links === null) return true;
            try {
                if (typeof h.links === 'object') return true;
                return false;
            } catch {
                return false;
            }
        });
    })();

    // Test Suite 7: Database Consistency
    console.log("\n🗄️  Test Suite 7: Database Consistency\n");

    await test("All hotlines should have unique IDs", () => {
        const ids = allHotlines.map(h => h.id);
        const uniqueIds = new Set(ids);
        return ids.length === uniqueIds.size;
    })();

    await test("All hotlines should have createdAt timestamp", () => {
        return allHotlines.every(h => h.createdAt !== null);
    })();

    await test("All hotlines should have updatedAt timestamp", () => {
        return allHotlines.every(h => h.updatedAt !== null);
    })();

    // Summary
    console.log("\n" + "=".repeat(80));
    console.log("\n📊 Test Summary\n");
    console.log(`   Total Tests:  ${totalTests}`);
    console.log(`   ✅ Passed:    ${passedTests}`);
    console.log(`   ❌ Failed:    ${failedTests}`);
    console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests === 0) {
        console.log("\n🎉 All tests passed! Ready for deployment.\n");
    } else {
        console.log(`\n⚠️  ${failedTests} test(s) failed. Please review before deployment.\n`);
    }

    console.log("=".repeat(80) + "\n");

    process.exit(failedTests > 0 ? 1 : 0);
}

runTests();
