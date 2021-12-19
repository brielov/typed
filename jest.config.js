module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transformIgnorePatterns: ["node_modules/(?!rsts)"],
  transform: {
    "\\.m?jsx?$": "jest-esm-transformer",
  },
};
