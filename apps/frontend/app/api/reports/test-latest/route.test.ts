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

describe('Test Latest Report API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
        jest.spyOn(process, 'cwd').mockReturnValue('/root');
    });

    it('returns report data when file exists', async () => {
        const mockReport = { summary: { totalTests: 10 } };
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockReport));

        const response = await GET();
        expect(response.status).toBe(200);
        expect(response.data).toEqual(mockReport);
    });

    it('returns 404 when file does not exist', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        const response = await GET();
        expect(response.status).toBe(404);
        expect(response.data).toEqual({ error: 'No test report found. Please run tests first.' });
    });

    it('returns 500 on error', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockImplementation(() => {
            throw new Error('Read error');
        });

        const response = await GET();
        expect(response.status).toBe(500);
        expect(response.data).toEqual({ error: 'Failed to read test report' });
    });
});
