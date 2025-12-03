import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardClient from './dashboard-client';

const mockLatestReport = {
    summary: {
        totalTests: 10,
        passed: 8,
        failed: 2,
        skipped: 0,
        passRate: '80.0',
        totalDuration: 5000,
        timestamp: '2023-01-01T00:00:00Z',
    },
    coverage: {
        lines: 91,
        statements: 92,
        functions: 83,
        branches: 74,
    },
    testResults: [
        {
            file: 'test1.ts',
            testName: 'Test 1',
            status: 'passed',
            duration: 100,
            failureMessages: [],
            timestamp: '2023-01-01T00:00:00Z',
        },
        {
            file: 'test2.ts',
            testName: 'Test 2',
            status: 'failed',
            duration: 200,
            failureMessages: ['Error message'],
            timestamp: '2023-01-01T00:00:00Z',
        },
    ],
    failedTests: [],
    testFiles: [],
};

const mockHistory = [
    {
        timestamp: '2023-01-01T00:00:00Z',
        totalTests: 10,
        passed: 8,
        failed: 2,
        skipped: 0,
        passRate: '80.0',
        duration: 5000,
        coverage: {
            lines: 90,
            statements: 90,
            functions: 80,
            branches: 70,
        },
    },
];

describe('DashboardClient', () => {
    it('renders no data message when latestReport is null', () => {
        render(<DashboardClient latestReport={null} history={[]} />);
        expect(screen.getByText(/ไม่พบข้อมูลรายงานการทดสอบ/i)).toBeInTheDocument();
    });

    it('renders summary cards correctly', () => {
        render(<DashboardClient latestReport={mockLatestReport as any} history={mockHistory} />);
        expect(screen.getByText('10')).toBeInTheDocument(); // Total tests
        expect(screen.getByText('8')).toBeInTheDocument(); // Passed
        expect(screen.getByText('2')).toBeInTheDocument(); // Failed
        expect(screen.getByText('5.00s')).toBeInTheDocument(); // Duration
    });

    it('renders coverage chart and stats', () => {
        render(<DashboardClient latestReport={mockLatestReport as any} history={mockHistory} />);
        expect(screen.getByText('Code Coverage')).toBeInTheDocument();
        expect(screen.getByText('91.0%')).toBeInTheDocument(); // Lines
        expect(screen.getByText('92.0%')).toBeInTheDocument(); // Statements
        expect(screen.getByText('83.0%')).toBeInTheDocument(); // Functions
        expect(screen.getByText('74.0%')).toBeInTheDocument(); // Branches
    });

    it('filters test results', () => {
        render(<DashboardClient latestReport={mockLatestReport as any} history={mockHistory} />);

        // Initially shows all
        expect(screen.getByText('Test 1')).toBeInTheDocument();
        expect(screen.getByText('Test 2')).toBeInTheDocument();

        // Filter Passed
        fireEvent.click(screen.getByText(/Passed \(8\)/i));
        expect(screen.getByText('Test 1')).toBeInTheDocument();
        expect(screen.queryByText('Test 2')).not.toBeInTheDocument();

        // Filter Failed
        fireEvent.click(screen.getByText(/Failed \(2\)/i));
        expect(screen.queryByText('Test 1')).not.toBeInTheDocument();
        expect(screen.getByText('Test 2')).toBeInTheDocument();

        // Back to All
        fireEvent.click(screen.getByText(/All \(2\)/i));
        expect(screen.getByText('Test 1')).toBeInTheDocument();
        expect(screen.getByText('Test 2')).toBeInTheDocument();
    });

    it('displays failure messages for failed tests', () => {
        render(<DashboardClient latestReport={mockLatestReport as any} history={mockHistory} />);
        fireEvent.click(screen.getByText(/Failed \(2\)/i));
        expect(screen.getByText('Error message')).toBeInTheDocument();
    });
});
