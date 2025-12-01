#!/usr/bin/env node

/**
 * AI-Powered PR Generator using Gemini API
 * 
 * Usage:
 *   GEMINI_API_KEY=your_key node scripts/generate-pr-ai.js [base-commit]
 * 
 * Example:
 *   GEMINI_API_KEY=xxx pnpm pr:generate:ai
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getDefaultBranch, getGitInfo, getTestResults } = require('./utils');

// Check for API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY environment variable is required');
    console.error('');
    console.error('Usage:');
    console.error('  GEMINI_API_KEY=your_key pnpm pr:generate:ai');
    console.error('');
    console.error('Get your API key from: https://makersuite.google.com/app/apikey');
    process.exit(1);
}

const baseCommit = process.argv[2] || getDefaultBranch();

console.log('🔍 Analyzing changes...');
console.log(`📊 Comparing: ${baseCommit}..HEAD\n`);

// Get git info
const { diff, diffStat, changedFiles } = getGitInfo(baseCommit);

// Read PR template
const templatePath = path.join(__dirname, '../.github/pull_request_template.md');
const template = fs.readFileSync(templatePath, 'utf-8');

// Get test results
let testResultsStr = '';
const testResults = getTestResults();
if (testResults) {
    testResultsStr = JSON.stringify({
        totalTests: testResults.totalTests,
        passed: testResults.passed,
        failed: testResults.failed,
        passRate: testResults.passRate,
        duration: testResults.duration,
    }, null, 2);
}

// Prepare prompt for Gemini
const prompt = `You are a senior software engineer writing a Pull Request for a code review.

## Task
Generate a PR title and description based on the git diff below.
You MUST strictly follow the provided PR Template format.

## PR Template (STRICTLY FOLLOW THIS STRUCTURE)
${template}

## Git Diff Stats
${diffStat}

## Changed Files
${changedFiles.join('\n')}

${testResultsStr ? `## Test Results Data (Use this to fill Metrics section)\n${testResultsStr}\n` : ''}

## Git Diff (first 15000 characters)
${diff.substring(0, 15000)}

## Instructions
1. **PR Title**: Follow Conventional Commits format: \`<type>(<scope>): <description>\` (Keep title in English)
   - Example: \`feat(frontend): implement test dashboard\`

2. **PR Description**:
   - **Language**: Write the content (Summary, Changes, Descriptions) in **Thai (ภาษาไทย)**.
   - **Structure**: **MUST** use the exact structure of the PR Template provided above.
   - **Type Section**: **CRITICAL**: You **MUST** check [x] at least one box in the '# 🎯 Type' section.
     - If adding tests -> check \`[x] ✨ New feature\` (or add a Testing option if available)
     - If fixing bugs -> check \`[x] 🐛 Bug fix\`
     - If adding CI/CD -> check \`[x] 🔧 Refactoring\` or \`[x] ✨ New feature\`
   - **Summary**: Write a clear, high-level summary in Thai.
   - **What's Changed**: List key changes with emojis (e.g., ✅, 🐛, 🔧) in Thai.
   - **Metrics**: Fill in the metrics section using the provided Test Results Data and Diff Stats.
   - **Testing**: Check [x] boxes that apply. Fill in "Test Coverage Details" if data is available.
   - **Code Quality**: Check [x] boxes if you are confident.
   - **Migration/Deployment**: 
     - Check \`[x] Environment variables updated\` if the changes involve new secrets (like SONAR_TOKEN), .env files, or configuration keys.
     - Check \`[x] Dependencies installed\` if package.json was modified.

3. **Tone**: Professional, concise, and informative (in Thai).

4. **Output Format**:
   \`\`\`
   TITLE:
   <your generated title>

   DESCRIPTION:
   <your generated description following the template>
   \`\`\`

Generate the PR now:`;

console.log('🤖 Calling Gemini API...\n');

// Call Gemini API
async function generatePR() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;

        // Parse the response
        const titleMatch = generatedText.match(/TITLE:\s*\n(.+)/);
        const descMatch = generatedText.match(/DESCRIPTION:\s*\n([\s\S]+)/);

        const prTitle = titleMatch ? titleMatch[1].trim() : 'feat: [AI generated title not found]';
        const prDescription = descMatch ? descMatch[1].trim().replace(/^```markdown\n?/, '').replace(/\n?```$/, '') : generatedText;

        // Output
        console.log('═══════════════════════════════════════════════════════');
        console.log('📝 AI-GENERATED PR TITLE');
        console.log('═══════════════════════════════════════════════════════');
        console.log(prTitle);
        console.log('\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📋 AI-GENERATED PR DESCRIPTION');
        console.log('═══════════════════════════════════════════════════════');
        console.log(prDescription);
        console.log('\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Files changed: ${changedFiles.length}`);
        console.log(`AI Model: Gemini 1.5 Flash`);
        console.log('\n');
        console.log('💡 TIP: Review and edit as needed before creating PR!');
        console.log('');

        // Save to file
        const outputFile = path.join(__dirname, '../.pr-template-output.md');
        const output = `# PR Title\n\n${prTitle}\n\n# PR Description\n\n${prDescription}`;
        fs.writeFileSync(outputFile, output);
        console.log(`✅ Saved to: ${outputFile}`);

    } catch (error) {
        console.error('❌ Error generating PR:', error.message);
        process.exit(1);
    }
}

// Run with fetch polyfill for older Node versions
if (typeof fetch === 'undefined') {
    console.log('📦 Installing fetch polyfill...');
    require('child_process').execSync('npm install node-fetch@2', { stdio: 'inherit' });
    global.fetch = require('node-fetch');
}

generatePR();
