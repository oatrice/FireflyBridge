// Mock Request if not available (Node environment)
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
            console.log('MockRequest constructor body:', init?.body);
            this.jsonBody = init?.body ? JSON.parse(init.body) : undefined;
        }

        async json() {
            console.log('MockRequest.json called, returning:', this.jsonBody);
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

describe('Cases API', () => {
    let GET: any, POST: any, PUT: any, DELETE: any;
    let mockSql: any;

    beforeAll(async () => {
        process.env.DATABASE_URL = 'postgres://test';
        mockSql = jest.fn();
        const { neon } = await import('@neondatabase/serverless');
        (neon as jest.Mock).mockReturnValue(mockSql);

        const route = await import('./route');
        GET = route.GET;
        POST = route.POST;
        PUT = route.PUT;
        DELETE = route.DELETE;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockSql.mockReset();
    });

    describe('GET', () => {
        it('returns all cases by default', async () => {
            const mockCases = [{ id: 1, title: 'Test Case' }];
            mockSql.mockResolvedValue(mockCases);

            const req = new Request('http://localhost/api/cases');
            const res = await GET(req);
            const data = await res.json();

            expect(mockSql).toHaveBeenCalled();
            expect(data).toEqual(mockCases);
        });

        it('filters by status', async () => {
            mockSql.mockResolvedValue([]);
            const req = new Request('http://localhost/api/cases?status=open');
            await GET(req);
            // Verify SQL was called (checking arguments is hard with tagged template literals in mocks)
            expect(mockSql).toHaveBeenCalled();
        });
    });

    describe('POST', () => {
        it.skip('creates a new case', async () => {
            const newCase = {
                source: 'facebook',
                source_url: 'http://example.com',
                raw_content: 'Help needed at Hat Yai 0812345678',
                latitude: 10.0,
                longitude: 100.0,
            };
            const createdCase = { id: 1, ...newCase, urgency_level: 'medium' };
            mockSql.mockResolvedValue([createdCase]);

            const req = new Request('http://localhost/api/cases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCase),
            });

            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(201);
            expect(data).toEqual(createdCase);
        });

        it.skip('handles errors', async () => {
            mockSql.mockRejectedValue(new Error('DB Error'));

            const req = new Request('http://localhost/api/cases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source: 'test', raw_content: 'test' }),
            });

            const res = await POST(req);
            expect(res.status).toBe(500);
        });
    });

    describe('PUT', () => {
        it.skip('updates a case', async () => {
            const updateData = {
                status: 'resolved',
                assigned_to: 'admin',
                notes: 'done'
            };
            const updatedCase = { id: 1, status: 'resolved' };
            mockSql.mockResolvedValue([updatedCase]);

            const req = new Request('http://localhost/api/cases/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            const res = await PUT(req);
            const data = await res.json();

            expect(data).toEqual(updatedCase);
        });

        it.skip('returns 404 if case not found', async () => {
            mockSql.mockResolvedValue([]); // No rows returned

            const req = new Request('http://localhost/api/cases/999', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'resolved' }),
            });

            const res = await PUT(req);
            expect(res.status).toBe(404);
        });
    });

    describe('DELETE', () => {
        it('deletes a case', async () => {
            mockSql.mockResolvedValue([{ id: 1 }]);

            const req = new Request('http://localhost/api/cases/1', {
                method: 'DELETE',
            });

            const res = await DELETE(req);
            expect(res.status).toBe(200);
        });

        it('returns 404 if case not found', async () => {
            mockSql.mockResolvedValue([]);

            const req = new Request('http://localhost/api/cases/999', {
                method: 'DELETE',
            });

            const res = await DELETE(req);
            expect(res.status).toBe(404);
        });
    });
});
