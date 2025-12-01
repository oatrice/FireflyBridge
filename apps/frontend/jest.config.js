const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    // Add more setup options before each test is run
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testPathIgnorePatterns: ['/node_modules/', '\\.bun\\.test\\.ts$'],

    // Custom reporter for detailed test tracking
    reporters: [
        'default',
        '<rootDir>/jest-custom-reporter.js'
    ],

    // Coverage configuration
    collectCoverage: true,
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
        '!**/test-reports/**',
        // API Routes (should have integration tests, not unit tests)
        '!app/api/**',
        // Auth & Config files (hard to unit test)
        '!lib/auth.ts',
        '!lib/auth-client.ts',
        '!lib/types.ts',
        // Admin sub-pages (should have E2E tests)
        '!app/admin/hotlines/**',
        '!app/admin/shelters/**',
        '!app/admin/donations/**',
        // Special pages (should have E2E tests)
        '!app/cases/**',
        '!app/rescue-contacts/**',
        '!app/test-report/**',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
