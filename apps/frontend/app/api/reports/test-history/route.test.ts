import { GET } from './route';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

jest.mock('fs');
jest.mock('path');
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data, options) => ({ data, options, status: options?.status || 200 })),
    },
}));

describe('Test History API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
        jest.spyOn(process, 'cwd').mockReturnValue('/root');
    });

    it('returns history data when file exists', async () => {
        const mockHistory = [{ timestamp: '2023-01-01', totalTests: 10 }];
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockHistory));

        const response = await GET();
        expect(response.status).toBe(200);
        expect(response.data).toEqual(mockHistory);
    });

    it('returns empty array when file does not exist', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        const response = await GET();
        expect(response.status).toBe(200);
        expect(response.data).toEqual([]);
    });

    it('returns 500 on error', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockImplementation(() => {
            throw new Error('Read error');
        });

        const response = await GET();
        expect(response.status).toBe(500);
        expect(response.data).toEqual({ error: 'Failed to read test history' });
    });
});
