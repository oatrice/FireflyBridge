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

    if (COMMIT_SHA) {
        // Review specific commit only
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
            message: commitData.commit.message,
        };
    } else {
        // Review entire PR (fallback)
        const diffOptions = {
            ...options,
            headers: {
                ...options.headers,
                Accept: 'application/vnd.github.v3.diff',
            },
        };
        diffData = await request(prUrl, diffOptions);
    }

    return {
        title: prData.title,
        description: prData.body,
        diff: diffData,
        commitInfo,
    };
}

async function generateReview(prDetails) {
    const reviewScope = prDetails.commitInfo
        ? `Commit เดียว (${prDetails.commitInfo.sha}): ${prDetails.commitInfo.message}`
        : 'ทั้ง Pull Request';

    const prompt = `
Please process the following Pull Request (PR) details. Your task is to act as an AI Code Review Assistant and generate a comprehensive review summary strictly in Thai. The review must be structured and follow all the requested sections to facilitate quick and clear understanding for contributors and reviewers.

**ขอบเขตการ Review: ${reviewScope}**

Input PR Details:
PR Title: ${prDetails.title}

Target Repository/Feature: ${REPO_OWNER}/${REPO_NAME}

Associated Issue(s): ${prDetails.description}

Diff/Code Changes:
${typeof prDetails.diff === 'string' ? prDetails.diff.substring(0, 30000) : 'Diff too large or unavailable'} 
(Note: Diff truncated to fit context window if necessary)

🤖 Code Review Output Structure (Must be in Thai):
You must generate the response by filling out the following sections in the specified structure:

📋 สรุป (Summary):
Provide a brief, high-level summary of the purpose and main outcomes of the PR. What does this PR accomplish?

⚙️ การเปลี่ยนแปลงหลัก (Changes):
Detail the key files and code sections that were modified. List the most significant modifications introduced.

🚨 ความเสี่ยงที่อาจเกิดขึ้น (Risks):
Identify potential bugs, regressions, performance bottlenecks, or security vulnerabilities introduced by these changes. If the risks are minimal, state that clearly.

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
            const response = await request(url, options, payload);
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

async function postComment(review) {
    const options = {
        method: 'POST',
        headers: {
            'User-Agent': 'Code-Review-Bot',
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    };

    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${PR_NUMBER}/comments`;
    await request(url, options, { body: review });
}

async function main() {
    try {
        console.log('Fetching PR details...');
        const prDetails = await getPRDetails();

        console.log('Generating review...');
        const review = await generateReview(prDetails);

        console.log('Posting comment...');
        await postComment(review);

        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
