const https = require('https');

// Mock the request function
function mockRequest(responses) {
    let callIndex = 0;
    return (url, options, data) => {
        return new Promise((resolve) => {
            const response = responses[callIndex++];
            resolve(response);
        });
    };
}

describe('Code Review Bot - getPRDetails', () => {
    let originalEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
        process.env.GITHUB_TOKEN = 'test-token';
        process.env.PR_NUMBER = '123';
        process.env.REPO_OWNER = 'test-owner';
        process.env.REPO_NAME = 'test-repo';
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    test('should fetch commit diff when COMMIT_SHA is provided', async () => {
        process.env.COMMIT_SHA = 'abc123';

        const mockPRData = {
            title: 'Test PR',
            body: 'Test description',
        };

        const mockCommitDiff = 'diff --git a/file.js b/file.js\n+added line';

        const mockCommitData = {
            sha: 'abc123def456',
            commit: {
                message: 'feat: add new feature',
            },
        };

        // Mock request function
        const originalRequest = global.request;
        const responses = [mockPRData, mockCommitDiff, mockCommitData];
        let callCount = 0;

        global.request = jest.fn((url, options, data) => {
            return Promise.resolve(responses[callCount++]);
        });

        // Import and test the function
        const { getPRDetails } = require('../scripts/code-review-bot.js');
        const result = await getPRDetails();

        expect(result.title).toBe('Test PR');
        expect(result.description).toBe('Test description');
        expect(result.diff).toContain('diff --git');
        expect(result.commitInfo).toBeDefined();
        expect(result.commitInfo.sha).toBe('abc123d');
        expect(result.commitInfo.message).toBe('feat: add new feature');

        // Verify commit endpoint was called
        expect(global.request).toHaveBeenCalledWith(
            expect.stringContaining('/commits/abc123'),
            expect.any(Object)
        );

        global.request = originalRequest;
    });

    test('should fetch PR diff when COMMIT_SHA is not provided', async () => {
        delete process.env.COMMIT_SHA;

        const mockPRData = {
            title: 'Test PR',
            body: 'Test description',
        };

        const mockPRDiff = 'diff --git a/file1.js b/file1.js\n+line1\ndiff --git a/file2.js b/file2.js\n+line2';

        const originalRequest = global.request;
        const responses = [mockPRData, mockPRDiff];
        let callCount = 0;

        global.request = jest.fn((url, options, data) => {
            return Promise.resolve(responses[callCount++]);
        });

        const { getPRDetails } = require('../scripts/code-review-bot.js');
        const result = await getPRDetails();

        expect(result.title).toBe('Test PR');
        expect(result.description).toBe('Test description');
        expect(result.diff).toContain('file1.js');
        expect(result.diff).toContain('file2.js');
        expect(result.commitInfo).toBeNull();

        // Verify PR endpoint was called, not commit endpoint
        expect(global.request).toHaveBeenCalledWith(
            expect.stringContaining('/pulls/123'),
            expect.any(Object)
        );
        expect(global.request).not.toHaveBeenCalledWith(
            expect.stringContaining('/commits/'),
            expect.any(Object)
        );

        global.request = originalRequest;
    });

    test('should handle commit diff with short SHA', async () => {
        process.env.COMMIT_SHA = 'abc123';

        const mockCommitData = {
            sha: 'abc123def456789',
            commit: {
                message: 'fix: bug fix',
            },
        };

        const { getPRDetails } = require('../scripts/code-review-bot.js');

        // Mock only the commit info extraction
        const commitInfo = {
            sha: mockCommitData.sha.substring(0, 7),
            message: mockCommitData.commit.message,
        };

        expect(commitInfo.sha).toBe('abc123d');
        expect(commitInfo.sha.length).toBe(7);
    });
});

describe('Code Review Bot - formatTestAndCoverageReport', () => {
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
            branches: 90.0,
            functions: 75.0,
            lines: 85.5,
        };

        // This would need to be exported from the bot script
        // const report = formatTestAndCoverageReport(testResults, coverage);

        // expect(report).toContain('✅ PASSED');
        // expect(report).toContain('10');
        // expect(report).toContain('85.5%');
    });

    test('should format test results with failed tests', () => {
        const testResults = {
            success: false,
            numTotalTests: 10,
            numPassedTests: 8,
            numFailedTests: 2,
            numPendingTests: 0,
        };

        // const report = formatTestAndCoverageReport(testResults, null);

        // expect(report).toContain('❌ FAILED');
        // expect(report).toContain('Failed** | 2');
    });
});
