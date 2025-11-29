// eslint.config.js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default ts.config(
  {
    ignores: ['node_modules/**', '.next/**', 'dist/**', 'next-env.d.ts', 'tailwind.config.ts'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { prettier: prettierPlugin },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-console': 'off',
    },
  }
);
