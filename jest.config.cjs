const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Mengarahkan Next.js ke root directory project
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  // 1. Setup Environment
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 2. LOKASI TEST
  // Kita paksa Jest mencari file .test.ts/.tsx di dalam folder __tests__ di root
  testMatch: [
    '<rootDir>/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/**/*.{spec,test}.{ts,tsx,js,jsx}',
  ],

  // 3. Coverage
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!lib/db/**',
    '!lib/auth.ts',
    '!lib/supabase.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  coveragePathIgnorePatterns: ['/node_modules/', '/.next/'],

  // 4. Module Mapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(config);
