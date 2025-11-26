import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Keyword extraction utilities
const extractPhoneNumbers = (text: string): string[] => {
    // Thai phone number patterns
    const patterns = [
        /0[0-9]{1,2}[-\s]?[0-9]{3}[-\s]?[0-9]{4}/g,  // 081-234-5678 or 081 234 5678
        /0[0-9]{9}/g,                                  // 0812345678
    ];

    const phones = new Set<string>();
    patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(phone => phones.add(phone.trim()));
        }
    });

    return Array.from(phones);
};

const extractUrgencyLevel = (text: string): string => {
    const criticalKeywords = ['เร่งด่วนมาก', 'วิกฤต', 'อันตราย', 'ใกล้ตาย'];
    const highKeywords = ['เร่งด่วน', 'ด่วนมาก', 'ช่วยด้วย', 'ช่วยเร็ว'];
    const mediumKeywords = ['ด่วน', 'รีบ', 'เร็ว'];

    const lowerText = text.toLowerCase();

    if (criticalKeywords.some(kw => lowerText.includes(kw))) return 'critical';
    if (highKeywords.some(kw => lowerText.includes(kw))) return 'high';
    if (mediumKeywords.some(kw => lowerText.includes(kw))) return 'medium';

    return 'low';
};

const extractDescription = (text: string): string => {
    // Extract meaningful descriptions (sentences with numbers, people, conditions)
    const descPatterns = [
        /มี.{1,50}คน/g,           // มี...คน
        /ติด.{1,50}/g,            // ติด...
        /น้ำท่วม.{1,50}/g,        // น้ำท่วม...
        /ต้องการ.{1,50}/g,        // ต้องการ...
        /เด็ก.{1,50}/g,           // เด็ก...
        /ผู้สูงอายุ.{1,50}/g,     // ผู้สูงอายุ...
    ];

    const descriptions: string[] = [];
    descPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            descriptions.push(...matches);
        }
    });

    return descriptions.join(', ') || text.substring(0, 200);
};

const extractLocation = (text: string): string | null => {
    // Common Thai provinces and districts
    const locations = [
        'สงขลา', 'หาดใหญ่', 'บ้านพรุ', 'จะนะ', 'นาทวี', 'เทพา', 'สะบ้าย้อย',
        'กรุงเทพ', 'เชียงใหม่', 'ภูเก็ต', 'นครศรีธรรมราช', 'ตรัง', 'พัทลุง',
        'ยะลา', 'ปัตตานี', 'นราธิวาส'
    ];

    for (const loc of locations) {
        if (text.includes(loc)) {
            return loc;
        }
    }

    return null;
};

const app = new Elysia({ prefix: "/api/cases" })
    .use(cors())

    // Get all cases
    .get("/", async ({ query }) => {
        const { status, urgency } = query as { status?: string; urgency?: string };

        // Build query with filters
        if (status && urgency) {
            const cases = await sql`
        SELECT * FROM cases
        WHERE status = ${status} AND urgency_level = ${urgency}
        ORDER BY created_at DESC
      `;
            return cases;
        } else if (status) {
            const cases = await sql`
        SELECT * FROM cases
        WHERE status = ${status}
        ORDER BY created_at DESC
      `;
            return cases;
        } else if (urgency) {
            const cases = await sql`
        SELECT * FROM cases
        WHERE urgency_level = ${urgency}
        ORDER BY created_at DESC
      `;
            return cases;
        } else {
            const cases = await sql`
        SELECT * FROM cases
        ORDER BY created_at DESC
      `;
            return cases;
        }
    })

    // Add new case with auto-extraction
    .post(
        "/",
        async ({ body, set }) => {
            try {
                const { source, source_url, raw_content, latitude, longitude } = body;

                // Auto-extract information
                const extracted_phones = extractPhoneNumbers(raw_content);
                const urgency_level = extractUrgencyLevel(raw_content);
                const description = extractDescription(raw_content);
                const extracted_location = extractLocation(raw_content);

                // Insert case
                const result = await sql`
          INSERT INTO cases (
            source, source_url, raw_content,
            extracted_phones, extracted_location, latitude, longitude,
            description, urgency_level
          )
          VALUES (
            ${source}, ${source_url || null}, ${raw_content},
            ${extracted_phones}, ${extracted_location}, ${latitude || null}, ${longitude || null},
            ${description}, ${urgency_level}
          )
          RETURNING *
        `;

                set.status = 201;
                return result[0];
            } catch (error) {
                console.error('Error creating case:', error);
                set.status = 500;
                return { error: "Database error", message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
            }
        },
        {
            body: t.Object({
                source: t.String(),
                source_url: t.Optional(t.String()),
                raw_content: t.String(),
                latitude: t.Optional(t.Number()),
                longitude: t.Optional(t.Number()),
            }),
        }
    )

    // Update case status
    .put(
        "/:id",
        async ({ params, body, set }) => {
            try {
                const { status, assigned_to, notes } = body;

                const result = await sql`
          UPDATE cases
          SET 
            status = COALESCE(${status}, status),
            assigned_to = COALESCE(${assigned_to}, assigned_to),
            notes = COALESCE(${notes}, notes)
          WHERE id = ${params.id}
          RETURNING *
        `;

                if (result.length === 0) {
                    set.status = 404;
                    return { error: "Case not found" };
                }

                return result[0];
            } catch (error) {
                set.status = 500;
                return { error: "Database error" };
            }
        },
        {
            body: t.Object({
                status: t.Optional(t.String()),
                assigned_to: t.Optional(t.String()),
                notes: t.Optional(t.String()),
            }),
        }
    )

    // Delete case
    .delete("/:id", async ({ params, set }) => {
        try {
            const result = await sql`
        DELETE FROM cases
        WHERE id = ${params.id}
        RETURNING id
      `;

            if (result.length === 0) {
                set.status = 404;
                return { error: "Case not found" };
            }

            return { message: "Case deleted successfully" };
        } catch (error) {
            set.status = 500;
            return { error: "Database error" };
        }
    });

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
