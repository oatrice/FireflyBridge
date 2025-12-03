import React from 'react';
import { render, screen } from '@testing-library/react';
import TestReportPage from './page';
import fs from 'fs';
import path from 'path';

jest.mock('fs');
jest.mock('path');
jest.mock('./dashboard-client', () => {
    return function MockDashboardClient({ latestReport, history }: any) {
        return (
            <div data-testid="dashboard-client">
                Client Component
                <div data-testid="report-data">{JSON.stringify(latestReport)}</div>
                <div data-testid="history-data">{JSON.stringify(history)}</div>
            </div>
        );
    };
});

describe('TestReportPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
        jest.spyOn(process, 'cwd').mockReturnValue('/root');
    });

    it('renders dashboard client with data when files exist', async () => {
        const mockReport = { summary: { totalTests: 10 } };
        const mockHistory = [{ timestamp: '2023-01-01' }];

        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock)
            .mockReturnValueOnce(JSON.stringify(mockReport)) // latest-report.json
            .mockReturnValueOnce(JSON.stringify(mockHistory)); // test-history.json

        const page = await TestReportPage();
        render(page);

        expect(screen.getByTestId('dashboard-client')).toBeInTheDocument();
        expect(screen.getByTestId('report-data')).toHaveTextContent('{"summary":{"totalTests":10}}');
        expect(screen.getByTestId('history-data')).toHaveTextContent('[{"timestamp":"2023-01-01"}]');
    });

    it('renders dashboard client with empty data when files do not exist', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        const page = await TestReportPage();
        render(page);

        expect(screen.getByTestId('dashboard-client')).toBeInTheDocument();
        expect(screen.getByTestId('report-data')).toHaveTextContent('null');
        expect(screen.getByTestId('history-data')).toHaveTextContent('[]');
    });

    it('handles read errors gracefully', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockImplementation(() => {
            throw new Error('Read error');
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const page = await TestReportPage();
        render(page);

        expect(screen.getByTestId('dashboard-client')).toBeInTheDocument();
        expect(screen.getByTestId('report-data')).toHaveTextContent('null');
        expect(screen.getByTestId('history-data')).toHaveTextContent('[]');

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
