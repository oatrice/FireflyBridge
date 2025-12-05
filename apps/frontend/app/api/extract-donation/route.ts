import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { image } = await req.json(); // Expect base64 image string

        if (!image) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        // Remove header if present (e.g., "data:image/jpeg;base64,")
        const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

        // Detect mime type from header if possible, default to jpeg
        const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Analyze this donation image and extract the following information in JSON format:
            - name: Organization or project name (Thai or English) - usually at the top or prominent.
            - description: Brief description of the donation purpose.
            - bankName: Bank name (e.g., KBANK, SCB, BBL) - map to standard Thai bank names if possible.
            - accountNumber: Bank account number (digits only or with separators).
            - accountName: Name of the bank account owner. Look for keywords like "ชื่อบัญชี", "Account Name", or text adjacent to the account number. It is often different from the organization name.
            - contacts: Array of contact info objects { type: "เบอร์โทรศัพท์" | "Line" | "Facebook" | "Website", value: string }

            If a field is not found, set it to null.
            Return ONLY the JSON object, no markdown formatting.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replaceAll(/```json\n?|\n?```/g, "").trim();

        try {
            const data = JSON.parse(jsonStr);
            return NextResponse.json(data);
        } catch (e) {
            console.error("JSON Parse Error:", e, "Raw Text:", text);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
    }
}
