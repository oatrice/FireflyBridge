import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "@/db";
import { hotlines, externalLinks, shelters, donations } from "@/db/schema";
import { asc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const app = new Elysia({ prefix: "/api" })
    .use(cors())
    .get("/", () => "FireflyBridge API is Running 🚀")
    .get("/hotlines", async () => {
        return await db.select().from(hotlines).orderBy(asc(hotlines.displayOrder), asc(hotlines.id));
    })
    .get("/external-links", async () => {
        return await db.select().from(externalLinks);
    })
    .get("/shelters", async () => {
        return await db.select().from(shelters);
    })
    .get("/donations", async () => {
        return await db.select().from(donations);
    });

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
export const PATCH = app.handle;