const https = require('https');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_API_ENDPOINT = process.env.LLM_API_ENDPOINT;
const LLM_MODEL = process.env.LLM_MODEL || 'gemini-2.0-flash-001';
const PR_NUMBER = process.env.PR_NUMBER;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const COMMENT_BODY = process.env.COMMENT_BODY;
const COMMENT_ID = process.env.COMMENT_ID;

if (!GITHUB_TOKEN || !LLM_API_KEY || !PR_NUMBER || !REPO_OWNER || !REPO_NAME || !COMMENT_BODY) {
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
                        resolve(body);
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

async function getPRContext() {
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'QA-Bot',
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    };

    const prUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${PR_NUMBER}`;
    const prData = await request(prUrl, options);

    // Get Diff
    const diffOptions = {
        ...options,
        headers: {
            ...options.headers,
            Accept: 'application/vnd.github.v3.diff',
        },
    };
    const diffData = await request(prUrl, diffOptions);

    // Get existing comments to find previous review
    const commentsUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${PR_NUMBER}/comments`;
    const comments = await request(commentsUrl, options);

    // Find the most recent AI review
    const aiReview = comments
        .filter(c => c.user.login === 'github-actions[bot]' && c.body.includes('📋 สรุป'))
        .pop();

    return {
        title: prData.title,
        description: prData.body,
        diff: diffData,
        previousReview: aiReview ? aiReview.body : null,
    };
}

async function generateAnswer(question, context) {
    // Remove @ai-reviewer mention from question
    const cleanQuestion = question.replace(/@ai-reviewer/g, '').trim();

    const prompt = `
You are an AI Code Review Assistant. A user has asked a question about a Pull Request.

PR Context:
- Title: ${context.title}
- Description: ${context.description}

${context.previousReview ? `Previous AI Review:\n${context.previousReview.substring(0, 5000)}\n` : ''}

Code Changes (Diff):
${typeof context.diff === 'string' ? context.diff.substring(0, 20000) : 'Diff unavailable'}

User Question:
${cleanQuestion}

Please answer the question in Thai, providing clear and helpful information based on the PR context. Be concise but thorough.
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

        const response = await request(url, options, payload);
        if (response.candidates && response.candidates.length > 0) {
            return response.candidates[0].content.parts[0].text;
        } else {
            throw new Error(`Gemini API Error: ${JSON.stringify(response)}`);
        }

    } else {
        // OpenAI Compatible
        const endpoint = LLM_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
        const payload = {
            model: LLM_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful AI Code Review Assistant. You answer in Thai.' },
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

async function replyToComment(answer) {
    const options = {
        method: 'POST',
        headers: {
            'User-Agent': 'QA-Bot',
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    };

    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${PR_NUMBER}/comments`;
    const replyBody = `🤖 **AI Reviewer Response**\n\n${answer}\n\n---\n*ถามคำถามเพิ่มเติมได้โดยใช้ @ai-reviewer*`;

    await request(url, options, { body: replyBody });
}

async function main() {
    try {
        console.log('Fetching PR context...');
        const context = await getPRContext();

        console.log('Generating answer...');
        const answer = await generateAnswer(COMMENT_BODY, context);

        console.log('Posting reply...');
        await replyToComment(answer);

        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();