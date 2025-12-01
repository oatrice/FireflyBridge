import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Read from the root test-reports directory
        const historyPath = path.join(process.cwd(), 'test-reports', 'test-history.json');

        if (!fs.existsSync(historyPath)) {
            return NextResponse.json([]);
        }

        const historyData = fs.readFileSync(historyPath, 'utf8');
        const history = JSON.parse(historyData);

        return NextResponse.json(history);
    } catch (error) {
        console.error('Error reading test history:', error);
        return NextResponse.json(
            { error: 'Failed to read test history' },
            { status: 500 }
        );
    }
}
