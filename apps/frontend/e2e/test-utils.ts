import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

// Load environment variables
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

export const TEST_ADMIN_EMAIL = "test-admin@example.com";
export const TEST_ADMIN_NAME = "Test Admin";

export async function seedAdminUser(suffix: string = "") {
    const email = suffix ? `test-admin-${suffix}@example.com` : TEST_ADMIN_EMAIL;

    // 1. Check if user exists, if so delete (just in case)
    await cleanupAdminUser(email);

    // 2. Create User
    const userId = "test-admin-id-" + Date.now() + "-" + suffix;
    await db.insert(schema.user).values({
        id: userId,
        name: TEST_ADMIN_NAME,
        email: email,
        role: "admin",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // 3. Create Session
    const token = "test-session-token-" + Date.now() + "-" + suffix;
    const sessionId = "test-session-id-" + Date.now() + "-" + suffix;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // Expires in 1 day

    await db.insert(schema.session).values({
        id: sessionId,
        userId: userId,
        token: token,
        expiresAt: expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return { userId, token, email };
}

export async function cleanupAdminUser(email: string = TEST_ADMIN_EMAIL) {
    // Delete session first (foreign key)
    const users = await db.select().from(schema.user).where(eq(schema.user.email, email));

    for (const user of users) {
        await db.delete(schema.session).where(eq(schema.session.userId, user.id));
        await db.delete(schema.user).where(eq(schema.user.id, user.id));
    }
}
