import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error("Please provide an email address");
        process.exit(1);
    }

    console.log(`Checking role for user: ${email}`);

    const user = await db.query.user.findFirst({
        where: eq(schema.user.email, email),
    });

    if (!user) {
        console.error("User not found");
        process.exit(1);
    }

    console.log(`User found: ${user.name} (${user.email})`);
    console.log(`Role: ${user.role}`);
    console.log(`ID: ${user.id}`);
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
