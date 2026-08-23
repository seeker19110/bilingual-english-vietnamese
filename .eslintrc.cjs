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
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
  overrides: [
    {
      // V2-01 domain-boundary ADR (docs/adr/0003-bien-gioi-domain-v2.md): packages/ là Platform
      // Layer dùng chung cho mọi domain/app tương lai — không được phụ thuộc ngược vào
      // Experience Layer (apps/dhcb, apps/hub). Vi phạm hướng ngược lại (apps/* import
      // packages/*) là bình thường và KHÔNG bị chặn ở đây.
      files: ['packages/**/*.ts', 'packages/**/*.tsx'],
      excludedFiles: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/apps/*', '**/apps/**'],
                message:
                  'packages/ (Platform Layer) không được import từ apps/ (Experience Layer) — xem docs/adr/0003-bien-gioi-domain-v2.md. Nếu 2 phía cần dùng chung kiểu dữ liệu, đưa type đó vào packages/core-contracts/.',
              },
              {
                // [2026-08-23, workspace thật] packages/ cũng không được import ngược api/ —
                // handler HTTP thuộc tầng server. Logic dùng chung phải nằm trong packages/
                // (đợt dời 21 file api/_lib -> core-http/core-auth/core-billing/core-ai/core-chat).
                group: ['**/api/*', '**/api/**'],
                message:
                  'packages/ không được import từ api/ — chuyển logic dùng chung vào gói @dhcb/* tương ứng (xem docs/research/dac-ta-cai-to-cau-truc-2026-08-23.md).',
              },
            ],
          },
        ],
      },
    },
  ],
}
