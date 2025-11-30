import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function checkEmptyNumbers() {
    console.log("🔍 Checking hotlines with empty or missing phone numbers...\n");

    try {
        const allHotlines = await db.select().from(schema.hotlines);

        const emptyNumbers = allHotlines.filter(h => {
            return !h.numbers || h.numbers.length === 0;
        });

        if (emptyNumbers.length === 0) {
            console.log("✅ All hotlines have phone numbers!");
        } else {
            console.log(`⚠️  Found ${emptyNumbers.length} hotline(s) without phone numbers:\n`);
            emptyNumbers.forEach(h => {
                console.log(`- [ID: ${h.id}] ${h.name}`);
                console.log(`  Category: ${h.category}`);
                console.log(`  Description: ${h.description}`);
                console.log(`  IsPopular: ${h.isPopular ? 'Yes' : 'No'}`);
                if (h.links) {
                    console.log(`  Links: ${JSON.stringify(h.links)}`);
                }
                console.log();
            });
        }

        console.log(`\nTotal hotlines: ${allHotlines.length}`);
        console.log(`With numbers: ${allHotlines.length - emptyNumbers.length}`);
        console.log(`Without numbers: ${emptyNumbers.length}`);

    } catch (error) {
        console.error("❌ Error checking hotlines:", error);
    }

    process.exit(0);
}

checkEmptyNumbers();
