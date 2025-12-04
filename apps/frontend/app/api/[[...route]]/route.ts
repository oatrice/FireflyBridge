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
            const newItem = await db.insert(table).values(body).returning() as any[];
            return newItem[0];
        }, { body: schema })
        .put("/:id", async ({ params: { id }, body }: { params: { id: string }, body: any }) => {
            const updatedItem = await db.update(table)
                .set({ ...body, updatedAt: new Date() })
                .where(eq(table.id, Number.parseInt(id)))
                .returning() as any[];
            return updatedItem[0];
        }, { body: updateSchema })
        .delete("/:id", async ({ params: { id } }: { params: { id: string } }) => {
            await db.delete(table).where(eq(table.id, Number.parseInt(id)));
            return { success: true };
        });
};

const contactSchema = t.Object({
    name: t.String(),
    phone: t.String(),
    type: t.Optional(t.String())
});

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

const hotlineUpdateSchema = t.Partial(hotlineSchema);

const shelterSchema = t.Object({
    name: t.String(),
    location: t.String(),
    status: t.String(),
    contacts: t.Optional(t.Array(contactSchema)),
    area: t.Optional(t.String()),
    icon: t.Optional(t.String()),
    link: t.Optional(t.String())
});

const shelterUpdateSchema = t.Partial(shelterSchema);

const donationSchema = t.Object({
    name: t.String(),
    bankName: t.Optional(t.String()),
    accountNumber: t.Optional(t.String()),
    accountName: t.Optional(t.String()),
    description: t.Optional(t.String()),
    qrCodeUrl: t.Optional(t.String()),
    contacts: t.Optional(t.Array(contactSchema)),
    donationPoints: t.Optional(t.Array(t.String())),
    acceptsMoney: t.Optional(t.Boolean()),
    bankAccounts: t.Optional(t.Array(t.Object({
        bankName: t.String(),
        accountNumber: t.String(),
        accountName: t.String()
    }))),
    images: t.Optional(t.Array(t.String()))
});

const donationUpdateSchema = t.Partial(donationSchema);

const externalLinkSchema = t.Object({
    name: t.String(),
    url: t.String(),
    description: t.Optional(t.String()),
    category: t.Optional(t.String()),
    icon: t.Optional(t.String())
});

const externalLinkUpdateSchema = t.Partial(externalLinkSchema);

export const app = new Elysia({ prefix: "/api" })
    .use(cors())
    .get("/", () => "FireflyBridge API is Running 🚀")
    .group("/hotlines", (app) => createCrudHandlers(hotlines, hotlineSchema, hotlineUpdateSchema)(app))
    .group("/shelters", (app) => createCrudHandlers(shelters, shelterSchema, shelterUpdateSchema)(app))
    .group("/donations", (app) => createCrudHandlers(donations, donationSchema, donationUpdateSchema)(app))
    .group("/external-links", (app) => createCrudHandlers(externalLinks, externalLinkSchema, externalLinkUpdateSchema)(app));

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
export const PATCH = app.handle;