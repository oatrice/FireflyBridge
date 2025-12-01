const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Resolve git executable path securely
 */
function getGitPath() {
    try {
        // Try to find git using 'which' (Unix) or 'where' (Windows)
        const command = process.platform === 'win32' ? 'where git' : 'which git';
        const gitPath = execSync(command, { encoding: 'utf-8' }).split('\n')[0].trim();
        if (gitPath && fs.existsSync(gitPath)) {
            return gitPath;
        }
    } catch (e) {
        // Ignore error
    }

    // Fallback to standard paths or just 'git' if not found
    if (process.platform !== 'win32' && fs.existsSync('/usr/bin/git')) {
        return '/usr/bin/git';
    }

    return 'git'; // Last resort
}

const GIT_PATH = getGitPath();

/**
 * Helper to run git commands securely
 */
function runGit(args) {
    const result = spawnSync(GIT_PATH, args, { encoding: 'utf-8', shell: false });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(`Git command failed: ${GIT_PATH} ${args.join(' ')}\n${result.stderr}`);
    }

    return result.stdout;
}

/**
 * Get the default branch of the repository
 */
function getDefaultBranch() {
    try {
        const remoteHead = runGit(['symbolic-ref', 'refs/remotes/origin/HEAD']).trim();
        return remoteHead.replace('refs/remotes/', '');
    } catch (e) {
        const branches = ['origin/main', 'origin/master', 'origin/develop'];
        for (const branch of branches) {
            try {
                runGit(['rev-parse', branch]);
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

    const diff = runGit(['diff', `${baseCommit}..HEAD`]);
    const diffStat = runGit(['diff', `${baseCommit}..HEAD`, '--stat']);
    const diffShortStat = runGit(['diff', `${baseCommit}..HEAD`, '--shortstat']);
    const changedFiles = runGit(['diff', `${baseCommit}..HEAD`, '--name-only'])
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
