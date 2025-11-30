
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

        console.log(`Found ${popularHotlines.length} popular hotlines:`);
        popularHotlines.forEach(h => {
            console.log(`- ${h.name} (${h.numbers.join(", ")})`);
        });

        if (popularHotlines.length === 0) {
            console.log("⚠️ No popular hotlines found!");
        }
    } catch (error) {
        console.error("Error checking popular hotlines:", error);
    }

    process.exit(0);
}

checkPopular();
