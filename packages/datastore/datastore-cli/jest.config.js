/* eslint-disable */
const baseConfig = require("../../../jest.config");
const packageName = "datastore-cli";

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
    `<rootDir>/packages/datastore/${packageName}`,
  ],
  collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
  ],
  testRegex: `(packages/datastore/${packageName}/.*/__tests__/.*|\\.(test|spec))\\.tsx?$`,
  testURL: 'http://localhost/',
  moduleDirectories: [
      'node_modules',
  ],
  modulePaths: [
      `<rootDir>/packages/datastore/${packageName}/src/`,
  ],
  projects: [`<rootDir>/packages/datastore/${packageName}/jest.config.js`],
  name: packageName,
  displayName: packageName,
  rootDir: '../../..',
};
