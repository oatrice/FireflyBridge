import { GET } from './route';
import { db } from '@/db';
import { NextResponse } from 'next/server';

// Mock the db module
jest.mock('@/db', () => ({
    db: {
        select: jest.fn(),
    },
}));

// Mock NextResponse
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn(),
    },
}));

describe('GET /api/banks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a list of banks', async () => {
        const mockBanks = [
            { id: 1, value: 'kbank', label: 'Kasikorn Bank' },
            { id: 2, value: 'scb', label: 'Siam Commercial Bank' },
        ];

        // Setup the mock chain
        const mockFrom = jest.fn().mockResolvedValue(mockBanks);
        (db.select as jest.Mock).mockReturnValue({
            from: mockFrom,
        });

        await GET();

        expect(db.select).toHaveBeenCalled();
        expect(mockFrom).toHaveBeenCalled();
        expect(NextResponse.json).toHaveBeenCalledWith(mockBanks);
    });

    it('should handle errors', async () => {
        const error = new Error('Database error');
        const mockFrom = jest.fn().mockRejectedValue(error);
        (db.select as jest.Mock).mockReturnValue({
            from: mockFrom,
        });

        // Mock console.error to avoid polluting test output
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        await GET();

        expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch banks:', error);
        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Failed to fetch banks' },
            { status: 500 }
        );

        consoleSpy.mockRestore();
    });
});
