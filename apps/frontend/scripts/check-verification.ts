import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkVerification() {
    try {
        const result = await pool.query(`
            SELECT * FROM verification 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        console.log("\n=== Verification Records ===");
        console.log(`Total records: ${result.rows.length}`);
        console.log(JSON.stringify(result.rows, null, 2));

        // Also check user table for phone numbers
        const users = await pool.query(`
            SELECT id, name, email, phone_number, phone_number_verified, created_at 
            FROM "user" 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        console.log("\n=== Recent Users ===");
        console.log(JSON.stringify(users.rows, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await pool.end();
    }
}

checkVerification();
