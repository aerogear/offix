module.exports = {
  verbose: true,
  projects: ["<rootDir>/packages/*/jest.config.js"],
  collectCoverageFrom: [
    "<rootDir>/packages/*/src/**/*.{ts,tsx}"
  ],
  moduleDirectories: ["node_modules"],
  preset: "ts-jest",
  transform: {
    "^.+\\.jsx?$": ["babel-jest"]
  }
};
