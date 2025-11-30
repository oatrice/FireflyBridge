
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function checkPopular() {
    console.log("🔍 Checking popular hotlines...");

    try {
        const popularHotlines = await db.select().from(schema.hotlines).where(eq(schema.hotlines.isPopular, true));

        // Sort by displayOrder
        const sorted = popularHotlines.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        console.log(`Found ${sorted.length} popular hotlines (sorted by displayOrder):\n`);
        sorted.forEach(h => {
            console.log(`[${h.displayOrder || 0}] ${h.name} (${h.numbers.join(", ")})`);
        });

        if (sorted.length === 0) {
            console.log("⚠️ No popular hotlines found!");
        }
    } catch (error) {
        console.error("Error checking popular hotlines:", error);
    }

    process.exit(0);
}

checkPopular();
