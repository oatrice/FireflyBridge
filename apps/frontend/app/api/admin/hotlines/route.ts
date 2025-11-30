import { auth } from "@/lib/auth";
import { db } from "@/db";
import { hotlines } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Helper to check admin role
async function checkAdmin() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
        return false;
    }
    return true;
}

export async function GET() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await db.select().from(hotlines).orderBy(hotlines.name);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch hotlines" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, numbers, category, description, color } = body;

        const [newHotline] = await db.insert(hotlines).values({
            name,
            numbers: numbers || [],
            category: category || "general",
            description,
            color: color || "blue",
        }).returning();

        return NextResponse.json(newHotline);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create hotline" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, name, numbers, category, description, color } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const [updatedHotline] = await db.update(hotlines)
            .set({
                name,
                numbers,
                category,
                description,
                color,
                updatedAt: new Date(),
            })
            .where(eq(hotlines.id, id))
            .returning();

        return NextResponse.json(updatedHotline);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update hotline" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await db.delete(hotlines).where(eq(hotlines.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete hotline" }, { status: 500 });
    }
}
