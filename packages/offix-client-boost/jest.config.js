// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
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
      "**/test/*.test.ts",
      // "**/test/integration/*.test.ts"
      // "**/__tests__/**/*.[jt]s?(x)",
      // "**/?(*.)+(spec|test).[tj]s?(x)"
    ],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    }
  };
  