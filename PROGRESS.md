# PROGRESS.md — Trạng thái dự án

> Cập nhật sau mỗi mốc đáng kể. AI đọc file này để biết đang ở đâu.
> Chi tiết tính năng sản phẩm: xem mục 13 trong `CLAUDE.md`.

## Giai đoạn hiện tại

- GĐ 4–5 (Phát triển + nâng chất lượng). Sản phẩm đã deploy thật
  (https://en-vi.donghanhcungban.com). Đang **áp bộ khung** lên dự án có sẵn
  theo `docs/framework/AP-DUNG-vao-du-an-co-san.md` — Lớp 1 (hàng rào) xong,
  đang sang Lớp 2 (lấp lỗ hổng chất lượng: E2E, a11y, Lighthouse).

## Đã xong (đợt áp khung)

- Prettier + eslint-config-prettier; format toàn repo; `format:check` trong CI.
- `noUncheckedIndexedAccess` bật (app + api), sửa sạch 110 lỗi (behavior-preserving).
- husky + lint-staged + commitlint (pre-commit + commit-msg).
- **E2E Playwright** (`e2e/`): smoke đăng nhập + Trang chủ **song ngữ en/vi**
  (auth giả qua localStorage, không cần backend) + **quét a11y bằng axe**.
  Sửa `button-name` (nút hiện/ẩn mật khẩu thiếu nhãn) → login hết critical.
- **CI gate trên mọi PR**: lint · typecheck · test · build · format:check ·
  **E2E (job `e2e` riêng: Playwright + axe)**.
- **Coverage ratchet (Vitest)**: `@vitest/coverage-v8` + ngưỡng SÀN = "không tệ hơn
  hiện tại" (stmts/lines 13 · branches 80 · funcs 50; baseline 13.63/87.89/51.03),
  script `test:coverage`, gate trong CI. Đã merge: **PR #132**.
- **Bundle-size budget (`size-limit`)**: gác kích thước JS/CSS ban đầu (brotli) = "không
  tệ hơn hiện tại" — Initial JS ≤ 116 kB, CSS ≤ 9 kB; script `size` + bước CI trong job
  `quality`. (Đổi từ Lighthouse — xem "Quyết định quan trọng".) Đã merge: **PR #133**.
- **a11y `color-contrast` (Home)**: 3 nhãn nhỏ ở Home đạt AA + gỡ baseline khỏi
  `e2e/a11y.spec.ts`. Đã merge: **PR #134**.
- **a11y `color-contrast` (Dashboard/QuickActions) + mở rộng gate**: đổi caption
  `zinc-500/600` → `zinc-400`; thêm 5 route đã-đăng-nhập vào gate a11y. Đã merge: **PR #135**.
- **a11y flaky fix (Home)**: số streak `zinc-500` → `zinc-400` (contrast sát ngưỡng gây
  flaky CI). Đã merge: **PR #136**.
- Đã merge vào `main`: **PR #129** (khung) + **PR #130** (E2E + CI E2E) + **PR #132** (coverage) + **PR #133** (size-limit) + **PR #134/#135/#136** (a11y).

## Đang làm

- **a11y: phủ hết route chính + sửa critical `select-name`** — đang ở PR (chưa merge).
  1. Dọn nốt `text-zinc-500/600` → `zinc-400` ở Lessons/Learn/Dictionary.
  2. Phát hiện & sửa **critical `select-name`**: 3 `<select>` (Chat/Writing/Speaking)
     thiếu accessible name → liên kết `<label htmlFor>` + `id`.
  3. Thêm 4 route vào gate a11y (/learning-path, /chat, /writing, /speaking) → gate
     nay phủ 11 trang (login + home + 9 route đã đăng nhập).
  4. `scan()` tắt animation/transition trước khi quét (đo trạng thái cuối, chống flaky
     color-contrast do `animate-fade-in`). Đã chạy `--workers=1 --repeat-each=2` = 22/22 pass.

## Tiếp theo

> Làm tăng dần, mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (theo CLAUDE.md mục 3).

- (Tùy chọn, giá trị thấp) Zod validate env/input — đã đánh giá ở "Quyết định quan trọng".
- (Tùy chọn) Quét a11y cả trạng thái SAU tương tác (mở dropdown, sau khi gửi tin nhắn…)
  — hiện gate chỉ quét lúc tải trang.

## Quyết định quan trọng (trỏ tới ADR nếu có)

- GIỮ NGUYÊN phiên bản: Tailwind 3, ESLint 8 (`.eslintrc.cjs`) — KHÔNG nâng v4/flat config.
- **Perf budget: chọn `size-limit` thay Lighthouse CI.** Lighthouse 12.6 không đo được
  app trong môi trường sandbox/CI hiện có (lỗi `NO_FCP` ở mọi cấu hình: full/headless-shell,
  headless/xvfb, route `/` và `/login`) dù app render bình thường qua Playwright → không lấy
  được baseline để đặt ngưỡng. `size-limit` gác kích thước bundle (đòn bẩy perf chính của SPA),
  deterministic, không cần browser, verify được cả local lẫn CI. Cân nhắc lại Lighthouse sau
  nếu chạy ổn trên runner thật.
- Zod (validate env/input): **đã đánh giá là giá trị thấp hiện tại** — code đã
  validate input rất kỹ bằng tay (xem `api/ai.ts`) và env lazy/feature-gated;
  ưu tiên E2E/a11y trước. Làm Zod sau nếu cần.

## Nợ kỹ thuật (chỗ "làm tạm" cần quay lại)

- **a11y**: ĐÃ dọn `color-contrast` (caption `zinc-500/600` → `zinc-400` toàn app) và
  sửa critical `select-name` (3 `<select>` Chat/Writing/Speaking). Gate a11y nay phủ
  **11 trang** (login, /, /progress, /dictionary, /lessons, /history, /phrases,
  /learning-path, /chat, /writing, /speaking) — 0 critical, 0 serious. Lưu ý: axe chỉ
  quét phần HIỂN THỊ lúc tải — trạng thái sau tương tác (dropdown mở, sau gửi tin) chưa kiểm.
- E2E (`e2e/`) chưa nằm trong `npm run typecheck` (không thuộc tsconfig nào) —
  Playwright tự transpile khi chạy. Thêm `tsconfig.e2e.json` nếu muốn type-check.
- Trang Login dùng text tiếng Việt hard-code (chưa qua i18n) — chưa song ngữ.
