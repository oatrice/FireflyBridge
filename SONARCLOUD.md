# SonarCloud Integration Guide

## 🎯 Overview
This project uses SonarCloud for continuous code quality and security analysis.

## 📋 Setup Instructions

### 1. SonarCloud Account Setup
1. Go to [SonarCloud.io](https://sonarcloud.io)
2. Sign in with your GitHub account
3. Import your GitHub organization
4. Create a new project and select `FireflyBridge`

### 2. Get SonarCloud Token
1. In SonarCloud, go to **My Account** → **Security**
2. Generate a new token (name it `FireflyBridge-CI`)
3. **Copy the token** (you'll need it for GitHub Secrets)

### 3. Configure GitHub Secrets
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - Name: `SONAR_TOKEN`
   - Value: (paste the token from step 2)

### 4. Update sonar-project.properties
Open `sonar-project.properties` and update:
```properties
sonar.projectKey=YOUR_GITHUB_USERNAME_FireflyBridge
sonar.organization=YOUR_GITHUB_USERNAME
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

### 5. Trigger First Scan
1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "feat: Add SonarCloud integration"
   git push
   ```
2. Go to **Actions** tab in GitHub
3. Wait for the "SonarCloud Analysis" workflow to complete
4. Check results in SonarCloud dashboard

## 📊 What Gets Analyzed

### Code Coverage
- Unit test coverage from Jest
- Coverage threshold: 50%
- LCOV report location: `apps/frontend/coverage/lcov.info`

### Code Quality Metrics
- **Bugs**: Potential runtime errors
- **Vulnerabilities**: Security issues
- **Code Smells**: Maintainability issues
- **Duplications**: Duplicated code blocks
- **Technical Debt**: Estimated time to fix issues

### Quality Gates
Default quality gate checks:
- ✅ Coverage on new code ≥ 80%
- ✅ Duplicated lines on new code ≤ 3%
- ✅ Maintainability rating on new code = A
- ✅ Reliability rating on new code = A
- ✅ Security rating on new code = A

## 🔧 Local Analysis (Optional)

To run SonarCloud analysis locally:

1. Install SonarScanner:
   ```bash
   npm install -g sonarqube-scanner
   ```

2. Run analysis:
   ```bash
   cd apps/frontend
   pnpm run test:coverage
   cd ../..
   sonar-scanner \
     -Dsonar.login=YOUR_SONAR_TOKEN
   ```

## 📈 Viewing Results

1. Go to [SonarCloud.io](https://sonarcloud.io)
2. Select your project
3. View:
   - **Overview**: Summary of code quality
   - **Issues**: List of bugs, vulnerabilities, code smells
   - **Measures**: Detailed metrics
   - **Activity**: History of analyses

## 🚨 Quality Gate Status

Add this badge to your README.md:
```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=YOUR_PROJECT_KEY)
```

## 🛠️ Troubleshooting

### Analysis Failed
- Check GitHub Actions logs
- Verify `SONAR_TOKEN` is set correctly
- Ensure coverage report exists: `apps/frontend/coverage/lcov.info`

### Coverage Not Showing
- Run `pnpm run test:coverage` locally first
- Check if `lcov.info` file is generated
- Verify path in `sonar-project.properties`

### Quality Gate Failed
- Review issues in SonarCloud dashboard
- Fix critical bugs and vulnerabilities first
- Improve test coverage for new code

## 📚 Resources

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Quality Gates](https://docs.sonarcloud.io/improving/quality-gates/)
- [Metric Definitions](https://docs.sonarcloud.io/digging-deeper/metric-definitions/)
