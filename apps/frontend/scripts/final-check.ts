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

async function finalCheck() {
    console.log("🔍 Final Pre-Deployment Check\n");
    console.log("=".repeat(80));

    try {
        // 1. Check total hotlines
        const allHotlines = await db.select().from(schema.hotlines);
        console.log(`\n✅ Total Hotlines: ${allHotlines.length}`);

        // 2. Check popular hotlines
        const popularHotlines = await db
            .select()
            .from(schema.hotlines)
            .where(eq(schema.hotlines.isPopular, true))
            .orderBy(asc(schema.hotlines.displayOrder));

        console.log(`✅ Popular Hotlines: ${popularHotlines.length} (Expected: 9)`);

        if (popularHotlines.length !== 9) {
            console.log("⚠️  WARNING: Expected 9 popular hotlines!");
        }

        // 3. Check displayOrder sequence
        const orders = popularHotlines.map(h => h.displayOrder);
        const expectedOrders = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const ordersMatch = JSON.stringify(orders) === JSON.stringify(expectedOrders);

        if (ordersMatch) {
            console.log("✅ DisplayOrder: Perfect sequence (1-9)");
        } else {
            console.log("❌ DisplayOrder: MISMATCH!");
            console.log(`   Expected: ${expectedOrders}`);
            console.log(`   Actual:   ${orders}`);
        }

        // 4. Check for empty phone numbers
        const emptyNumbers = allHotlines.filter(h => !h.numbers || h.numbers.length === 0);
        console.log(`\n📞 Hotlines without phone numbers: ${emptyNumbers.length}`);
        if (emptyNumbers.length > 0) {
            emptyNumbers.forEach(h => {
                const isPopular = h.isPopular ? "⭐ POPULAR" : "";
                console.log(`   - ${h.name} ${isPopular}`);
            });
        }

        // 5. Check shelters
        const shelters = await db.select().from(schema.shelters);
        console.log(`\n✅ Total Shelters: ${shelters.length}`);

        // 6. Check donations
        const donations = await db.select().from(schema.donations);
        console.log(`✅ Total Donations: ${donations.length}`);

        // 7. Check external links
        const links = await db.select().from(schema.externalLinks);
        console.log(`✅ Total External Links: ${links.length}`);

        // 8. Display popular hotlines list
        console.log("\n" + "=".repeat(80));
        console.log("\n📋 Popular Hotlines (in order):\n");
        popularHotlines.forEach(h => {
            const numbers = h.numbers && h.numbers.length > 0
                ? h.numbers.slice(0, 2).join(", ") + (h.numbers.length > 2 ? ", ..." : "")
                : "❌ No phone";
            console.log(`   [${h.displayOrder}] ${h.name}`);
            console.log(`       ${numbers}`);
        });

        console.log("\n" + "=".repeat(80));
        console.log("\n✅ Pre-deployment check completed!");
        console.log("\n🚀 Ready to deploy to production!\n");

    } catch (error) {
        console.error("\n❌ Error during final check:", error);
        process.exit(1);
    }

    process.exit(0);
}

finalCheck();
