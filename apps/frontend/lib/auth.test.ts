import { betterAuth } from "better-auth";
import { emailOTP, phoneNumber } from "better-auth/plugins";

// Mock dependencies
jest.mock("dotenv", () => ({
    config: jest.fn(),
}));

jest.mock("better-auth", () => ({
    betterAuth: jest.fn(),
}));

jest.mock("better-auth/plugins", () => ({
    emailOTP: jest.fn(),
    phoneNumber: jest.fn(),
}));

jest.mock("better-auth/adapters/drizzle", () => ({
    drizzleAdapter: jest.fn(),
}));

jest.mock("@neondatabase/serverless", () => ({
    Pool: jest.fn(),
}));

jest.mock("drizzle-orm/neon-serverless", () => ({
    drizzle: jest.fn(),
}));

jest.mock("@/db/schema", () => ({}));

describe("Auth Configuration", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, DATABASE_URL: "postgres://test:test@localhost:5432/test" };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("initializes betterAuth with correct configuration", async () => {
        // We need to require the file to trigger the execution
        jest.isolateModules(() => {
            require("./auth");
        });

        expect(betterAuth).toHaveBeenCalled();

        const config = (betterAuth as jest.Mock).mock.calls[0][0];
        expect(config.baseURL).toBeDefined();
        expect(config.emailAndPassword).toEqual({ enabled: true });
        expect(config.socialProviders).toBeDefined();
    });

    it("initializes plugins", () => {
        jest.isolateModules(() => {
            require("./auth");
        });

        expect(emailOTP).toHaveBeenCalled();
        expect(phoneNumber).toHaveBeenCalled();
    });

    it("phoneNumber plugin has correct signUpOnVerification logic", () => {
        jest.isolateModules(() => {
            require("./auth");
        });

        const phoneNumberConfig = (phoneNumber as jest.Mock).mock.calls[0][0];
        expect(phoneNumberConfig.signUpOnVerification).toBeDefined();

        const { getTempEmail, getTempName } = phoneNumberConfig.signUpOnVerification;

        expect(getTempEmail("+66812345678")).toBe("66812345678@temp.firefly-bridge.app");
        expect(getTempName("+66812345678")).toBe("User +66812345678");
    });
});
