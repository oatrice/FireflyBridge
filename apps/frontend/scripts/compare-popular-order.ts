import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import { eq, asc } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// Expected order from JSON (based on categories: ["ยอดฮิต"])
const expectedPopularOrder = [
    "เหตุด่วนเหตุร้าย",
    "เจ็บป่วยฉุกเฉิน",
    "ดับเพลิง/สัตว์ร้าย",
    "ป่อเต็กตึ๊ง",
    "ศูนย์ช่วยเหลือสังคม",
    "ตำรวจทางหลวง",
    "กรมเจ้าท่า",
    "ศูนย์ ปภ. (สายด่วน)",
    "สำนักงาน ปภ.",
    "กู้ภัยหาดใหญ่",
    "พี่ๆ ทหาร (กอ.รมน.)",
    "เทศบาลนครหาดใหญ่",
    "ปภ. จังหวัดสงขลา",
    "พมจ. สงขลา",
    "มูลนิธิร่วมกตัญญู",
    "สภากาชาดไทย",
    "มูลนิธิองค์กรทำดี (บุ๋ม ปนัดดา)",
    "โครงการพลังน้ำใจ/โรงครัวเปิ้ล นาคร",
    "มูลนิธิใจถึงใจ (ฝันดี-ฝันเด่น)",
    "มูลนิธิกระจกเงา",
    "กันจอมพลังช่วยสู้",
    "มูลนิธิเพื่อการส่งเสริมและพัฒนาสังคม",
    "ศูนย์ปฏิบัติการช่วยเหลือผู้ประสบอุทกภัย (ศปภ.)",
    "ศูนย์บรรเทาสาธารณภัย กองทัพเรือ"
];

async function comparePopularOrder() {
    console.log("🔍 Comparing Popular Hotlines Order...\n");

    try {
        const popularHotlines = await db
            .select()
            .from(schema.hotlines)
            .where(eq(schema.hotlines.isPopular, true))
            .orderBy(asc(schema.hotlines.displayOrder));

        console.log(`Database has ${popularHotlines.length} popular hotlines`);
        console.log(`Expected JSON has ${expectedPopularOrder.length} popular hotlines\n`);

        let allMatch = true;
        let mismatches = [];

        for (let i = 0; i < Math.max(popularHotlines.length, expectedPopularOrder.length); i++) {
            const dbName = popularHotlines[i]?.name || "❌ MISSING";
            const expectedName = expectedPopularOrder[i] || "❌ EXTRA IN DB";
            const match = dbName === expectedName;

            if (!match) {
                allMatch = false;
                mismatches.push({
                    position: i + 1,
                    expected: expectedName,
                    actual: dbName
                });
            }

            const icon = match ? "✅" : "❌";
            console.log(`${icon} [${i + 1}] DB: "${dbName}" | Expected: "${expectedName}"`);
        }

        console.log("\n" + "=".repeat(80));

        if (allMatch) {
            console.log("\n🎉 PERFECT MATCH! Database order matches JSON exactly!\n");
        } else {
            console.log(`\n⚠️  Found ${mismatches.length} mismatch(es):\n`);
            mismatches.forEach(m => {
                console.log(`Position ${m.position}:`);
                console.log(`  Expected: ${m.expected}`);
                console.log(`  Actual:   ${m.actual}\n`);
            });
        }

    } catch (error) {
        console.error("❌ Error comparing order:", error);
    }

    process.exit(0);
}

comparePopularOrder();
