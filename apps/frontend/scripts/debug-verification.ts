import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking verification table schema...");

    // Check if table exists in public schema
    const result = await db.execute(sql`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_name = 'verification'
  `);

    console.log("Verification table info:", result.rows);

    // Try to select from verification table
    try {
        const testSelect = await db.execute(sql`SELECT * FROM verification LIMIT 1`);
        console.log("✅ Can select from verification table");
    } catch (err: any) {
        console.log("❌ Cannot select from verification table:", err.message);
    }

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
