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

        const data = (await response.json()) as any[];
        expect(data).toBeArray();
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toHaveProperty("number");
        expect(data[0]).toHaveProperty("name");

        // Check specific known data
        const police = data.find((h: any) => h.number === "191");
        expect(police).toBeDefined();
        expect(police.name).toBe("เหตุด่วนเหตุร้าย");
    });

    it("GET /external-links returns 200 and list of external links", async () => {
        const response = await app.handle(new Request("http://localhost/external-links"));
        expect(response.status).toBe(200);

        const data = (await response.json()) as any[];
        expect(data).toBeArray();
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toHaveProperty("url");
        expect(data[0]).toHaveProperty("name");

        // Check specific known data
        const jitasa = data.find((link: any) => link.name === "Jitasa Care");
        expect(jitasa).toBeDefined();
        expect(jitasa.url).toBe("https://jitasa.care/");
    });

    it("GET /shelters returns 200 and list of shelters", async () => {
        const response = await app.handle(new Request("http://localhost/shelters"));
        expect(response.status).toBe(200);

        const data = (await response.json()) as any[];
        expect(data).toBeArray();
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toHaveProperty("name");
        expect(data[0]).toHaveProperty("contacts");

        // Check specific known data
        const psu = data.find((s: any) => s.name.includes("มหาวิทยาลัยสงขลานครินทร์"));
        expect(psu).toBeDefined();
        expect(psu.contacts).toBeArray();
        expect(psu.contacts.length).toBeGreaterThan(0);
    });
});
