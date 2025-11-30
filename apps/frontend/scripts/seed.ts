import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
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
    console.log("🌱 Seeding database...");

    try {
        console.log("Deleting old data...");
        await db.delete(schema.hotlines);
        await db.delete(schema.externalLinks);
        await db.delete(schema.shelters);
        await db.delete(schema.donations);

        console.log("Inserting hotlines...");
        await db.insert(schema.hotlines).values(hotlines);

        console.log("Inserting external links...");
        await db.insert(schema.externalLinks).values(externalLinks);

        console.log("Inserting shelters...");
        await db.insert(schema.shelters).values(shelters);

        console.log("Inserting donations...");
        await db.insert(schema.donations).values(donations);

        console.log("✅ Seeding completed!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

main();
