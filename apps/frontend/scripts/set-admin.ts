import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

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

    console.log(`Setting role 'admin' for user: ${email}`);

    const user = await db.query.user.findFirst({
        where: eq(schema.user.email, email),
    });

    if (!user) {
        console.error("User not found");
        process.exit(1);
    }

    await db.update(schema.user)
        .set({ role: "admin" })
        .where(eq(schema.user.id, user.id));

    console.log("✅ Successfully updated user role to admin");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
