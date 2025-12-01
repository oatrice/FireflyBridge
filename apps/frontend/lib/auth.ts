import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@/db/schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
}

console.log("[Better Auth] DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50) + "...");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema, logger: true });

import { emailOTP, phoneNumber } from "better-auth/plugins";

export const auth = betterAuth({
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                // TODO: Implement actual email sending (e.g., via Resend, Nodemailer, etc.)
                console.log(`\n\n[DEV ONLY] Email OTP for ${email}: ${otp}\n\n`);
            },
        }),
        phoneNumber({
            async sendOTP({ phoneNumber, code }) {
                // TODO: Implement actual SMS sending (e.g., via Twilio, AWS SNS, etc.)
                console.log(`\n\n[DEV ONLY] SMS OTP for ${phoneNumber}: ${code}\n\n`);
            },
            signUpOnVerification: {
                getTempEmail: (phoneNumber: string) => {
                    // Generate temporary email from phone number
                    return `${phoneNumber.replace(/\+/g, '')}@temp.firefly-bridge.app`;
                },
                getTempName: (phoneNumber: string) => {
                    // Use phone number as temporary name
                    return `User ${phoneNumber}`;
                },
            },
        }),
    ],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: [
        "http://localhost:3000",
        "https://firefly-bridge-frontend-git-develop-anirut-teerabuts-projects.vercel.app",
        "https://firefly-bridge.vercel.app",
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
        process.env.NEXT_PUBLIC_APP_URL || "",
    ].filter(Boolean),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
            },
            phoneNumber: {
                type: "string",
                required: false,
            },
            phoneNumberVerified: {
                type: "boolean",
                required: false,
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        line: {
            clientId: process.env.LINE_CLIENT_ID!,
            clientSecret: process.env.LINE_CLIENT_SECRET!,
        },
    },
});
