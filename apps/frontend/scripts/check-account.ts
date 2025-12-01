import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAccount() {
    try {
        const result = await pool.query(`
            SELECT id, account_id, provider_id, user_id, created_at 
            FROM account 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        console.log("\n=== Account Records ===");
        console.log(`Total records: ${result.rows.length}`);
        console.log(JSON.stringify(result.rows, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await pool.end();
    }
}

checkAccount();
