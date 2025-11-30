import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { asc } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function testPopularOrder() {
    console.log("🧪 Testing Popular Hotlines Order...\n");

    try {
        // Test 1: Check if all popular hotlines have displayOrder
        const popularHotlines = await db
            .select()
            .from(schema.hotlines)
            .where(eq(schema.hotlines.isPopular, true))
            .orderBy(asc(schema.hotlines.displayOrder));

        console.log(`✅ Found ${popularHotlines.length} popular hotlines\n`);

        // Test 2: Verify displayOrder sequence
        let hasGaps = false;
        let hasDuplicates = false;
        const orders = popularHotlines.map(h => h.displayOrder);
        const uniqueOrders = new Set(orders);

        if (orders.length !== uniqueOrders.size) {
            hasDuplicates = true;
            console.log("⚠️  WARNING: Duplicate displayOrder values found!");
        }

        for (let i = 1; i <= popularHotlines.length; i++) {
            if (!orders.includes(i)) {
                hasGaps = true;
                console.log(`⚠️  WARNING: Missing displayOrder ${i}`);
            }
        }

        if (!hasGaps && !hasDuplicates) {
            console.log("✅ DisplayOrder sequence is perfect (1-24, no gaps, no duplicates)\n");
        }

        // Test 3: Display ordered list
        console.log("📋 Popular Hotlines in Order:\n");
        popularHotlines.forEach((h, idx) => {
            const orderMatch = h.displayOrder === idx + 1 ? "✅" : "❌";
            console.log(`${orderMatch} [${h.displayOrder}] ${h.name}`);
        });

        console.log("\n🎉 Test completed!");

    } catch (error) {
        console.error("❌ Error testing popular order:", error);
    }

    process.exit(0);
}

testPopularOrder();
