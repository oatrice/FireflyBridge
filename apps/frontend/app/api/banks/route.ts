import { db } from "@/db";
import { banks } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const allBanks = await db.select().from(banks);
        return NextResponse.json(allBanks);
    } catch (error) {
        console.error("Failed to fetch banks:", error);
        return NextResponse.json({ error: "Failed to fetch banks" }, { status: 500 });
    }
}
