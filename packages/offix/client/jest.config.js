/* eslint-disable */
const baseConfig = require("../../../jest.config");
const packageName = "client";

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
  testRegex: `(packages/${packageName}/.*/__tests__/.*|\\.(test|spec))\\.tsx?$`,
  testURL: 'http://localhost/',
  moduleDirectories: [
      'node_modules',
  ],
  modulePaths: [
      `<rootDir>/packages/${packageName}/src/`,
  ],
  projects: [`<rootDir>/packages/${packageName}/jest.config.js`],
  name: packageName,
  displayName: packageName,
  rootDir: '../../..',
};
