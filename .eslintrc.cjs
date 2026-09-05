module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    // Gác accessibility TĨNH cho JSX (CLAUDE.md §4.5). Trước 2026-09-05 tài liệu nói "kèm lint
    // jsx-a11y" nhưng gói chưa từng được cài — lớp gác này thực tế trống, chỉ còn axe E2E chạy
    // sau và chậm. Audit toàn diện 2026-09-05 (F1) phát hiện, nay bật thật.
    'plugin:jsx-a11y/recommended',
    // Phải để CUỐI: tắt các luật ESLint xung đột với Prettier (định dạng do
    // Prettier lo, ESLint không cảnh báo format nữa).
    'prettier',
  ],
  // 'scripts' TỪNG bị bỏ qua hoàn toàn (audit 2026-09-05, F7): script vận hành thật (backup,
  // seed, migration) và cả test canh cổng CI đều không được lint. Nay lint như mọi mã khác.
  // 'scripts/archive' = các script sinh dữ liệu DÙNG MỘT LẦN đã đóng băng, giữ lại làm lịch sử
  // chứ không chạy nữa — không sửa để chiều lint.
  ignorePatterns: [
    'dist',
    'dist-server',
    'node_modules',
    '.eslintrc.cjs',
    'scripts/archive',
    // Đầu ra của công cụ, không phải mã nguồn của dự án.
    'coverage',
    'playwright-report',
    'test-results',
  ],
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
