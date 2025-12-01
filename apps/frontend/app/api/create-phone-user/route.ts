import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber, code } = await request.json();

        if (!phoneNumber || !code) {
            return NextResponse.json(
                { error: "Phone number and code are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await db.query.user.findFirst({
            where: eq(schema.user.phoneNumber, phoneNumber),
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // Create new user with phone number
        const userId = crypto.randomUUID();
        const [newUser] = await db.insert(schema.user).values({
            id: userId,
            phoneNumber: phoneNumber,
            phoneNumberVerified: true,
            name: null,
            email: null,
            emailVerified: null,
            image: null,
            role: "user",
        }).returning();

        return NextResponse.json({
            success: true,
            user: newUser
        });

    } catch (error: any) {
        console.error("Error creating phone user:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create user" },
            { status: 500 }
        );
    }
}
