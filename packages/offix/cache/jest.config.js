/* eslint-disable */
const baseConfig = require("../../../jest.config");
const packageName = "cache";

module.exports = {
  ...baseConfig,
  rootDir: '../../..',
  moduleFileExtensions: [
    "ts",
    "js",
    "json",
    "jsx",
    "tsx",
    "node"
  ],
  roots: [
    `<rootDir>/packages/offix/${packageName}`,
  ],
  collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
  ],
  testRegex: `(packages/offix/${packageName}/.*/__tests__/.*|\\.(test|spec))\\.tsx?$`,
  testURL: 'http://localhost/',
  moduleDirectories: [
      'node_modules',
  ],
  modulePaths: [
      `<rootDir>/packages/offix/${packageName}/src/`,
  ],
  projects: [`<rootDir>/packages/offix/${packageName}/jest.config.js`],
  name: packageName,
  displayName: packageName,
  rootDir: '../../..',
};
