import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking tables in the database...");

    const result = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);

    console.log("Found tables:", result.rows.map(r => r.table_name));
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
