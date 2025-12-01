// Set required env vars to bypass check
process.env.GITHUB_TOKEN = "dummy_token";
process.env.LLM_API_KEY = "dummy_key";
process.env.PR_NUMBER = "123";
process.env.REPO_OWNER = "test-owner";
process.env.REPO_NAME = "test-repo";
process.env.LLM_MODEL = "gemini-pro"; // Mock model

const { generateReview } = require('./code-review-bot');
const { execSync } = require('child_process');

async function runTest() {
    console.log("🚀 Starting Local Test for Code Review Bot (Using REAL Git Diff)...\n");

    try {
        // 1. Get Real Diff from Git
        // Using 'git diff' to get unstaged changes
        console.log("Fetching git diff...");
        const realDiff = execSync('git diff').toString();

        if (!realDiff) {
            console.log("⚠️ No unstaged changes found. Try modifying a file first.");
            return;
        }

        const mockPrDetails = {
            title: "Test Feature: Real Diff Test",
            description: "Testing with actual local changes.",
            diff: realDiff,
            commitInfo: {
                sha: "local-test",
                message: "Testing local changes",
                commitList: [
                    { sha: "local-test", message: "Testing local changes" }
                ]
            }
        };

        console.log(`📝 Real Diff Length: ${mockPrDetails.diff.length} characters`);
        console.log("--------------------------------------------------\n");

        // 2. Call generateReview
        await generateReview(mockPrDetails, null, null, []);
    } catch (error) {
        if (error.message && error.message.includes('dummy_key')) {
            // Expected error due to dummy key
        } else if (error.message && error.message.includes('Gemini API Error')) {
            // Expected error
        } else {
            // Ignore API errors, we just want to see the logs
        }

        console.log("\n--------------------------------------------------");
        console.log("✅ Test finished (Stopped at API call).");
        console.log("Check the logs above for Diff size and Truncation info.");
    }
}

runTest();
