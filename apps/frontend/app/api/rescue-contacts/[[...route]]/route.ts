import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";

// In-memory storage for rescue contacts
let rescueContacts: Array<{
    id: string;
    name: string;
    phone: string;
    type: string;
    area: string;
    notes: string;
    createdAt: string;
}> = [];

// Helper function to normalize phone numbers
const normalizePhone = (phone: string): string => {
    return phone.replace(/[\s\-()]/g, "");
};

// Helper function to check for duplicates
const isDuplicate = (phone: string): boolean => {
    const normalized = normalizePhone(phone);
    return rescueContacts.some(
        (contact) => normalizePhone(contact.phone) === normalized
    );
};

const app = new Elysia({ prefix: "/api/rescue-contacts" })
    .use(cors())
    // Get all rescue contacts
    .get("/", () => rescueContacts)

    // Add new rescue contact
    .post(
        "/",
        ({ body, set }) => {
            // Check for duplicate
            if (isDuplicate(body.phone)) {
                set.status = 400;
                return {
                    error: "Duplicate phone number",
                    message: `เบอร์โทรศัพท์ ${body.phone} มีอยู่ในระบบแล้ว`,
                };
            }

            const newContact = {
                id: Date.now().toString(),
                name: body.name,
                phone: body.phone,
                type: body.type,
                area: body.area,
                notes: body.notes || "",
                createdAt: new Date().toISOString(),
            };

            rescueContacts.push(newContact);
            set.status = 201;
            return newContact;
        },
        {
            body: t.Object({
                name: t.String(),
                phone: t.String(),
                type: t.String(),
                area: t.String(),
                notes: t.Optional(t.String()),
            }),
        }
    )

    // Delete rescue contact
    .delete("/:id", ({ params, set }) => {
        const index = rescueContacts.findIndex((c) => c.id === params.id);

        if (index === -1) {
            set.status = 404;
            return { error: "Contact not found" };
        }

        const deleted = rescueContacts.splice(index, 1)[0];
        return { message: "Contact deleted", contact: deleted };
    });

export const GET = app.handle;
export const POST = app.handle;
export const DELETE = app.handle;
