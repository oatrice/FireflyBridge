import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Read from the root test-reports directory
        const reportPath = path.join(process.cwd(), 'test-reports', 'latest-report.json');

        if (!fs.existsSync(reportPath)) {
            return NextResponse.json(
                { error: 'No test report found. Please run tests first.' },
                { status: 404 }
            );
        }

        const reportData = fs.readFileSync(reportPath, 'utf8');
        const report = JSON.parse(reportData);

        return NextResponse.json(report);
    } catch (error) {
        console.error('Error reading test report:', error);
        return NextResponse.json(
            { error: 'Failed to read test report' },
            { status: 500 }
        );
    }
}
