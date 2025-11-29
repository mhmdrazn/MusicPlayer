/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
/* Flat config for ESLint (compatible with ESLint v9+ & Next.js config) */
const nextConfig = require('eslint-config-next');

module.exports = [
  // include Next.js recommended config
  nextConfig && nextConfig.configs && nextConfig.configs['core-web-vitals']
    ? nextConfig.configs['core-web-vitals']
    : nextConfig,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
];
// Minimal flat ESLint config for ESLint v9+ with TypeScript support.
// This avoids depending on the Next.js flat config to keep compatibility stable.
const tsEslint = require('@typescript-eslint/eslint-plugin');

module.exports = [
  // Ignore build and dependency folders
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  // Default language options (TS/JS)
  {
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@typescript-eslint': tsEslint },
    rules: {
      // TypeScript-aware rules
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow JSX without React in scope (Next.js/automatic runtime)
      'react/react-in-jsx-scope': 'off',
    },
  },
  // You can add file-specific overrides here if needed.
];
