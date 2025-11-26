import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { neon } from "@neondatabase/serverless";

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL!);

// Helper function to normalize phone numbers
const normalizePhone = (phone: string): string => {
    return phone.replace(/[\s\-()]/g, "");
};

const app = new Elysia({ prefix: "/api/rescue-contacts" })
    .use(cors())

    // Get all rescue contacts
    .get("/", async () => {
        const contacts = await sql`
      SELECT id, name, phone, type, area, notes, created_at
      FROM rescue_contacts
      ORDER BY created_at DESC
    `;
        return contacts;
    })

    // Add new rescue contact
    .post(
        "/",
        async ({ body, set }) => {
            try {
                // Check for duplicate (using normalized phone)
                const normalized = normalizePhone(body.phone);
                const existing = await sql`
          SELECT id FROM rescue_contacts
          WHERE REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '()', '') = ${normalized}
        `;

                if (existing.length > 0) {
                    set.status = 400;
                    return {
                        error: "Duplicate phone number",
                        message: `เบอร์โทรศัพท์ ${body.phone} มีอยู่ในระบบแล้ว`,
                    };
                }

                // Insert new contact
                const result = await sql`
          INSERT INTO rescue_contacts (name, phone, type, area, notes)
          VALUES (${body.name}, ${body.phone}, ${body.type}, ${body.area}, ${body.notes || ""})
          RETURNING id, name, phone, type, area, notes, created_at
        `;

                set.status = 201;
                return result[0];
            } catch (error) {
                set.status = 500;
                return { error: "Database error", message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
            }
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
    .delete("/:id", async ({ params, set }) => {
        try {
            const result = await sql`
        DELETE FROM rescue_contacts
        WHERE id = ${params.id}
        RETURNING id, name, phone
      `;

            if (result.length === 0) {
                set.status = 404;
                return { error: "Contact not found" };
            }

            return { message: "Contact deleted", contact: result[0] };
        } catch (error) {
            set.status = 500;
            return { error: "Database error" };
        }
    });

export const GET = app.handle;
export const POST = app.handle;
export const DELETE = app.handle;
