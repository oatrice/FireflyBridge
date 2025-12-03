// Mock Request if not available
if (!global.Request) {
    class MockRequest {
        url: string;
        method: string;
        headers: Headers;
        body: any;
        jsonBody: any;

        constructor(url: string, init?: any) {
            this.url = url;
            this.method = init?.method || 'GET';
            this.headers = new Headers(init?.headers);
            this.jsonBody = init?.body ? JSON.parse(init.body) : undefined;
        }

        async json() {
            return this.jsonBody;
        }

        async text() {
            return JSON.stringify(this.jsonBody);
        }
    }
    global.Request = MockRequest as any;
    global.Headers = class extends Map {
        constructor(init?: any) {
            super();
            if (init) {
                const entries = init && typeof init === 'object' && !Array.isArray(init) && !(init instanceof Map)
                    ? Object.entries(init)
                    : init;

                if (entries) {
                    for (const [k, v] of entries) {
                        this.set(k, v);
                    }
                }
            }
        }
        set(key: string, value: string) {
            super.set(key.toLowerCase(), value);
            return this;
        }
        get(key: string) {
            return super.get(key.toLowerCase()) || null;
        }
        has(key: string) {
            return super.has(key.toLowerCase());
        }
        delete(key: string) {
            return super.delete(key.toLowerCase());
        }
        append(key: string, value: string) {
            this.set(key, value);
        }
        forEach(callback: any) {
            super.forEach(callback);
        }
    } as any;
}

if (!global.Response) {
    class MockResponse {
        body: any;
        init: any;
        status: number;
        headers: Headers;

        constructor(body?: any, init?: any) {
            this.body = body;
            this.init = init;
            this.status = init?.status || 200;
            this.headers = new Headers(init?.headers);
        }

        async json() {
            return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
        }

        async text() {
            return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
        }
    }
    global.Response = MockResponse as any;
}

// Mock database module
jest.mock('@neondatabase/serverless', () => ({
    neon: jest.fn(),
}));

describe('Rescue Contacts API', () => {
    let GET: any, POST: any, DELETE: any;
    let mockSql: any;

    beforeAll(async () => {
        process.env.DATABASE_URL = 'postgres://test';
        mockSql = jest.fn();
        const { neon } = await import('@neondatabase/serverless');
        (neon as jest.Mock).mockReturnValue(mockSql);

        const route = await import('./route');
        GET = route.GET;
        POST = route.POST;
        DELETE = route.DELETE;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockSql.mockReset();
    });

    describe('GET', () => {
        it('returns all contacts', async () => {
            const mockContacts = [{ id: 1, name: 'Rescue Team' }];
            mockSql.mockResolvedValue(mockContacts);

            const req = new Request('http://localhost/api/rescue-contacts');
            const res = await GET(req);
            const data = await res.json();

            expect(mockSql).toHaveBeenCalled();
            expect(data).toEqual(mockContacts);
        });
    });

    describe('POST', () => {
        it.skip('creates a new contact', async () => {
            const newContact = {
                name: 'New Rescue',
                phone: '0812345678',
                type: 'foundation',
                area: 'Bangkok',
                notes: 'Test notes',
            };

            // First call checks for duplicates (returns empty)
            // Second call inserts (returns new contact)
            mockSql
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: 1, ...newContact }]);

            const req = new Request('http://localhost/api/rescue-contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContact),
            });

            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(201);
            expect(data).toEqual(expect.objectContaining(newContact));
        });

        it.skip('returns 400 for duplicate phone', async () => {
            const contact = {
                name: 'Duplicate',
                phone: '0812345678',
                type: 'foundation',
                area: 'Bangkok',
                notes: 'Test notes',
            };

            // Check returns existing id
            mockSql.mockResolvedValueOnce([{ id: 1 }]);

            const req = new Request('http://localhost/api/rescue-contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contact),
            });

            const res = await POST(req);
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.error).toBe('Duplicate phone number');
        });
    });

    describe('DELETE', () => {
        it('deletes a contact', async () => {
            mockSql.mockResolvedValue([{ id: 1, name: 'Deleted' }]);

            const req = new Request('http://localhost/api/rescue-contacts/1', {
                method: 'DELETE',
            });

            const res = await DELETE(req);
            expect(res.status).toBe(200);
        });

        it('returns 404 if contact not found', async () => {
            mockSql.mockResolvedValue([]);

            const req = new Request('http://localhost/api/rescue-contacts/999', {
                method: 'DELETE',
            });

            const res = await DELETE(req);
            expect(res.status).toBe(404);
        });
    });
});
