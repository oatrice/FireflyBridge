import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testPhoneUserCreation() {
    try {
        // Try to insert a test user with phone number
        const testPhoneNumber = "+66999999999";
        const userId = "test_phone_user_" + Date.now();

        console.log("\n=== Testing Phone User Creation ===");
        console.log(`Phone Number: ${testPhoneNumber}`);
        console.log(`User ID: ${userId}`);

        const result = await pool.query(`
            INSERT INTO "user" (
                id, 
                name, 
                email, 
                email_verified, 
                phone_number, 
                phone_number_verified,
                image,
                created_at, 
                updated_at,
                role
            ) VALUES (
                $1, 
                NULL, 
                NULL, 
                NULL, 
                $2, 
                true,
                NULL,
                NOW(), 
                NOW(),
                'user'
            )
            RETURNING *
        `, [userId, testPhoneNumber]);

        console.log("\n✅ User created successfully!");
        console.log(JSON.stringify(result.rows[0], null, 2));

        // Clean up
        await pool.query(`DELETE FROM "user" WHERE id = $1`, [userId]);
        console.log("\n🧹 Test user cleaned up");

    } catch (error: any) {
        console.error("\n❌ Error creating user:");
        console.error(error.message);
        console.error("\nFull error:", error);
    } finally {
        await pool.end();
    }
}

testPhoneUserCreation();
