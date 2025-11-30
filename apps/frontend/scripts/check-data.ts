import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../db/schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
}

console.log("Checking data in database...");
console.log("URL Host:", new URL(process.env.DATABASE_URL).host);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
    try {
        const sheltersCount = await db.select().from(schema.shelters);
        console.log(`Shelters found: ${sheltersCount.length}`);
        if (sheltersCount.length > 0) {
            console.log("Sample Shelter:", sheltersCount[0].name);
        }

        const hotlinesCount = await db.select().from(schema.hotlines);
        console.log(`Hotlines found: ${hotlinesCount.length}`);

        const usersCount = await db.select().from(schema.user);
        console.log(`Users found: ${usersCount.length}`);

    } catch (error) {
        console.error("Error checking data:", error);
    }
    process.exit(0);
}

main();
