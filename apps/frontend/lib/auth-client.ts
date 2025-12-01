import { createAuthClient } from "better-auth/react";

import { emailOTPClient, phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [
        emailOTPClient(),
        phoneNumberClient(),
    ],
    baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
});
