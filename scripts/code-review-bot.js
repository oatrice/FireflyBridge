const https = require('https');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_API_ENDPOINT = process.env.LLM_API_ENDPOINT;
const LLM_MODEL = process.env.LLM_MODEL || 'gemini-2.0-flash-001';
const PR_NUMBER = process.env.PR_NUMBER;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const COMMIT_SHA = process.env.COMMIT_SHA; // New: for reviewing specific commit

if (!GITHUB_TOKEN || !LLM_API_KEY || !PR_NUMBER || !REPO_OWNER || !REPO_NAME) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

const GITHUB_API_BASE = 'https://api.github.com';

// Helper to make HTTP requests
function request(url, options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve(body); // Handle non-JSON response if any
                    }
                } else {
                    reject(new Error(`Request failed with status ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', (err) => reject(err));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function getPRDetails() {
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Code-Review-Bot',
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    };

    const prUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${PR_NUMBER}`;
    const prData = await request(prUrl, options);

    // Get Diff - either from specific commit or entire PR
    let diffData;
    let commitInfo = null;

    // Validate and log COMMIT_SHA
    console.log('COMMIT_SHA environment variable:', COMMIT_SHA);

    let commitList = [];

    if (COMMIT_SHA && COMMIT_SHA !== 'undefined' && COMMIT_SHA.trim() !== '') {
        // Review specific commit only
        console.log(`📝 Reviewing COMMIT DIFF ONLY for SHA: ${COMMIT_SHA}`);
        const commitUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/commits/${COMMIT_SHA}`;
        const diffOptions = {
            ...options,
            headers: {
                ...options.headers,
                Accept: 'application/vnd.github.v3.diff',
            },
        };
        diffData = await request(commitUrl, diffOptions);

        // Get commit message for context
        const commitData = await request(commitUrl, options);
        commitInfo = {
            sha: commitData.sha.substring(0, 7),
            fullSha: commitData.sha,
            message: commitData.commit.message,
        };
        commitList.push(commitInfo);
        console.log(`✅ Fetched commit diff for: ${commitInfo.sha} - ${commitInfo.message}`);
    } else {
        // Review entire PR (fallback)
        console.log('📋 Reviewing ENTIRE PR DIFF (no valid COMMIT_SHA provided)');
        const diffOptions = {
            ...options,
            headers: {
                ...options.headers,
                Accept: 'application/vnd.github.v3.diff',
            },
        };
        diffData = await request(prUrl, diffOptions);

        // Get commits from PR
        const commitsUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${PR_NUMBER}/commits`;
        const commitsData = await request(commitsUrl, options);

        if (commitsData && commitsData.length > 0) {
            commitList = commitsData.map(c => ({
                sha: c.sha.substring(0, 7),
                fullSha: c.sha,
                message: c.commit.message
            }));

            const latestCommit = commitsData[commitsData.length - 1];
            commitInfo = {
                sha: latestCommit.sha.substring(0, 7),
                fullSha: latestCommit.sha,
                message: latestCommit.commit.message,
                isLatestInPR: true
            };
            console.log(`✅ Identified latest commit in PR: ${commitInfo.sha}`);
        }

        console.log('✅ Fetched PR diff');
    }

    return {
        title: prData.title,
        description: prData.body,
        diff: diffData,
        commitInfo,
        commitList,
    };
}

async function generateReview(prDetails, testResults, coverageData, uncoveredAreas) {
    const reviewScope = prDetails.commitInfo
        ? `Commit: ${prDetails.commitInfo.sha} (${prDetails.commitInfo.message})`
        : 'ทั้ง Pull Request';

    // Format test and coverage info for AI
    let testCoverageInfo = '\n';
    if (testResults) {
        const status = testResults.success ? 'PASSED ✅' : 'FAILED ❌';
        testCoverageInfo += `\nTest Results: ${status}\n`;
        testCoverageInfo += `- Passed: ${testResults.numPassedTests}/${testResults.numTotalTests}\n`;
        if (testResults.numFailedTests > 0) {
            testCoverageInfo += `- Failed: ${testResults.numFailedTests}\n`;
        }
        if (testResults.numPendingTests > 0) {
            testCoverageInfo += `- Pending: ${testResults.numPendingTests}\n`;
        }
    }

    if (coverageData) {
        testCoverageInfo += `\nCode Coverage:\n`;
        testCoverageInfo += `- Statements: ${coverageData.statements}%\n`;
        testCoverageInfo += `- Branches: ${coverageData.branches}%\n`;
        testCoverageInfo += `- Functions: ${coverageData.functions}%\n`;
        testCoverageInfo += `- Lines: ${coverageData.lines}%\n`;
    }

    // Add uncovered areas details
    if (uncoveredAreas && uncoveredAreas.length > 0) {
        testCoverageInfo += `\nUncovered Code Areas (ที่ควรเพิ่ม Tests):\n`;
        uncoveredAreas.forEach(area => {
            testCoverageInfo += `\nFile: ${area.file}\n`;
            if (area.uncoveredFunctions.length > 0) {
                testCoverageInfo += `  Functions ที่ยังไม่มี test:\n`;
                area.uncoveredFunctions.forEach(fn => {
                    testCoverageInfo += `    - ${fn.name} (line ${fn.line})\n`;
                });
            }
            if (area.uncoveredLines.length > 0) {
                testCoverageInfo += `  Lines ที่ยังไม่ถูก cover: ${area.uncoveredLines.join(', ')}\n`;
            }
        });
    }

    const MAX_DIFF_LENGTH = 30000;
    const originalDiff = typeof prDetails.diff === 'string' ? prDetails.diff : '';
    const isTruncated = originalDiff.length > MAX_DIFF_LENGTH;
    const diffContent = typeof prDetails.diff === 'string' ? prDetails.diff.substring(0, 30000) : 'Diff too large or unavailable';
    console.log(`ℹ️ Diff size sent to AI: ${diffContent.length} characters`);
    if (isTruncated) {
        console.warn(`⚠️ Diff was truncated! Original size: ${originalDiff.length} characters.`);
        console.log(`--- Truncated Diff Preview (Last 500 chars sent) ---`);
        console.log(diffContent.slice(-500));
        console.log(`--- End Preview ---`);
    } else {
        console.log(`✅ Diff fits within limit (${originalDiff.length} / ${MAX_DIFF_LENGTH})`);
    }

    // Determine Context Description
    // If reviewing specific commit (and it's not just the latest commit of PR context), use Commit Message
    // In getPRDetails, 'isLatestInPR' is only set when we fallback to PR review.
    const isSpecificCommit = prDetails.commitInfo && !prDetails.commitInfo.isLatestInPR;
    const contextDescription = isSpecificCommit ? prDetails.commitInfo.message : prDetails.description;
    const contextLabel = isSpecificCommit ? 'Commit Message' : 'PR Description/Issues';

    const prompt = `
Please process the following Pull Request (PR) details. Your task is to act as an AI Code Review Assistant and generate a comprehensive review summary strictly in Thai. The review must be structured and follow all the requested sections to facilitate quick and clear understanding for contributors and reviewers.

**ขอบเขตการ Review: ${reviewScope}**

Input PR Details:
PR Title: ${prDetails.title}

Target Repository/Feature: ${REPO_OWNER}/${REPO_NAME}

${contextLabel}: ${contextDescription}

Diff/Code Changes:
${diffContent} 
(Note: Diff truncated to fit context window if necessary)
${testCoverageInfo}

🤖 Code Review Output Structure (Must be in Thai):
You must generate the response by filling out the following sections in the specified structure:

📋 สรุป (Summary):
Provide a brief, high-level summary of the purpose and main outcomes of the PR. What does this PR accomplish?

⚙️ การเปลี่ยนแปลงหลัก (Changes):
Detail the key files and code sections that were modified. List the most significant modifications introduced.

🚨 ความเสี่ยงที่อาจเกิดขึ้น (Risks):
Identify potential bugs, regressions, performance bottlenecks, or security vulnerabilities introduced by these changes. If the risks are minimal, state that clearly.

🧪 การทดสอบและ Coverage (Testing & Coverage Analysis):
Analyze the test results and coverage data provided above. Comment on:
- Whether the test coverage is adequate for the changes made
- If there are critical paths that lack test coverage
- Suggestions for additional test cases if needed
- Overall quality of testing approach

⚖️ ระดับความสำคัญ (Level):
Rate the overall significance/impact of the PR (e.g., Critical, Major, Moderate, Minor). Justify the rating briefly.

📝 คำอธิบายโดยละเอียด (Description):
Provide a more in-depth explanation of why these changes were made and how they achieve the objective. Include any relevant architectural context.

💡 ข้อเสนอแนะ (Suggestions):
Offer constructive suggestions for improvement, such as better practices, cleanup, simplification, or potential future refactoring.

❓ ถาม-ตอบ (Human Ask/Bot Reply):
Crucially, add a final note that allows for follow-up. State clearly: "หากมีข้อสงสัยหรือต้องการรายละเอียดเชิงลึกในส่วนใดเพิ่มเติม สามารถถามคำถามเฉพาะเจาะจงได้เลย โดยพิมพ์ @ai-reviewer <คำถามของคุณ>"

REMINDER: All generated content must be in Thai. Focus on clarity, accuracy, and ease of reading for technical contributors.
`;

    console.log('\n--- 🚀 GENERATED PROMPT (Preview) ---');
    console.log(prompt);
    console.log('--- END PROMPT ---\n');

    // Check if using Gemini
    if (LLM_MODEL.startsWith('gemini')) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${LLM_MODEL}:generateContent?key=${LLM_API_KEY}`;
        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            console.log(`📡 Sending request to Gemini (${LLM_MODEL})...`);
            const response = await request(url, options, payload);

            console.log('\n--- 📥 GEMINI RESPONSE ---');
            console.log(JSON.stringify(response, null, 2));
            console.log('--- END RESPONSE ---\n');

            if (response.candidates && response.candidates.length > 0) {
                return response.candidates[0].content.parts[0].text;
            } else {
                throw new Error(`Gemini API Error: ${JSON.stringify(response)}`);
            }
        } catch (error) {
            // If 404, try to list models to help debug
            if (error.message.includes('404')) {
                console.log('Model not found. Listing available models...');
                try {
                    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${LLM_API_KEY}`;
                    const listResponse = await request(listUrl, { method: 'GET' });
                    console.log('Available Models:', JSON.stringify(listResponse, null, 2));
                } catch (listError) {
                    console.error('Failed to list models:', listError);
                }
            }
            throw error;
        }

    } else {
        // OpenAI Compatible
        const endpoint = LLM_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
        const payload = {
            model: LLM_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful AI Code Reviewer. You answer strictly in Thai.' },
                { role: 'user', content: prompt },
            ],
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${LLM_API_KEY}`,
            },
        };

        const response = await request(endpoint, options, payload);
        return response.choices[0].message.content;
    }
}

async function readTestResults() {
    const fs = require('fs');
    const path = require('path');

    try {
        console.log('Reading test results from artifact...');
        const testResultsPath = path.join(process.cwd(), 'test-results', 'test-results.json');

        if (!fs.existsSync(testResultsPath)) {
            console.warn('Test results file not found at:', testResultsPath);
            return null;
        }

        const testData = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));

        return {
            success: testData.success || false,
            numTotalTests: testData.numTotalTests || 0,
            numPassedTests: testData.numPassedTests || 0,
            numFailedTests: testData.numFailedTests || 0,
            numPendingTests: testData.numPendingTests || 0,
        };
    } catch (error) {
        console.error('Error reading test results:', error.message);
        return null;
    }
}

async function runTestCoverage() {
    const fs = require('fs');
    const path = require('path');

    try {
        console.log('Reading test coverage from artifact...');
        const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');

        if (!fs.existsSync(coveragePath)) {
            console.warn('Coverage file not found at:', coveragePath);
            return null;
        }

        const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

        if (coverageData.total) {
            const total = coverageData.total;
            return {
                statements: total.statements?.pct?.toFixed(2) || 0,
                branches: total.branches?.pct?.toFixed(2) || 0,
                functions: total.functions?.pct?.toFixed(2) || 0,
                lines: total.lines?.pct?.toFixed(2) || 0,
                testsPassed: 'N/A', // Not available in summary
                testsTotal: 'N/A',
            };
        }

        return null;
    } catch (error) {
        console.error('Error reading test coverage:', error.message);
        return null;
    }
}

async function analyzeDetailedCoverage() {
    const fs = require('fs');
    const path = require('path');

    try {
        console.log('Analyzing detailed coverage...');
        const detailedCoveragePath = path.join(process.cwd(), 'coverage', 'coverage-final.json');

        if (!fs.existsSync(detailedCoveragePath)) {
            console.warn('Detailed coverage file not found');
            return null;
        }

        const coverageData = JSON.parse(fs.readFileSync(detailedCoveragePath, 'utf8'));
        const uncoveredAreas = [];

        // Analyze each file
        for (const [filePath, fileData] of Object.entries(coverageData)) {
            // Skip node_modules and test files
            if (filePath.includes('node_modules') || filePath.includes('.test.') || filePath.includes('__tests__')) {
                continue;
            }

            const fileName = path.basename(filePath);
            const uncoveredLines = [];
            const uncoveredFunctions = [];

            // Find uncovered lines
            if (fileData.s && fileData.statementMap) {
                for (const [stmtId, count] of Object.entries(fileData.s)) {
                    if (count === 0 && fileData.statementMap[stmtId]) {
                        const loc = fileData.statementMap[stmtId].start;
                        uncoveredLines.push(loc.line);
                    }
                }
            }

            // Find uncovered functions
            if (fileData.f && fileData.fnMap) {
                for (const [fnId, count] of Object.entries(fileData.f)) {
                    if (count === 0 && fileData.fnMap[fnId]) {
                        const fnName = fileData.fnMap[fnId].name || 'anonymous';
                        const loc = fileData.fnMap[fnId].loc.start;
                        uncoveredFunctions.push({ name: fnName, line: loc.line });
                    }
                }
            }

            // Only include files with uncovered code
            if (uncoveredLines.length > 0 || uncoveredFunctions.length > 0) {
                uncoveredAreas.push({
                    file: fileName,
                    uncoveredLines: uncoveredLines.slice(0, 10), // Limit to first 10
                    uncoveredFunctions: uncoveredFunctions.slice(0, 5), // Limit to first 5
                });
            }
        }

        return uncoveredAreas.slice(0, 5); // Return top 5 files with most issues
    } catch (error) {
        console.error('Error analyzing detailed coverage:', error.message);
        return null;
    }
}

function formatTestAndCoverageReport(testResults, coverage, commitInfo) {
    let report = '\n\n---\n\n## 🧪 Test Results\n\n';

    if (commitInfo) {
        report += `**Commit:** ${commitInfo.sha}\n\n`;
    }

    if (testResults) {
        const status = testResults.success ? '✅ PASSED' : '❌ FAILED';
        const emoji = testResults.success ? '✅' : '❌';

        report += `**Status:** ${status}\n\n`;
        report += `| Metric | Count |\n`;
        report += `|--------|-------|\n`;
        report += `| ${emoji} **Passed** | ${testResults.numPassedTests} |\n`;

        if (testResults.numFailedTests > 0) {
            report += `| ❌ **Failed** | ${testResults.numFailedTests} |\n`;
        }
        if (testResults.numPendingTests > 0) {
            report += `| ⏸️ **Pending** | ${testResults.numPendingTests} |\n`;
        }

        report += `| 📊 **Total** | ${testResults.numTotalTests} |\n`;
    } else {
        report += '⚠️ Could not retrieve test results.\n';
    }

    report += '\n## 📊 Coverage Report\n\n';

    if (coverage) {
        report += `| Metric | Coverage |\n`;
        report += `|--------|----------|\n`;
        report += `| **Statements** | ${coverage.statements}% |\n`;
        report += `| **Branches** | ${coverage.branches}% |\n`;
        report += `| **Functions** | ${coverage.functions}% |\n`;
        report += `| **Lines** | ${coverage.lines}% |\n`;
    } else {
        report += '⚠️ Could not retrieve coverage data.\n';
    }

    return report;
}

async function postComment(review, testResults, coverageData, commitInfo) {
    let header = '';

    // Add Commits List at the top
    if (commitInfo && commitInfo.commitList && commitInfo.commitList.length > 0) {
        header += `**Review Scope:** ${review}\n\n`; // Add scope here (Note: 'review' variable contains the AI generated text, need to pass scope separately or extract it)
        // Wait, 'review' is the AI output. I should pass reviewScope to postComment or reconstruct it.
        // Let's reconstruct it for display consistency.
        const scopeText = commitInfo.commitList.length > 1 ? 'Multiple Commits' : 'Single Commit';

        header += '## 🔨 Commits in this Review\n\n';
        commitInfo.commitList.forEach(c => {
            header += `- \`${c.sha}\` ${c.message}\n`;
        });
        header += '\n---\n\n';
    } else if (commitInfo && commitInfo.sha) {
        // Fallback for single commit
        header += `**Review Scope:** Commit \`${commitInfo.sha}\`\n\n`;
        header += `## 🔨 Commit: \`${commitInfo.sha}\`\n${commitInfo.message}\n\n---\n\n`;
    }

    const testAndCoverageReport = formatTestAndCoverageReport(testResults, coverageData, commitInfo);
    const fullComment = header + review + testAndCoverageReport;

    const options = {
        method: 'POST',
        headers: {
            'User-Agent': 'Code-Review-Bot',
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    };

    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${PR_NUMBER}/comments`;
    await request(url, options, { body: fullComment });
}

async function main() {
    try {
        console.log('Fetching PR details...');
        const prDetails = await getPRDetails();

        console.log('Reading test results...');
        const testResults = await readTestResults();

        console.log('Reading test coverage...');
        const coverageData = await runTestCoverage();

        console.log('Analyzing uncovered code areas...');
        const uncoveredAreas = await analyzeDetailedCoverage();

        console.log('Generating review...');
        const review = await generateReview(prDetails, testResults, coverageData, uncoveredAreas);

        console.log('Posting comment...');
        await postComment(review, testResults, coverageData, prDetails.commitInfo);

        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Export functions for testing
module.exports = {
    request,
    getPRDetails,
    generateReview,
    readTestResults,
    runTestCoverage,
    formatTestAndCoverageReport,
    postComment,
    main,
};

// Only run main if this file is executed directly
if (require.main === module) {
    main();
}
