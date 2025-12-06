import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import * as dotenv from "dotenv";
import { hotlines, externalLinks, shelters, donations } from "./data";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
    console.log("🌱 Seeding database (Upsert Mode)...");

    try {
        // Hotlines
        console.log("Processing hotlines...");
        for (const item of hotlines) {
            const existing = await db.select().from(schema.hotlines).where(eq(schema.hotlines.name, item.name));
            if (existing.length > 0) {
                await db.update(schema.hotlines).set(item).where(eq(schema.hotlines.name, item.name));
            } else {
                await db.insert(schema.hotlines).values(item);
            }
        }

        // External Links
        console.log("Processing external links...");
        for (const item of externalLinks) {
            const existing = await db.select().from(schema.externalLinks).where(eq(schema.externalLinks.name, item.name));
            if (existing.length > 0) {
                await db.update(schema.externalLinks).set(item).where(eq(schema.externalLinks.name, item.name));
            } else {
                await db.insert(schema.externalLinks).values(item);
            }
        }

        // Shelters
        console.log("Processing shelters...");
        for (const item of shelters) {
            const existing = await db.select().from(schema.shelters).where(eq(schema.shelters.name, item.name));
            if (existing.length > 0) {
                await db.update(schema.shelters).set(item).where(eq(schema.shelters.name, item.name));
            } else {
                await db.insert(schema.shelters).values(item);
            }
        }

        // Donations
        console.log("Processing donations...");
        for (const item of donations) {
            const existing = await db.select().from(schema.donations).where(eq(schema.donations.name, item.name));
            if (existing.length > 0) {
                await db.update(schema.donations).set(item).where(eq(schema.donations.name, item.name));
            } else {
                await db.insert(schema.donations).values(item);
            }
        }

        console.log("✅ Seeding completed!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

main();
