import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const hotlines = [
    {
        id: "1",
        name: "เหตุด่วนเหตุร้าย",
        number: "191",
        category: "Emergency",
        description: "แจ้งเหตุด่วนเหตุร้าย ตำรวจ",
        color: "bg-red-500"
    },
    {
        id: "2",
        name: "เจ็บป่วยฉุกเฉิน",
        number: "1669",
        category: "Medical",
        description: "สถาบันการแพทย์ฉุกเฉินแห่งชาติ",
        color: "bg-pink-500"
    },
    {
        id: "3",
        name: "ดับเพลิง/สัตว์ร้าย",
        number: "199",
        category: "Fire",
        description: "แจ้งเหตุไฟไหม้ หรือสัตว์มีพิษเข้าบ้าน",
        color: "bg-orange-500"
    },
    {
        id: "4",
        name: "ตำรวจทางหลวง",
        number: "1193",
        category: "Traffic",
        description: "แจ้งอุบัติเหตุบนทางหลวง",
        color: "bg-yellow-600"
    },
    {
        id: "5",
        name: "กรมเจ้าท่า",
        number: "1199",
        category: "Water",
        description: "แจ้งเหตุทางน้ำ",
        color: "bg-blue-500"
    },
    {
        id: "6",
        name: "การไฟฟ้าส่วนภูมิภาค",
        number: "1129",
        category: "Utility",
        description: "แจ้งไฟฟ้าขัดข้อง (ตจว.)",
        color: "bg-purple-500"
    }
];

const app = new Elysia()
    .use(cors())
    .get("/", () => "FireflyBridge Backend is Running 🚀")
    .get("/hotlines", () => hotlines)
    .listen(3001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);