import React from 'react';
import fs from 'fs';
import path from 'path';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

async function getTestReports() {
    const reportDir = path.join(process.cwd(), 'test-reports');
    const latestReportPath = path.join(reportDir, 'latest-report.json');
    const historyPath = path.join(reportDir, 'test-history.json');

    let latestReport = null;
    let history = [];

    try {
        if (fs.existsSync(latestReportPath)) {
            const fileContent = fs.readFileSync(latestReportPath, 'utf8');
            latestReport = JSON.parse(fileContent);
        }
    } catch (error) {
        console.error('Error reading latest report:', error);
    }

    try {
        if (fs.existsSync(historyPath)) {
            const fileContent = fs.readFileSync(historyPath, 'utf8');
            history = JSON.parse(fileContent);
        }
    } catch (error) {
        console.error('Error reading history:', error);
    }

    return { latestReport, history };
}

export default async function TestReportPage() {
    const { latestReport, history } = await getTestReports();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">QA Test Dashboard</h1>
                <p className="text-gray-500 mt-1">
                    Monitor test results, coverage, and trends.
                </p>
            </div>

            <DashboardClient latestReport={latestReport} history={history} />
        </div>
    );
}
