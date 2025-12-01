'use client';

import { useEffect, useState } from 'react';

interface TestSummary {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: string;
    totalDuration: number;
    timestamp: string;
}

interface Coverage {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
}

interface TestResult {
    file: string;
    testName: string;
    status: string;
    duration: number;
    failureMessages: string[];
    timestamp: string;
}

interface TestFileResult {
    file: string;
    numTests: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
}

interface TestReport {
    summary: TestSummary;
    coverage: Coverage | null;
    testResults: TestResult[];
    failedTests: TestResult[];
    testFiles: TestFileResult[];
}

interface HistoryEntry {
    timestamp: string;
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: string;
    duration: number;
    coverage: Coverage | null;
}

export default function TestReportPage() {
    const [report, setReport] = useState<TestReport | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);

            // Load latest report
            const reportRes = await fetch('/api/reports/test-latest');
            if (reportRes.ok) {
                const reportData = await reportRes.json();
                setReport(reportData);
            }

            // Load history
            const historyRes = await fetch('/api/reports/test-history');
            if (historyRes.ok) {
                const historyData = await historyRes.json();
                setHistory(historyData);
            }

            setLoading(false);
        } catch (err) {
            setError('Failed to load test reports. Please run tests first.');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-2xl">Loading test reports...</div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-8 max-w-md">
                    <h2 className="text-white text-xl font-bold mb-4">⚠️ No Test Reports Found</h2>
                    <p className="text-gray-300 mb-4">{error || 'Please run tests to generate reports.'}</p>
                    <code className="block bg-black/30 p-3 rounded text-sm text-green-400">
                        pnpm test
                    </code>
                </div>
            </div>
        );
    }

    const { summary, coverage, testResults, failedTests, testFiles } = report;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">📊 Test Report Dashboard</h1>
                    <p className="text-gray-300">
                        Last run: {new Date(summary.timestamp).toLocaleString('th-TH')}
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Tests"
                        value={summary.totalTests}
                        icon="📝"
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Passed"
                        value={summary.passed}
                        subtitle={`${summary.passRate}%`}
                        icon="✅"
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Failed"
                        value={summary.failed}
                        icon="❌"
                        color="bg-red-500"
                    />
                    <StatCard
                        title="Duration"
                        value={`${(summary.totalDuration / 1000).toFixed(2)}s`}
                        icon="⏱️"
                        color="bg-purple-500"
                    />
                </div>

                {/* Coverage */}
                {coverage && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-4">📈 Code Coverage</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <CoverageBar label="Lines" percentage={coverage.lines} />
                            <CoverageBar label="Statements" percentage={coverage.statements} />
                            <CoverageBar label="Functions" percentage={coverage.functions} />
                            <CoverageBar label="Branches" percentage={coverage.branches} />
                        </div>
                    </div>
                )}

                {/* Failed Tests */}
                {failedTests.length > 0 && (
                    <div className="bg-red-500/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-red-500/30">
                        <h2 className="text-2xl font-bold text-white mb-4">❌ Failed Tests ({failedTests.length})</h2>
                        <div className="space-y-4">
                            {failedTests.map((test, idx) => (
                                <div key={idx} className="bg-black/30 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-white font-semibold">{test.testName}</h3>
                                        <span className="text-gray-400 text-sm">{test.duration}ms</span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2">{test.file}</p>
                                    {test.failureMessages.length > 0 && (
                                        <pre className="bg-black/50 p-3 rounded text-xs text-red-300 overflow-x-auto">
                                            {test.failureMessages.join('\n')}
                                        </pre>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Test Files */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-4">📁 Test Files</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="text-left text-white py-3 px-4">File</th>
                                    <th className="text-center text-white py-3 px-4">Total</th>
                                    <th className="text-center text-white py-3 px-4">Passed</th>
                                    <th className="text-center text-white py-3 px-4">Failed</th>
                                    <th className="text-center text-white py-3 px-4">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testFiles.map((file, idx) => (
                                    <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                                        <td className="text-gray-300 py-3 px-4 font-mono text-sm">{file.file}</td>
                                        <td className="text-center text-white py-3 px-4">{file.numTests}</td>
                                        <td className="text-center text-green-400 py-3 px-4">{file.passed}</td>
                                        <td className="text-center text-red-400 py-3 px-4">{file.failed}</td>
                                        <td className="text-center text-gray-400 py-3 px-4">{file.duration}ms</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Test History Chart */}
                {history.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-4">📉 Test History (Last {history.length} runs)</h2>
                        <div className="space-y-2">
                            {history.slice(-10).reverse().map((entry, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-black/30 rounded-lg p-3">
                                    <div className="flex-1">
                                        <div className="text-gray-400 text-sm">
                                            {new Date(entry.timestamp).toLocaleString('th-TH')}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="text-sm">
                                            <span className="text-gray-400">Total:</span>{' '}
                                            <span className="text-white font-semibold">{entry.totalTests}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-green-400">{entry.passed} ✓</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-red-400">{entry.failed} ✗</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-purple-400">{entry.passRate}%</span>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {(entry.duration / 1000).toFixed(2)}s
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, color }: {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: string;
    color: string;
}) {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-300 text-sm font-medium">{title}</h3>
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">{value}</p>
                {subtitle && <p className="text-lg text-gray-400">{subtitle}</p>}
            </div>
        </div>
    );
}

function CoverageBar({ label, percentage }: { label: string; percentage: number }) {
    const getColor = (pct: number) => {
        if (pct >= 80) return 'bg-green-500';
        if (pct >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div>
            <div className="flex justify-between mb-2">
                <span className="text-white font-medium">{label}</span>
                <span className="text-white font-bold">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-full ${getColor(percentage)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
