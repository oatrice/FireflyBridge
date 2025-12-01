const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Get the default branch of the repository
 */
function getDefaultBranch() {
    try {
        const remoteHead = execFileSync('git', ['symbolic-ref', 'refs/remotes/origin/HEAD'], { encoding: 'utf-8' }).trim();
        return remoteHead.replace('refs/remotes/', '');
    } catch (e) {
        const branches = ['origin/main', 'origin/master', 'origin/develop'];
        for (const branch of branches) {
            try {
                execFileSync('git', ['rev-parse', branch], { encoding: 'utf-8', stdio: 'pipe' });
                return branch;
            } catch (err) {
                continue;
            }
        }
        return 'HEAD~10';
    }
}

/**
 * Get git diff information
 */
function getGitInfo(baseCommit) {
    // Validate baseCommit to prevent command injection
    if (!/^[a-zA-Z0-9_\-./~^]+$/.test(baseCommit)) {
        throw new Error('Invalid base commit format');
    }

    const diff = execFileSync('git', ['diff', `${baseCommit}..HEAD`], { encoding: 'utf-8' });
    const diffStat = execFileSync('git', ['diff', `${baseCommit}..HEAD`, '--stat'], { encoding: 'utf-8' });
    const diffShortStat = execFileSync('git', ['diff', `${baseCommit}..HEAD`, '--shortstat'], { encoding: 'utf-8' });
    const changedFiles = execFileSync('git', ['diff', `${baseCommit}..HEAD`, '--name-only'], { encoding: 'utf-8' })
        .trim()
        .split('\n')
        .filter(Boolean);

    return { diff, diffStat, diffShortStat, changedFiles };
}

/**
 * Get test results from JSON report
 */
function getTestResults() {
    try {
        const reportFile = path.join(__dirname, '../apps/frontend/test-reports/latest-report.json');
        if (fs.existsSync(reportFile)) {
            const report = JSON.parse(fs.readFileSync(reportFile, 'utf-8'));
            return {
                totalTests: report.summary.totalTests,
                passed: report.summary.passed,
                failed: report.summary.failed,
                passRate: report.summary.passRate,
                duration: report.summary.totalDuration,
                raw: report
            };
        }
    } catch (e) {
        return null;
    }
}

/**
 * Get coverage info
 */
function getCoverageInfo() {
    try {
        const coverageFile = path.join(__dirname, '../apps/frontend/coverage/coverage-summary.json');
        if (fs.existsSync(coverageFile)) {
            return JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
        }
    } catch (e) {
        return null;
    }
}

module.exports = {
    getDefaultBranch,
    getGitInfo,
    getTestResults,
    getCoverageInfo
};
