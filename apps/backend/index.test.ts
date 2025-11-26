import { describe, expect, it } from "bun:test";
import { app } from "./index";

describe("FireflyBridge Backend", () => {
    it("GET / returns 200 and welcome message", async () => {
        const response = await app.handle(new Request("http://localhost/"));
        expect(response.status).toBe(200);
        expect(await response.text()).toBe("FireflyBridge Backend is Running 🚀");
    });

    it("GET /hotlines returns 200 and list of hotlines", async () => {
        const response = await app.handle(new Request("http://localhost/hotlines"));
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toBeArray();
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toHaveProperty("number");
        expect(data[0]).toHaveProperty("name");

        // Check specific known data
        const police = data.find((h: any) => h.number === "191");
        expect(police).toBeDefined();
        expect(police.name).toBe("เหตุด่วนเหตุร้าย");
    });
});
