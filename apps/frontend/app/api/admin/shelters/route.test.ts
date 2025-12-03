import { GET, POST, PUT, DELETE } from './route';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: jest.fn(),
        },
    },
}));

jest.mock('@/db', () => ({
    db: {
        select: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('next/headers', () => ({
    headers: jest.fn(),
}));

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data, options) => ({ data, options, status: options?.status || 200 })),
    },
}));

// Polyfill Request
class MockRequest {
    url: string;
    method: string;
    bodyData: any;

    constructor(url: string, options: any = {}) {
        this.url = url;
        this.method = options.method || 'GET';
        this.bodyData = options.body ? JSON.parse(options.body) : {};
    }

    async json() {
        return this.bodyData;
    }
}
global.Request = MockRequest as any;

describe('Shelters API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('returns 401 if not admin', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue(null);
            const response = await GET();
            expect(response.status).toBe(401);
        });

        it('returns shelters if admin', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue({ user: { role: 'admin' } });
            const mockData = [{ id: 1, name: 'Test Shelter' }];
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    orderBy: jest.fn().mockResolvedValue(mockData),
                }),
            });

            const response = await GET();
            expect(response.status).toBe(200);
            expect(response.data).toEqual(mockData);
        });

        it('returns 500 on error', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue({ user: { role: 'admin' } });
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    orderBy: jest.fn().mockRejectedValue(new Error('DB Error')),
                }),
            });

            const response = await GET();
            expect(response.status).toBe(500);
        });
    });

    describe('POST', () => {
        it('returns 401 if not admin', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue(null);
            const req = new Request('http://localhost', { method: 'POST' });
            const response = await POST(req);
            expect(response.status).toBe(401);
        });

        it('creates shelter if admin', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue({ user: { role: 'admin' } });
            const mockShelter = { id: 1, name: 'New Shelter' };
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockShelter]),
                }),
            });

            const req = new Request('http://localhost', {
                method: 'POST',
                body: JSON.stringify({ name: 'New Shelter' }),
            });
            const response = await POST(req);
            expect(response.status).toBe(200);
            expect(response.data).toEqual(mockShelter);
        });
    });

    describe('PUT', () => {
        it('returns 401 if not admin', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue(null);
            const req = new Request('http://localhost', { method: 'PUT' });
            const response = await PUT(req);
            expect(response.status).toBe(401);
        });

        it('updates shelter if admin', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue({ user: { role: 'admin' } });
            const mockShelter = { id: 1, name: 'Updated Shelter' };
            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([mockShelter]),
                    }),
                }),
            });

            const req = new Request('http://localhost', {
                method: 'PUT',
                body: JSON.stringify({ id: 1, name: 'Updated Shelter' }),
            });
            const response = await PUT(req);
            expect(response.status).toBe(200);
            expect(response.data).toEqual(mockShelter);
        });

        it('returns 400 if id missing', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue({ user: { role: 'admin' } });
            const req = new Request('http://localhost', {
                method: 'PUT',
                body: JSON.stringify({ name: 'Updated Shelter' }),
            });
            const response = await PUT(req);
            expect(response.status).toBe(400);
        });
    });

    describe('DELETE', () => {
        it('returns 401 if not admin', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue(null);
            const req = new Request('http://localhost', { method: 'DELETE' });
            const response = await DELETE(req);
            expect(response.status).toBe(401);
        });

        it('deletes shelter if admin', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue({ user: { role: 'admin' } });
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockResolvedValue({}),
            });

            const req = new Request('http://localhost?id=1', { method: 'DELETE' });
            const response = await DELETE(req);
            expect(response.status).toBe(200);
        });

        it('returns 400 if id missing', async () => {
            (auth.api.getSession as jest.Mock).mockResolvedValue({ user: { role: 'admin' } });
            const req = new Request('http://localhost', { method: 'DELETE' });
            const response = await DELETE(req);
            expect(response.status).toBe(400);
        });
    });
});
