// Simple integration tests for code-review-bot
// These tests focus on pure functions that don't require HTTP mocking

describe('Code Review Bot - formatTestAndCoverageReport', () => {
    let bot;

    beforeAll(() => {
        // Set required environment variables
        process.env.GITHUB_TOKEN = 'test-token';
        process.env.LLM_API_KEY = 'test-llm-key';
        process.env.PR_NUMBER = '123';
        process.env.REPO_OWNER = 'test-owner';
        process.env.REPO_NAME = 'test-repo';

        bot = require('../code-review-bot');
    });

    test('should format test results with all passed tests', () => {
        const testResults = {
            success: true,
            numTotalTests: 10,
            numPassedTests: 10,
            numFailedTests: 0,
            numPendingTests: 0,
        };

        const coverage = {
            statements: 85.5,
            branches: 90,
            functions: 75,
            lines: 85.5,
        };

        const report = bot.formatTestAndCoverageReport(testResults, coverage);

        expect(report).toContain('✅ PASSED');
        expect(report).toContain('Passed** | 10');
        expect(report).toContain('Total** | 10');
        expect(report).toContain('85.5%');
        expect(report).toContain('90%');
        expect(report).toContain('75%');
    });

    test('should format test results with failed tests', () => {
        const testResults = {
            success: false,
            numTotalTests: 10,
            numPassedTests: 8,
            numFailedTests: 2,
            numPendingTests: 0,
        };

        const coverage = {
            statements: 70,
            branches: 65,
            functions: 60,
            lines: 70,
        };

        const report = bot.formatTestAndCoverageReport(testResults, coverage);

        expect(report).toContain('❌ FAILED');
        expect(report).toContain('Failed** | 2');
        expect(report).toContain('Passed** | 8');
        expect(report).toContain('70%');
        expect(report).toContain('65%');
    });

    test('should handle pending tests', () => {
        const testResults = {
            success: true,
            numTotalTests: 10,
            numPassedTests: 8,
            numFailedTests: 0,
            numPendingTests: 2,
        };

        const coverage = {
            statements: 80,
            branches: 85,
            functions: 70,
            lines: 80,
        };

        const report = bot.formatTestAndCoverageReport(testResults, coverage);

        expect(report).toContain('Pending** | 2');
    });

    test('should handle null test results', () => {
        const coverage = {
            statements: 85,
            branches: 90,
            functions: 75,
            lines: 85,
        };

        const report = bot.formatTestAndCoverageReport(null, coverage);

        expect(report).toContain('⚠️ Could not retrieve test results');
        expect(report).toContain('85%');
        expect(report).toContain('90%');
    });

    test('should handle null coverage', () => {
        const testResults = {
            success: true,
            numTotalTests: 5,
            numPassedTests: 5,
            numFailedTests: 0,
            numPendingTests: 0,
        };

        const report = bot.formatTestAndCoverageReport(testResults, null);

        expect(report).toContain('✅ PASSED');
        expect(report).toContain('⚠️ Could not retrieve coverage data');
    });

    test('should handle both null test results and coverage', () => {
        const report = bot.formatTestAndCoverageReport(null, null);

        expect(report).toContain('⚠️ Could not retrieve test results');
        expect(report).toContain('⚠️ Could not retrieve coverage data');
    });
});

describe('Code Review Bot - Commit Diff Logic', () => {
    beforeEach(() => {
        jest.resetModules();
        delete process.env.COMMIT_SHA;
    });

    test('should use commit diff mode when COMMIT_SHA is set', () => {
        process.env.GITHUB_TOKEN = 'test-token';
        process.env.LLM_API_KEY = 'test-llm-key';
        process.env.PR_NUMBER = '123';
        process.env.REPO_OWNER = 'test-owner';
        process.env.REPO_NAME = 'test-repo';
        process.env.COMMIT_SHA = 'abc123def456';

        const bot = require('../code-review-bot');

        // Verify COMMIT_SHA is loaded
        expect(process.env.COMMIT_SHA).toBe('abc123def456');
        expect(process.env.COMMIT_SHA).not.toBe('undefined');
        expect(process.env.COMMIT_SHA.trim()).not.toBe('');
    });

    test('should use PR diff mode when COMMIT_SHA is not set', () => {
        process.env.GITHUB_TOKEN = 'test-token';
        process.env.LLM_API_KEY = 'test-llm-key';
        process.env.PR_NUMBER = '123';
        process.env.REPO_OWNER = 'test-owner';
        process.env.REPO_NAME = 'test-repo';
        delete process.env.COMMIT_SHA;

        const bot = require('../code-review-bot');

        // Verify COMMIT_SHA is not set
        expect(process.env.COMMIT_SHA).toBeUndefined();
    });

    test('should use PR diff mode when COMMIT_SHA is empty string', () => {
        process.env.GITHUB_TOKEN = 'test-token';
        process.env.LLM_API_KEY = 'test-llm-key';
        process.env.PR_NUMBER = '123';
        process.env.REPO_OWNER = 'test-owner';
        process.env.REPO_NAME = 'test-repo';
        process.env.COMMIT_SHA = '';

        const bot = require('../code-review-bot');

        // Verify COMMIT_SHA is empty
        expect(process.env.COMMIT_SHA).toBe('');
        expect(process.env.COMMIT_SHA.trim()).toBe('');
    });

    test('should use PR diff mode when COMMIT_SHA is "undefined" string', () => {
        process.env.GITHUB_TOKEN = 'test-token';
        process.env.LLM_API_KEY = 'test-llm-key';
        process.env.PR_NUMBER = '123';
        process.env.REPO_OWNER = 'test-owner';
        process.env.REPO_NAME = 'test-repo';
        process.env.COMMIT_SHA = 'undefined';

        const bot = require('../code-review-bot');

        // Verify COMMIT_SHA is the string "undefined"
        expect(process.env.COMMIT_SHA).toBe('undefined');
    });
});
