import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function makeAdmin() {
    try {
        // Get the most recent user
        const result = await pool.query(`
            SELECT id, name, phone_number, role 
            FROM "user" 
            ORDER BY created_at DESC 
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            console.log("No users found.");
            return;
        }

        const user = result.rows[0];
        console.log("Found user:", user);

        // Update role to admin
        await pool.query(`
            UPDATE "user" 
            SET role = 'admin' 
            WHERE id = $1
        `, [user.id]);

        console.log(`✅ Successfully promoted ${user.phone_number || user.email} to ADMIN.`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await pool.end();
    }
}

makeAdmin();
