import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "@/db";
import { hotlines, externalLinks, shelters, donations } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createCrudHandlers = (
    table: any,
    schema: any,
    updateSchema: any = schema
) => {
    return (app: any) => app
        .get("/", async () => {
            if (table === hotlines) {
                return await db.select().from(table).orderBy(asc(table.displayOrder), asc(table.id));
            }
            return await db.select().from(table);
        })
        .post("/", async ({ body }: { body: any }) => {
            const newItem = await db.insert(table).values(body as any).returning() as any[];
            return newItem[0];
        }, { body: schema })
        .put("/:id", async ({ params: { id }, body }: { params: { id: string }, body: any }) => {
            const updatedItem = await db.update(table)
                .set({ ...body as any, updatedAt: new Date() })
                .where(eq(table.id, parseInt(id)))
                .returning() as any[];
            return updatedItem[0];
        }, { body: updateSchema })
        .delete("/:id", async ({ params: { id } }: { params: { id: string } }) => {
            await db.delete(table).where(eq(table.id, parseInt(id)));
            return { success: true };
        });
};

const hotlineSchema = t.Object({
    name: t.String(),
    numbers: t.Optional(t.Array(t.String())),
    category: t.String(),
    description: t.Optional(t.String()),
    color: t.Optional(t.String()),
    links: t.Optional(t.Any()),
    isPopular: t.Optional(t.Boolean()),
    displayOrder: t.Optional(t.Number())
});

const hotlineUpdateSchema = t.Object({
    name: t.Optional(t.String()),
    numbers: t.Optional(t.Array(t.String())),
    category: t.Optional(t.String()),
    description: t.Optional(t.String()),
    color: t.Optional(t.String()),
    links: t.Optional(t.Any()),
    isPopular: t.Optional(t.Boolean()),
    displayOrder: t.Optional(t.Number())
});

const shelterSchema = t.Object({
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
});

const shelterUpdateSchema = t.Object({
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
});

const donationSchema = t.Object({
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
});

const donationUpdateSchema = t.Object({
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
});

const externalLinkSchema = t.Object({
    name: t.String(),
    url: t.String(),
    description: t.Optional(t.String()),
    category: t.Optional(t.String()),
    icon: t.Optional(t.String())
});

const externalLinkUpdateSchema = t.Object({
    name: t.Optional(t.String()),
    url: t.Optional(t.String()),
    description: t.Optional(t.String()),
    category: t.Optional(t.String()),
    icon: t.Optional(t.String())
});

export const app = new Elysia({ prefix: "/api" })
    .use(cors())
    .get("/", () => "FireflyBridge API is Running 🚀")
    .group("/hotlines", (app) => createCrudHandlers(hotlines, hotlineSchema, hotlineUpdateSchema)(app) as any)
    .group("/shelters", (app) => createCrudHandlers(shelters, shelterSchema, shelterUpdateSchema)(app) as any)
    .group("/donations", (app) => createCrudHandlers(donations, donationSchema, donationUpdateSchema)(app) as any)
    .group("/external-links", (app) => createCrudHandlers(externalLinks, externalLinkSchema, externalLinkUpdateSchema)(app) as any);

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
export const PATCH = app.handle;