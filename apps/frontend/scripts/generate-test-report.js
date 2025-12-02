#!/usr/bin/env node

/**
 * Test Report Generator
 * สร้าง HTML report สำหรับแสดงผล test results และ coverage
 */

const fs = require('fs');
const path = require('path');

// อ่าน E2E test results
function readE2EResults() {
    const resultsPath = path.join(__dirname, '../test-results/e2e-results.json');

    if (!fs.existsSync(resultsPath)) {
        console.warn('⚠️  E2E results not found. Run `pnpm test:e2e` first.');
        return null;
    }

    return JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
}

// อ่าน Jest coverage
function readJestCoverage() {
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');

    if (!fs.existsSync(coveragePath)) {
        console.warn('⚠️  Jest coverage not found. Run `pnpm test:coverage` first.');
        return null;
    }

    return JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
}

// คำนวณ summary จาก E2E results
function calculateE2ESummary(results) {
    if (!results || !results.suites) return null;

    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = 0;

    function processSuite(suite) {
        if (suite.specs) {
            suite.specs.forEach(spec => {
                total++;
                if (spec.ok) passed++;
                else if (spec.tests && spec.tests.some(t => t.status === 'skipped')) skipped++;
                else failed++;

                if (spec.tests) {
                    spec.tests.forEach(test => {
                        duration += test.duration || 0;
                    });
                }
            });
        }

        if (suite.suites) {
            suite.suites.forEach(processSuite);
        }
    }

    results.suites.forEach(processSuite);

    return {
        total,
        passed,
        failed,
        skipped,
        duration: Math.round(duration),
        passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : 0
    };
}

// สร้าง HTML report
function generateHTMLReport(e2eResults, jestCoverage) {
    const e2eSummary = calculateE2ESummary(e2eResults);
    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

    // คำนวณ overall coverage
    let overallCoverage = null;
    if (jestCoverage && jestCoverage.total) {
        const { lines, statements, functions, branches } = jestCoverage.total;
        overallCoverage = {
            lines: lines.pct,
            statements: statements.pct,
            functions: functions.pct,
            branches: branches.pct,
            average: ((lines.pct + statements.pct + functions.pct + branches.pct) / 4).toFixed(1)
        };
    }

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - Firefly Bridge</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      font-size: 2.5rem;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }
    
    .header p {
      color: #718096;
      font-size: 1rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: transform 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    }
    
    .stat-card h3 {
      font-size: 0.875rem;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    
    .stat-card .value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #1a202c;
    }
    
    .stat-card .label {
      font-size: 0.875rem;
      color: #a0aec0;
      margin-top: 0.25rem;
    }
    
    .stat-card.success .value { color: #48bb78; }
    .stat-card.error .value { color: #f56565; }
    .stat-card.warning .value { color: #ed8936; }
    .stat-card.info .value { color: #4299e1; }
    
    .section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    .section h2 {
      font-size: 1.5rem;
      color: #1a202c;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .progress-bar {
      background: #e2e8f0;
      border-radius: 8px;
      height: 24px;
      overflow: hidden;
      margin-bottom: 1rem;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 0.875rem;
      transition: width 0.3s ease;
    }
    
    .coverage-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .coverage-item {
      text-align: center;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .coverage-item .percentage {
      font-size: 2rem;
      font-weight: bold;
      color: #1a202c;
    }
    
    .coverage-item .label {
      font-size: 0.875rem;
      color: #718096;
      margin-top: 0.25rem;
    }
    
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    .badge.success {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .badge.error {
      background: #fed7d7;
      color: #742a2a;
    }
    
    .badge.warning {
      background: #feebc8;
      color: #7c2d12;
    }
    
    .footer {
      text-align: center;
      color: white;
      margin-top: 3rem;
      opacity: 0.9;
    }
    
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      
      .header h1 {
        font-size: 1.75rem;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Test Report</h1>
      <p>Firefly Bridge - Test Results & Coverage</p>
      <p style="margin-top: 0.5rem; font-size: 0.875rem;">Generated: ${timestamp}</p>
    </div>
    
    ${e2eSummary ? `
    <div class="stats-grid">
      <div class="stat-card info">
        <h3>Total Tests</h3>
        <div class="value">${e2eSummary.total}</div>
        <div class="label">E2E Test Cases</div>
      </div>
      
      <div class="stat-card success">
        <h3>Passed</h3>
        <div class="value">${e2eSummary.passed}</div>
        <div class="label">${e2eSummary.passRate}% Pass Rate</div>
      </div>
      
      <div class="stat-card error">
        <h3>Failed</h3>
        <div class="value">${e2eSummary.failed}</div>
        <div class="label">Test Failures</div>
      </div>
      
      <div class="stat-card warning">
        <h3>Duration</h3>
        <div class="value">${(e2eSummary.duration / 1000).toFixed(1)}s</div>
        <div class="label">Total Time</div>
      </div>
    </div>
    
    <div class="section">
      <h2>🎯 E2E Test Results</h2>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${e2eSummary.passRate}%">
          ${e2eSummary.passRate}% Passed
        </div>
      </div>
      <p>
        <span class="badge success">${e2eSummary.passed} Passed</span>
        <span class="badge error">${e2eSummary.failed} Failed</span>
        <span class="badge warning">${e2eSummary.skipped} Skipped</span>
      </p>
    </div>
    ` : '<div class="section"><p>⚠️ No E2E test results available. Run <code>pnpm test:e2e</code> first.</p></div>'}
    
    ${overallCoverage ? `
    <div class="section">
      <h2>📈 Code Coverage</h2>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${overallCoverage.average}%">
          ${overallCoverage.average}% Coverage
        </div>
      </div>
      
      <div class="coverage-grid">
        <div class="coverage-item">
          <div class="percentage">${overallCoverage.lines}%</div>
          <div class="label">Lines</div>
        </div>
        <div class="coverage-item">
          <div class="percentage">${overallCoverage.statements}%</div>
          <div class="label">Statements</div>
        </div>
        <div class="coverage-item">
          <div class="percentage">${overallCoverage.functions}%</div>
          <div class="label">Functions</div>
        </div>
        <div class="coverage-item">
          <div class="percentage">${overallCoverage.branches}%</div>
          <div class="label">Branches</div>
        </div>
      </div>
    </div>
    ` : '<div class="section"><p>⚠️ No coverage data available. Run <code>pnpm test:coverage</code> first.</p></div>'}
    
    <div class="section">
      <h2>📝 Quick Links</h2>
      <p>
        <a href="../playwright-report/index.html" style="color: #4299e1; text-decoration: none; margin-right: 1rem;">📊 Detailed E2E Report</a>
        <a href="../coverage/lcov-report/index.html" style="color: #4299e1; text-decoration: none;">📈 Detailed Coverage Report</a>
      </p>
    </div>
    
    <div class="footer">
      <p>Firefly Bridge © 2024 | Generated by Test Report Generator</p>
    </div>
  </div>
</body>
</html>`;

    return html;
}

// Main
function main() {
    console.log('🔍 Reading test results...');

    const e2eResults = readE2EResults();
    const jestCoverage = readJestCoverage();

    console.log('📝 Generating HTML report...');
    const html = generateHTMLReport(e2eResults, jestCoverage);

    const outputPath = path.join(__dirname, '../public/test-report.html');
    fs.writeFileSync(outputPath, html);

    console.log('✅ Test report generated!');
    console.log(`📄 Report: ${outputPath}`);
    console.log('🌐 View at: http://localhost:3000/test-report.html');
}

main();
