module.exports = {
  extends: ['next', 'next/core-web-vitals'],
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
  },
  rules: {
    'react/react-in-jsx-scope': 'off'
  },
};
