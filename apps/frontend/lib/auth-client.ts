import { createAuthClient } from "better-auth/react";
// @ts-ignore - better-auth v1.4.4 has this export but types might not be fully resolved
import { emailOTPClient, phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [
        emailOTPClient(),
        phoneNumberClient(),
    ],
    baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
});

