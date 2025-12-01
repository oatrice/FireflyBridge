const fs = require('fs');
const path = require('path');

class CustomTestReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
        this.testResults = [];
    }

    onRunStart() {
        console.log('\n🧪 Starting test run...\n');
    }

    onTestResult(test, testResult) {
        const { testFilePath, testResults } = testResult;

        testResults.forEach(result => {
            this.testResults.push({
                file: path.relative(process.cwd(), testFilePath),
                testName: result.fullName,
                status: result.status,
                duration: result.duration,
                failureMessages: result.failureMessages,
                timestamp: new Date().toISOString()
            });
        });
    }

    onRunComplete(contexts, results) {
        const {
            numTotalTests,
            numPassedTests,
            numFailedTests,
            numPendingTests,
            startTime,
            testResults,
            coverageMap
        } = results;

        const endTime = Date.now();
        const totalDuration = endTime - startTime;

        // Calculate coverage if available
        let coverage = null;
        if (coverageMap) {
            const summary = coverageMap.getCoverageSummary();
            coverage = {
                lines: summary.lines.pct,
                statements: summary.statements.pct,
                functions: summary.functions.pct,
                branches: summary.branches.pct
            };
        }

        const report = {
            summary: {
                totalTests: numTotalTests,
                passed: numPassedTests,
                failed: numFailedTests,
                skipped: numPendingTests,
                passRate: numTotalTests > 0 ? ((numPassedTests / numTotalTests) * 100).toFixed(2) : 0,
                totalDuration: totalDuration,
                timestamp: new Date().toISOString()
            },
            coverage: coverage,
            testResults: this.testResults,
            failedTests: this.testResults.filter(t => t.status === 'failed'),
            testFiles: testResults.map(result => ({
                file: path.relative(process.cwd(), result.testFilePath),
                numTests: result.numPassingTests + result.numFailingTests + result.numPendingTests,
                passed: result.numPassingTests,
                failed: result.numFailingTests,
                skipped: result.numPendingTests,
                duration: result.perfStats.runtime
            }))
        };

        // Save report to JSON file
        const reportDir = path.join(process.cwd(), 'test-reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportPath = path.join(reportDir, `test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Save latest report
        const latestReportPath = path.join(reportDir, 'latest-report.json');
        fs.writeFileSync(latestReportPath, JSON.stringify(report, null, 2));

        // Append to history
        const historyPath = path.join(reportDir, 'test-history.json');
        let history = [];
        if (fs.existsSync(historyPath)) {
            history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        }

        history.push({
            timestamp: report.summary.timestamp,
            totalTests: report.summary.totalTests,
            passed: report.summary.passed,
            failed: report.summary.failed,
            skipped: report.summary.skipped,
            passRate: report.summary.passRate,
            duration: report.summary.totalDuration,
            coverage: coverage
        });

        // Keep only last 50 runs
        if (history.length > 50) {
            history = history.slice(-50);
        }

        fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

        // Console output
        console.log('\n📊 Test Report Summary');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`📝 Total Tests:     ${numTotalTests}`);
        console.log(`✅ Passed:          ${numPassedTests} (${report.summary.passRate}%)`);
        console.log(`❌ Failed:          ${numFailedTests}`);
        console.log(`⏭️  Skipped:         ${numPendingTests}`);
        console.log(`⏱️  Total Duration:  ${(totalDuration / 1000).toFixed(2)}s`);

        if (coverage) {
            console.log('\n📈 Coverage:');
            console.log(`   Lines:       ${coverage.lines.toFixed(2)}%`);
            console.log(`   Statements:  ${coverage.statements.toFixed(2)}%`);
            console.log(`   Functions:   ${coverage.functions.toFixed(2)}%`);
            console.log(`   Branches:    ${coverage.branches.toFixed(2)}%`);
        }

        console.log('═══════════════════════════════════════════════════════');
        console.log(`\n💾 Report saved to: ${reportPath}`);
        console.log(`📊 View dashboard: http://localhost:3000/test-report\n`);
    }
}

module.exports = CustomTestReporter;
