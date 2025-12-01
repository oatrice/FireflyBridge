#!/usr/bin/env node

/**
 * Generate PR Title and Description
 * 
 * Usage:
 *   node scripts/generate-pr.js [base-commit]
 * 
 * Example:
 *   node scripts/generate-pr.js c41a669
 *   node scripts/generate-pr.js HEAD~5
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getDefaultBranch, getGitInfo, getTestResults, getCoverageInfo } = require('./utils');

// Get base commit from argument or default to remote HEAD
const baseCommit = process.argv[2] || getDefaultBranch();

console.log('🔍 Analyzing changes...');
console.log(`📊 Comparing: ${baseCommit}..HEAD\n`);

// Get git info
const { diffShortStat, changedFiles } = getGitInfo(baseCommit);

// Parse diff stats
const statsMatch = diffShortStat.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
const filesChanged = statsMatch ? parseInt(statsMatch[1]) : 0;
const insertions = statsMatch && statsMatch[2] ? parseInt(statsMatch[2]) : 0;
const deletions = statsMatch && statsMatch[3] ? parseInt(statsMatch[3]) : 0;

// Categorize files
const categories = {
    tests: changedFiles.filter(f => f.includes('.test.') || f.includes('.spec.')),
    workflows: changedFiles.filter(f => f.includes('.github/workflows')),
    config: changedFiles.filter(f => f.match(/\.(config|properties|yml|yaml|json)$/)),
    docs: changedFiles.filter(f => f.match(/\.(md|txt)$/)),
    frontend: changedFiles.filter(f => f.includes('apps/frontend') && !f.includes('.test.')),
    backend: changedFiles.filter(f => f.includes('apps/backend') && !f.includes('.test.')),
};

// Detect change type
let changeType = 'feat';
let scope = '';
let hasTests = categories.tests.length > 0;
let hasCI = categories.workflows.length > 0;
let hasDocs = categories.docs.length > 0;

if (hasTests && categories.tests.length > categories.frontend.length) {
    changeType = 'test';
    scope = 'frontend';
} else if (hasCI) {
    changeType = 'ci';
} else if (hasDocs && changedFiles.length === categories.docs.length) {
    changeType = 'docs';
} else if (categories.frontend.length > 0) {
    changeType = 'feat';
    scope = 'frontend';
} else if (categories.backend.length > 0) {
    changeType = 'feat';
    scope = 'backend';
}

// Get test coverage if available
let coverageInfo = '';
const coverage = getCoverageInfo();
if (coverage) {
    const total = coverage.total;
    coverageInfo = `
## Test Coverage
- **Statements:** ${total.statements.pct}%
- **Branches:** ${total.branches.pct}%
- **Functions:** ${total.functions.pct}%
- **Lines:** ${total.lines.pct}%
`;
}

// Get test results if available
let testInfo = '';
const testResults = getTestResults();
if (testResults) {
    testInfo = `
## Test Results
- **Total Tests:** ${testResults.totalTests}
- **Passed:** ${testResults.passed} (${testResults.passRate}%)
- **Failed:** ${testResults.failed}
- **Duration:** ${(testResults.duration / 1000).toFixed(2)}s
`;
}

// Generate PR title
const scopePart = scope ? `(${scope})` : '';
const prTitle = `${changeType}${scopePart}: [TODO: add short description]`;

// Generate file changes summary
const fileChanges = changedFiles.slice(0, 20).map(f => `- \`${f}\``).join('\n');
const moreFiles = changedFiles.length > 20 ? `\n... and ${changedFiles.length - 20} more files` : '';

// Generate PR description
const prDescription = `# 📋 Summary
<!-- Brief description of changes -->

## What's Changed
<!-- List main changes here -->
- TODO: Describe main changes

## Metrics
- **Files Changed:** ${filesChanged}
- **Insertions:** +${insertions}
- **Deletions:** -${deletions}
${categories.tests.length > 0 ? `- **Test Files:** ${categories.tests.length}` : ''}

# 🎯 Type
${changeType === 'feat' ? '- [x]' : '- [ ]'} ✨ New feature
${changeType === 'fix' ? '- [x]' : '- [ ]'} 🐛 Bug fix
${changeType === 'test' ? '- [x]' : '- [ ]'} 🧪 Testing
${changeType === 'ci' ? '- [x]' : '- [ ]'} 🔧 CI/CD
${changeType === 'docs' ? '- [x]' : '- [ ]'} 📝 Documentation
- [ ] ⚡ Performance improvement
- [ ] 🎨 UI/Style
- [ ] 💥 Breaking change

# 📝 Changes

## Files Changed
${fileChanges}${moreFiles}
${categories.tests.length > 0 ? `\n## Tests Added/Updated\n${categories.tests.map(f => `- \`${f}\``).join('\n')}` : ''}
${categories.workflows.length > 0 ? `\n## CI/CD Changes\n${categories.workflows.map(f => `- \`${f}\``).join('\n')}` : ''}
${categories.docs.length > 0 ? `\n## Documentation\n${categories.docs.map(f => `- \`${f}\``).join('\n')}` : ''}

# 📸 Screenshots
<!-- Add screenshots or recordings if applicable -->
${testInfo}${coverageInfo}
# 🧪 Testing
- [ ] Manual testing completed
${hasTests ? '- [x] Unit tests added/updated' : '- [ ] Unit tests added/updated'}
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)

# 🚀 Migration/Deployment
- [ ] Database migration required
- [ ] Environment variables updated
- [ ] Dependencies installed

\`\`\`bash
# Migration commands if applicable
\`\`\`

# 🔗 Related Issues
<!-- Link to related issues or PRs -->
- Closes #<!-- issue number -->
- Related to #<!-- issue number -->

**Breaking Changes**: No
**Migration Required**: No
`;

// Output
console.log('═══════════════════════════════════════════════════════');
console.log('📝 PR TITLE');
console.log('═══════════════════════════════════════════════════════');
console.log(prTitle);
console.log('\n');
console.log('═══════════════════════════════════════════════════════');
console.log('📋 PR DESCRIPTION');
console.log('═══════════════════════════════════════════════════════');
console.log(prDescription);
console.log('\n');
console.log('═══════════════════════════════════════════════════════');
console.log('📊 SUMMARY');
console.log('═══════════════════════════════════════════════════════');
console.log(`Files changed: ${filesChanged}`);
console.log(`Insertions: +${insertions}`);
console.log(`Deletions: -${deletions}`);
console.log(`Test files: ${categories.tests.length}`);
console.log(`CI files: ${categories.workflows.length}`);
console.log(`Docs: ${categories.docs.length}`);
console.log('\n');
console.log('💡 TIP: Copy the PR title and description above!');
console.log('');

// Save to file
const outputFile = path.join(__dirname, '../.pr-template-output.md');
const output = `# PR Title\n\n${prTitle}\n\n# PR Description\n\n${prDescription}`;
fs.writeFileSync(outputFile, output);
console.log(`✅ Saved to: ${outputFile}`);
