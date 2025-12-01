# PR Generator Script

Automatically generate PR title and description based on git changes.

## 🚀 Usage

### Option 1: AI-Powered (Recommended) 🤖
Uses Gemini AI to generate intelligent PR title and description:

```bash
# Set your Gemini API key (get from https://makersuite.google.com/app/apikey)
export GEMINI_API_KEY=your_api_key_here

# Generate PR with AI
pnpm pr:generate:ai

# Or with specific base commit
GEMINI_API_KEY=xxx pnpm pr:generate:ai c41a669
```

**Benefits:**
- ✅ Intelligent analysis of code changes
- ✅ Professional, well-written descriptions
- ✅ Automatically fills PR template
- ✅ Understands context and purpose

### Option 2: Template-Based (Basic)
Uses simple template filling based on file analysis:

```bash
# Basic generation
pnpm pr:generate

# With specific commit
pnpm pr:generate c41a669
```

## 📋 What It Does

1. **Analyzes git diff** between base commit and HEAD
2. **Categorizes changes** (tests, CI, docs, frontend, backend)
3. **Detects change type** (feat, fix, test, ci, docs, etc.)
4. **Reads test coverage** from Jest reports (if available)
5. **Reads test results** from test reports (if available)
6. **Generates PR title** following Conventional Commits format
7. **Generates PR description** with all details filled in
8. **Saves output** to `.pr-template-output.md`

## 📊 Output Example

```
═══════════════════════════════════════════════════════
📝 PR TITLE
═══════════════════════════════════════════════════════
feat(frontend): add test report dashboard

═══════════════════════════════════════════════════════
📋 PR DESCRIPTION
═══════════════════════════════════════════════════════
# 📋 Summary
...
(Full PR description with all sections filled)
...
```

## 🎯 Features

### Automatic Type Detection
- `feat`: New features
- `fix`: Bug fixes
- `test`: Test additions/updates
- `ci`: CI/CD changes
- `docs`: Documentation only
- `refactor`: Code refactoring
- `perf`: Performance improvements

### Automatic Scope Detection
- `frontend`: Changes in `apps/frontend`
- `backend`: Changes in `apps/backend`
- Auto-detected from file paths

### Test Coverage Integration
If `apps/frontend/coverage/coverage-summary.json` exists:
```markdown
## Test Coverage
- **Statements:** 91.79%
- **Branches:** 91.31%
- **Functions:** 65.21%
- **Lines:** 91.79%
```

### Test Results Integration
If `apps/frontend/test-reports/latest-report.json` exists:
```markdown
## Test Results
- **Total Tests:** 64
- **Passed:** 64 (100%)
- **Failed:** 0
- **Duration:** 2.15s
```

## 📝 Workflow

### 1. Make your changes
```bash
git add .
git commit -m "your commit message"
```

### 2. Generate PR template
```bash
pnpm pr:generate
```

### 3. Review output
Check the terminal output and `.pr-template-output.md` file

### 4. Copy & Paste
- Copy the **PR Title** for GitHub PR title field
- Copy the **PR Description** for GitHub PR description field

### 5. Edit as needed
The generated content is a starting point. Edit:
- Replace `[TODO: add short description]` in title
- Fill in specific details in description
- Add screenshots if applicable
- Link related issues

## 🔧 Customization

Edit `scripts/generate-pr.js` to customize:
- Change type detection logic
- Add more file categories
- Modify PR description template
- Add custom sections

## 💡 Tips

1. **Run before creating PR** to get accurate file counts
2. **Run tests first** to include coverage data:
   ```bash
   cd apps/frontend
   pnpm run test:coverage
   cd ../..
   pnpm pr:generate
   ```
3. **Use specific base commit** when comparing feature branches:
   ```bash
   pnpm pr:generate feature/base-branch
   ```

## 📁 Output File

The script saves output to `.pr-template-output.md` which is gitignored.
You can:
- Open it in your editor
- Copy sections as needed
- Keep it for reference

## 🎨 Example Output

For a branch that adds testing infrastructure:

**Title:**
```
test(frontend): implement comprehensive test infrastructure
```

**Description includes:**
- ✅ Automatic file change list
- ✅ Test files categorized
- ✅ CI/CD changes highlighted
- ✅ Coverage metrics (if available)
- ✅ Test results (if available)
- ✅ Pre-filled checkboxes based on changes

## 🚨 Notes

- Script requires Node.js (already available in project)
- Works with any git repository
- Safe to run multiple times
- Does not modify any files (except output file)
- Does not create commits or PRs automatically

## 🔗 Related

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub PR Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
