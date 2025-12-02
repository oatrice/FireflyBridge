import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "@/db";
import { hotlines, externalLinks, shelters, donations } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const app = new Elysia({ prefix: "/api" })
    .use(cors())
    .get("/", () => "FireflyBridge API is Running 🚀")

    // Hotlines CRUD
    .get("/hotlines", async () => {
        return await db.select().from(hotlines).orderBy(asc(hotlines.displayOrder), asc(hotlines.id));
    })
    .post("/hotlines", async ({ body }) => {
        const newHotline = await db.insert(hotlines).values(body as any).returning();
        return newHotline[0];
    }, {
        body: t.Object({
            name: t.String(),
            numbers: t.Optional(t.Array(t.String())),
            category: t.String(),
            description: t.Optional(t.String()),
            color: t.Optional(t.String()),
            links: t.Optional(t.Any()), // JSONB
            isPopular: t.Optional(t.Boolean()),
            displayOrder: t.Optional(t.Number())
        })
    })
    .put("/hotlines/:id", async ({ params: { id }, body }) => {
        const updatedHotline = await db.update(hotlines)
            .set({ ...body as any, updatedAt: new Date() })
            .where(eq(hotlines.id, parseInt(id)))
            .returning();
        return updatedHotline[0];
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            numbers: t.Optional(t.Array(t.String())),
            category: t.Optional(t.String()),
            description: t.Optional(t.String()),
            color: t.Optional(t.String()),
            links: t.Optional(t.Any()),
            isPopular: t.Optional(t.Boolean()),
            displayOrder: t.Optional(t.Number())
        })
    })
    .delete("/hotlines/:id", async ({ params: { id } }) => {
        await db.delete(hotlines).where(eq(hotlines.id, parseInt(id)));
        return { success: true };
    })

    // Shelters CRUD
    .get("/shelters", async () => {
        return await db.select().from(shelters);
    })
    .post("/shelters", async ({ body }) => {
        const newShelter = await db.insert(shelters).values(body as any).returning();
        return newShelter[0];
    }, {
        body: t.Object({
            name: t.String(),
            location: t.String(),
            status: t.String(),
            contacts: t.Optional(t.Array(t.Object({
                name: t.String(),
                phone: t.String()
            }))),
            area: t.Optional(t.String()),
            icon: t.Optional(t.String()),
            link: t.Optional(t.String())
        })
    })
    .put("/shelters/:id", async ({ params: { id }, body }) => {
        const updatedShelter = await db.update(shelters)
            .set({ ...body as any, updatedAt: new Date() })
            .where(eq(shelters.id, parseInt(id)))
            .returning();
        return updatedShelter[0];
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            location: t.Optional(t.String()),
            status: t.Optional(t.String()),
            contacts: t.Optional(t.Array(t.Object({
                name: t.String(),
                phone: t.String()
            }))),
            area: t.Optional(t.String()),
            icon: t.Optional(t.String()),
            link: t.Optional(t.String())
        })
    })
    .delete("/shelters/:id", async ({ params: { id } }) => {
        await db.delete(shelters).where(eq(shelters.id, parseInt(id)));
        return { success: true };
    })

    // Donations CRUD
    .get("/donations", async () => {
        return await db.select().from(donations);
    })
    .post("/donations", async ({ body }) => {
        const newDonation = await db.insert(donations).values(body as any).returning();
        return newDonation[0];
    }, {
        body: t.Object({
            name: t.String(),
            bankName: t.Optional(t.String()),
            accountNumber: t.Optional(t.String()),
            accountName: t.Optional(t.String()),
            description: t.Optional(t.String()),
            qrCodeUrl: t.Optional(t.String()),
            contacts: t.Optional(t.Array(t.Object({
                name: t.String(),
                phone: t.String()
            }))),
            donationPoints: t.Optional(t.Array(t.String())),
            acceptsMoney: t.Optional(t.Boolean())
        })
    })
    .put("/donations/:id", async ({ params: { id }, body }) => {
        const updatedDonation = await db.update(donations)
            .set({ ...body as any, updatedAt: new Date() })
            .where(eq(donations.id, parseInt(id)))
            .returning();
        return updatedDonation[0];
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            bankName: t.Optional(t.String()),
            accountNumber: t.Optional(t.String()),
            accountName: t.Optional(t.String()),
            description: t.Optional(t.String()),
            qrCodeUrl: t.Optional(t.String()),
            contacts: t.Optional(t.Array(t.Object({
                name: t.String(),
                phone: t.String()
            }))),
            donationPoints: t.Optional(t.Array(t.String())),
            acceptsMoney: t.Optional(t.Boolean())
        })
    })
    .delete("/donations/:id", async ({ params: { id } }) => {
        await db.delete(donations).where(eq(donations.id, parseInt(id)));
        return { success: true };
    })

    // Other endpoints
    .get("/external-links", async () => {
        return await db.select().from(externalLinks);
    })
    .post("/external-links", async ({ body }) => {
        const newLink = await db.insert(externalLinks).values(body as any).returning();
        return newLink[0];
    }, {
        body: t.Object({
            name: t.String(),
            url: t.String(),
            description: t.Optional(t.String()),
            category: t.Optional(t.String()),
            icon: t.Optional(t.String())
        })
    })
    .put("/external-links/:id", async ({ params: { id }, body }) => {
        const updatedLink = await db.update(externalLinks)
            .set({ ...body as any, updatedAt: new Date() })
            .where(eq(externalLinks.id, parseInt(id)))
            .returning();
        return updatedLink[0];
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            url: t.Optional(t.String()),
            description: t.Optional(t.String()),
            category: t.Optional(t.String()),
            icon: t.Optional(t.String())
        })
    })
    .delete("/external-links/:id", async ({ params: { id } }) => {
        await db.delete(externalLinks).where(eq(externalLinks.id, parseInt(id)));
        return { success: true };
    });

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
export const PATCH = app.handle;