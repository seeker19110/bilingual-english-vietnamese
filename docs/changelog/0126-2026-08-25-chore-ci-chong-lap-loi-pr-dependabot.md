# chore(ci): chống lặp lỗi PR dependabot (2026-08-25)

Xử lý 2 PR dependabot #641/#656 lộ ra 3 lỗi hệ thống, PR này chặn từ gốc:

- **#656 (eslint-plugin-react-refresh 0.4.26→0.5.4) ĐÓNG** — bản 0.5.x đòi ESLint 9 + flat
  config, xung đột stack ghim ESLint 8 (`npm ci` fail ngay). Đã `@dependabot ignore this
dependency`. → `dependabot.yml` thêm khối `ignore` cho toàn bộ stack ghim cứng (React/TS/
  Tailwind/ESLint và các plugin ESLint) để dependabot không mở PR chắc chắn bị từ chối nữa.
- **#641 (eslint-config-prettier 9→10.1.8) NHẬN** — 10.x vẫn CJS/eslintrc, quality+e2e xanh;
  chỉ đỏ `metadata` vì body bot không có 6 mục evidence, phải viết lại tay. → `pr-policy.yml`
  bỏ qua cổng evidence cho `dependabot[bot]` (vẫn kiểm tiêu đề; an toàn do quality+e2e gác).
- **Dependabot than thiếu label `dependencies` ở mọi PR** — repo chưa tạo label đó. → bỏ cấu
  hình `labels` trong `dependabot.yml` (muốn dùng lại thì tạo label trên GitHub trước).
