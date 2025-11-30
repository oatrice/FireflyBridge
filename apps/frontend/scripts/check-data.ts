import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking data counts...");

    const tables = ['hotlines', 'shelters', 'donations', 'external_links'];

    for (const table of tables) {
        const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM "${table}"`));
        console.log(`${table}: ${result.rows[0].count} rows`);
    }

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
