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
- Đã merge vào `main`: **PR #129** (khung) + **PR #130** (E2E + CI E2E) + **PR #132** (coverage) + **PR #133** (size-limit) + **PR #134** + **PR #135** (a11y).

## Đang làm

- **Sửa flaky test a11y trang chủ** — đang ở PR (chưa merge). Con số streak ở Home
  (dòng 189) còn `text-zinc-500` (`text-sm` bold "0") trên nền thẻ tối → contrast ~4.0,
  SÁT ngưỡng 4.5 nên axe lúc bắt lúc không (pass local + CI #134, FAIL CI #135). Đổi
  sang `text-zinc-400` (contrast ~7, hết flaky). Đã chạy lặp 5× trang chủ: pass đều.

## Tiếp theo

> Làm tăng dần, mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (theo CLAUDE.md mục 3).

- (Tùy chọn) Đưa nốt /chat, /writing, /speaking, /learning-path vào gate a11y
  (đã probe = 0 vi phạm color-contrast, chỉ chưa thêm vào spec).
- (Tùy chọn, giá trị thấp) Zod validate env/input — đã đánh giá ở "Quyết định quan trọng".

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

- **a11y `color-contrast`**: ĐÃ dọn — caption `zinc-500/600` ở Home + Dashboard +
  QuickActions (dùng chung) đổi sang `zinc-400`. Gate a11y nay quét /login, /, /progress,
  /dictionary, /lessons, /history, /phrases (đều 0 vi phạm). Lưu ý: axe chỉ quét phần
  HIỂN THỊ lúc tải — caption ẩn dưới fold / khối thu gọn chưa chắc được kiểm.
- E2E (`e2e/`) chưa nằm trong `npm run typecheck` (không thuộc tsconfig nào) —
  Playwright tự transpile khi chạy. Thêm `tsconfig.e2e.json` nếu muốn type-check.
- Trang Login dùng text tiếng Việt hard-code (chưa qua i18n) — chưa song ngữ.
