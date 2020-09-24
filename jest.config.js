module.exports = {
  transform: {
    "\\.tsx?$": "ts-jest",
  },
  roots: ["<rootDir>/src"],
  testPathIgnorePatterns: ["__setup__.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/__setup__.ts"],
  clearMocks: true,
}
