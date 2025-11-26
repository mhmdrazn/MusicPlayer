/** @type {import('jest').Config} */
const config = {
  // Gunakan preset untuk TS + React + JSdom
  preset: "ts-jest",
  testEnvironment: "jsdom",

  // Support file App Router Next.js
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  moduleNameMapper: {
    // Alias dari tsconfig (Next.js)
    "^@/(.*)$": "<rootDir>/$1",

    // Mock Next.js components
    "next/navigation": "<rootDir>/__tests__/mocks/next-navigation.ts",
    "next/image": "<rootDir>/__tests__/mocks/next-image.tsx",

    // Wajib untuk CSS & assets
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.ts"
  ],

  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "<rootDir>/dist/"
  ],

  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  // Optional tapi recommended untuk CI
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.tsx",
    "components/**/*.tsx",
    "!**/node_modules/**",
  ],
};

module.exports = config;
