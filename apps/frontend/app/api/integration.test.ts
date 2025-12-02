/**
 * @jest-environment node
 */
import { app } from './[[...route]]/route';

// Mock the database
jest.mock('@/db', () => {
    const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
    };
    return { db: mockDb };
});

import { db } from '@/db';

describe('API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/hotlines', () => {
        it('should return a list of hotlines', async () => {
            const mockHotlines = [{ id: 1, name: 'Hotline 1' }];
            (db.select().from as jest.Mock).mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockHotlines),
            });

            const response = await app.handle(new Request('http://localhost/api/hotlines'));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockHotlines);
        });
    });

    describe('POST /api/hotlines', () => {
        it('should create a new hotline', async () => {
            const newHotline = { name: 'New Hotline', category: 'General' };
            const createdHotline = { id: 1, ...newHotline };

            // Mock the chain: db.insert().values().returning()
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([createdHotline]),
                }),
            });

            const response = await app.handle(new Request('http://localhost/api/hotlines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHotline),
            }));

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(createdHotline);
        });
    });

    describe('PUT /api/hotlines/:id', () => {
        it('should update a hotline', async () => {
            const updateData = { name: 'Updated Hotline' };
            const updatedHotline = { id: 1, ...updateData };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updatedHotline]),
                    }),
                }),
            });

            const response = await app.handle(new Request('http://localhost/api/hotlines/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            }));

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(updatedHotline);
        });
    });

    describe('DELETE /api/hotlines/:id', () => {
        it('should delete a hotline', async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockResolvedValue({}),
            });

            const response = await app.handle(new Request('http://localhost/api/hotlines/1', {
                method: 'DELETE',
            }));

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
        });
    });

    // External Links Tests
    describe('GET /api/external-links', () => {
        it('should return a list of external links', async () => {
            const mockLinks = [{ id: 1, name: 'Link 1', url: 'http://example.com' }];
            (db.select().from as jest.Mock).mockResolvedValue(mockLinks);

            const response = await app.handle(new Request('http://localhost/api/external-links'));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockLinks);
        });
    });

    describe('POST /api/external-links', () => {
        it('should create a new external link', async () => {
            const newLink = { name: 'New Link', url: 'http://example.com' };
            const createdLink = { id: 1, ...newLink };

            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([createdLink]),
                }),
            });

            const response = await app.handle(new Request('http://localhost/api/external-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLink),
            }));

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(createdLink);
        });
    });

    describe('PUT /api/external-links/:id', () => {
        it('should update an external link', async () => {
            const updateData = { name: 'Updated Link' };
            const updatedLink = { id: 1, ...updateData };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updatedLink]),
                    }),
                }),
            });

            const response = await app.handle(new Request('http://localhost/api/external-links/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            }));

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(updatedLink);
        });
    });

    describe('DELETE /api/external-links/:id', () => {
        it('should delete an external link', async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockResolvedValue({}),
            });

            const response = await app.handle(new Request('http://localhost/api/external-links/1', {
                method: 'DELETE',
            }));

            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ success: true });
        });
    });
});
