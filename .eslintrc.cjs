module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    // Phải để CUỐI: tắt các luật ESLint xung đột với Prettier (định dạng do
    // Prettier lo, ESLint không cảnh báo format nữa).
    'prettier',
  ],
  ignorePatterns: ['dist', 'node_modules', 'scripts', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
