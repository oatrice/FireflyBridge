module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/scripts/__tests__/**/*.test.js'],
    collectCoverageFrom: ['scripts/**/*.js', '!scripts/__tests__/**'],
    coverageDirectory: 'coverage',
};
