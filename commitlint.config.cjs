// Kiểm tra commit message theo chuẩn Conventional Commits (feat/fix/docs/...).
// Chạy tự động qua hook .husky/commit-msg. Xem CLAUDE.md mục 11 (Quy ước Git).
module.exports = {
  extends: ['@commitlint/config-conventional'],
}
