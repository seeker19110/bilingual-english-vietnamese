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
- CI: lint · typecheck · test · build · format:check.
- **E2E Playwright** (`e2e/`): smoke đăng nhập + Trang chủ **song ngữ en/vi**
  (auth giả qua localStorage, không cần backend) + **quét a11y bằng axe**.
  Sửa `button-name` (nút hiện/ẩn mật khẩu thiếu nhãn) → login hết critical.

## Đang làm

- Mở rộng E2E + cân nhắc tích hợp E2E vào CI (cần cài browser trong CI).

## Tiếp theo

- Tích hợp `test:e2e` vào CI (job riêng, `playwright install --with-deps chromium`).
- Lighthouse budget ("không tệ hơn hiện tại").
- Coverage threshold cho Vitest (đặt thấp, nâng dần).

## Quyết định quan trọng (trỏ tới ADR nếu có)

- GIỮ NGUYÊN phiên bản: Tailwind 3, ESLint 8 (`.eslintrc.cjs`) — KHÔNG nâng v4/flat config.
- Zod (validate env/input): **đã đánh giá là giá trị thấp hiện tại** — code đã
  validate input rất kỹ bằng tay (xem `api/ai.ts`) và env lazy/feature-gated;
  ưu tiên E2E/a11y trước. Làm Zod sau nếu cần.

## Nợ kỹ thuật (chỗ "làm tạm" cần quay lại)

- **a11y `color-contrast` (serious)**: vài chữ phụ (zinc-400) chưa đạt AA ở nền tối.
  Hiện để **baseline** trong `e2e/a11y.spec.ts` (cổng chặn vi phạm serious MỚI,
  chấp nhận nợ này). Cần fix ở PR điều chỉnh design token theme riêng.
- E2E (`e2e/`) chưa nằm trong `npm run typecheck` (không thuộc tsconfig nào) —
  Playwright tự transpile khi chạy. Thêm `tsconfig.e2e.json` nếu muốn type-check.
- Trang Login dùng text tiếng Việt hard-code (chưa qua i18n) — chưa song ngữ.
