'use client';

import React, { useState } from 'react';

interface TestResult {
    file: string;
    testName: string;
    status: 'passed' | 'failed' | 'pending';
    duration: number;
    failureMessages: string[];
    timestamp: string;
}

interface Coverage {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
}

interface TestSummary {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: string;
    totalDuration: number;
    timestamp: string;
}

interface TestReport {
    summary: TestSummary;
    coverage: Coverage | null;
    testResults: TestResult[];
    failedTests: TestResult[];
    testFiles: any[];
}

interface HistoryItem {
    timestamp: string;
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: string;
    duration: number;
    coverage: Coverage | null;
}

interface DashboardClientProps {
    latestReport: TestReport | null;
    history: HistoryItem[];
}

export default function DashboardClient({ latestReport, history }: DashboardClientProps) {
    const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

    if (!latestReport) {
        return (
            <div className="p-6 text-center text-gray-500">
                <p>ไม่พบข้อมูลรายงานการทดสอบ (No test report data found)</p>
                <p className="text-sm mt-2">Please run `npm run test` to generate a report.</p>
            </div>
        );
    }

    const filteredTests = latestReport.testResults.filter((test) => {
        if (filter === 'all') return true;
        return test.status === filter;
    });

    // Helper to format duration
    const formatDuration = (ms: number) => {
        return (ms / 1000).toFixed(2) + 's';
    };

    // Simple Line Chart Component
    const HistoryChart = () => {
        if (!history || history.length === 0) return null;

        const height = 200;
        const width = 600;
        const padding = 20;

        // Get max value for scaling
        const maxTests = Math.max(...history.map(h => h.totalTests));

        // Create points
        const createPoints = (key: 'totalTests' | 'passed' | 'failed') => {
            return history.map((h, i) => {
                const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
                const y = height - padding - (h[key] / maxTests) * (height - 2 * padding);
                return `${x},${y}`;
            }).join(' ');
        };

        return (
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ minWidth: '600px' }}>
                    {/* Background lines */}
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />

                    {/* Lines */}
                    <polyline points={createPoints('totalTests')} fill="none" stroke="#94a3b8" strokeWidth="2" />
                    <polyline points={createPoints('passed')} fill="none" stroke="#22c55e" strokeWidth="2" />
                    <polyline points={createPoints('failed')} fill="none" stroke="#ef4444" strokeWidth="2" />

                    {/* Legend */}
                    <g transform={`translate(${width - 100}, 20)`}>
                        <circle cx="0" cy="0" r="4" fill="#94a3b8" />
                        <text x="10" y="4" fontSize="10" fill="#64748b">Total</text>
                        <circle cx="0" cy="15" r="4" fill="#22c55e" />
                        <text x="10" y="19" fontSize="10" fill="#64748b">Passed</text>
                        <circle cx="0" cy="30" r="4" fill="#ef4444" />
                        <text x="10" y="34" fontSize="10" fill="#64748b">Failed</text>
                    </g>
                </svg>
            </div>
        );
    };

    // Coverage Chart Component
    const CoverageChart = () => {
        if (!history || history.length === 0) return null;

        const height = 200;
        const width = 600;
        const padding = 20;

        // Scale 0-100
        const maxVal = 100;

        // Create points for average coverage
        const createPoints = () => {
            return history.map((h, i) => {
                if (!h.coverage) return null;
                const avg = (h.coverage.lines + h.coverage.statements + h.coverage.functions + h.coverage.branches) / 4;
                const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
                const y = height - padding - (avg / maxVal) * (height - 2 * padding);
                return `${x},${y}`;
            }).filter(p => p !== null).join(' ');
        };

        const points = createPoints();
        if (!points) return <div className="text-sm text-gray-500 text-center py-8">No coverage history available</div>;

        return (
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ minWidth: '600px' }}>
                    {/* Background lines */}
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />

                    {/* 50% line */}
                    <line x1={padding} y1={height - padding - 0.5 * (height - 2 * padding)} x2={width - padding} y2={height - padding - 0.5 * (height - 2 * padding)} stroke="#e5e7eb" strokeDasharray="4" />

                    {/* Line */}
                    <polyline points={points} fill="none" stroke="#8b5cf6" strokeWidth="2" />

                    {/* Legend */}
                    <g transform={`translate(${width - 120}, 20)`}>
                        <circle cx="0" cy="0" r="4" fill="#8b5cf6" />
                        <text x="10" y="4" fontSize="10" fill="#64748b">Avg Coverage %</text>
                    </g>
                </svg>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Tests</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">{latestReport.summary.totalTests}</span>
                        <span className="ml-2 text-sm text-gray-500">cases</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Passed</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-green-600">{latestReport.summary.passed}</span>
                        <span className="ml-2 text-sm text-gray-500">({latestReport.summary.passRate}%)</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Failed</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className={`text-3xl font-bold ${latestReport.summary.failed > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {latestReport.summary.failed}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">cases</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Duration</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-blue-600">{formatDuration(latestReport.summary.totalDuration)}</span>
                    </div>
                </div>
            </div>

            {/* Charts & Coverage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* History Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Test History Trend</h3>
                    <HistoryChart />
                </div>

                {/* Coverage Stats */}
                {latestReport.coverage && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Coverage</h3>
                        <div className="mb-6">
                            <CoverageChart />
                        </div>
                        <div className="space-y-4">
                            {Object.entries(latestReport.coverage).map(([key, value]) => (
                                <div key={key}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-gray-600">{key}</span>
                                        <span className="font-medium text-gray-900">{value.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Test Results List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All ({latestReport.testResults.length})
                        </button>
                        <button
                            onClick={() => setFilter('passed')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'passed'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                        >
                            Passed ({latestReport.summary.passed})
                        </button>
                        <button
                            onClick={() => setFilter('failed')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'failed'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                                }`}
                        >
                            Failed ({latestReport.summary.failed})
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredTests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No tests found for this filter.
                        </div>
                    ) : (
                        filteredTests.map((test, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${test.status === 'passed'
                                                ? 'bg-green-100 text-green-800'
                                                : test.status === 'failed'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {test.status.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500 font-mono">{test.file}</span>
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-900">{test.testName}</h4>
                                        {test.failureMessages && test.failureMessages.length > 0 && (
                                            <div className="mt-2 p-3 bg-red-50 rounded-lg text-xs text-red-700 font-mono whitespace-pre-wrap overflow-x-auto">
                                                {test.failureMessages[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 text-xs text-gray-500 whitespace-nowrap">
                                        {test.duration} ms
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
