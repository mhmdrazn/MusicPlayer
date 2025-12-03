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
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // 3. CONFIG COVERAGE (REVISI PENTING)
  // Menambahkan 'json-summary' agar CI bisa membaca persentase coverage
  coverageReporters: ['text', 'lcov', 'json', 'json-summary'],
  
  // Memastikan folder output bernama 'coverage'
  coverageDirectory: 'coverage',

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