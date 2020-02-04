// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  preset: "ts-jest",
  clearMocks: true,
  coverageDirectory: "coverage",
  moduleFileExtensions: [
    "ts",
    "js",
    "json",
    "jsx",
    "tsx",
    "node"
  ],
  testMatch: [
    "**/test/*.test.tsx",
    // "**/test/integration/*.test.ts"
    // "**/__tests__/**/*.[jt]s?(x)",
    // "**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
};
