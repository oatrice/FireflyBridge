// Set required env vars to bypass check (only if not set)
process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || "dummy_token";
// Do NOT overwrite LLM_API_KEY if it exists, so user can provide it
if (!process.env.LLM_API_KEY) {
    console.log("⚠️ No LLM_API_KEY provided. Using dummy key (API call will fail but logs will show).");
    process.env.LLM_API_KEY = "dummy_key";
} else {
    console.log("✅ LLM_API_KEY detected. Attempting real API call...");
}

process.env.PR_NUMBER = process.env.PR_NUMBER || "123";
process.env.REPO_OWNER = process.env.REPO_OWNER || "test-owner";
process.env.REPO_NAME = process.env.REPO_NAME || "test-repo";
// Use a real model name if testing with real key, otherwise default
process.env.LLM_MODEL = process.env.LLM_MODEL || "gemini-2.0-flash-exp"; // Use a valid model for testing

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
        const review = await generateReview(mockPrDetails, null, null, []);
        console.log("\n✅ Review Generated Successfully!");
        console.log("--------------------------------------------------");
        console.log(review);
        console.log("--------------------------------------------------");

    } catch (error) {
        console.log("\n❌ Error during API call:");
        console.error(error);

        if (error.message && error.message.includes('dummy_key')) {
            console.log("ℹ️ (Expected if using dummy key)");
        }
    }
}

runTest();