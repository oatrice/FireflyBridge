import { auth } from "@/lib/auth";
import { db } from "@/db";
import { shelters } from "@/db/schema";
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
        const data = await db.select().from(shelters).orderBy(shelters.name);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch shelters" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, location, status, contacts, area, icon, link } = body;

        const [newShelter] = await db.insert(shelters).values({
            name,
            location,
            status: status || "open",
            contacts: contacts || [],
            area,
            icon,
            link,
        }).returning();

        return NextResponse.json(newShelter);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create shelter" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, name, location, status, contacts, area, icon, link } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const [updatedShelter] = await db.update(shelters)
            .set({
                name,
                location,
                status,
                contacts,
                area,
                icon,
                link,
            })
            .where(eq(shelters.id, id))
            .returning();

        return NextResponse.json(updatedShelter);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update shelter" }, { status: 500 });
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

        await db.delete(shelters).where(eq(shelters.id, Number(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete shelter" }, { status: 500 });
    }
}
