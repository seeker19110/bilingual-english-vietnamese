# PROGRESS.md — Trạng thái dự án

> Cập nhật sau mỗi mốc đáng kể. AI đọc file này để biết đang ở đâu.
> Chi tiết tính năng sản phẩm: xem mục 13 trong `CLAUDE.md`.

> **Nhịp làm việc theo giới hạn giờ (xem CLAUDE.md mục 3):**
> ≥ 70% → hoàn tất việc đang làm, tạo PR rồi **DỪNG chờ người dùng cho phép**.
> < 70% → sau khi PR **merge** thì **tự động tiếp tục** mục kế tiếp.

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
- **a11y: phủ hết route chính + sửa critical `select-name`** — Đã merge: **PR #137**.
  1. Dọn nốt `text-zinc-500/600` → `zinc-400` ở Lessons/Learn/Dictionary.
  2. Phát hiện & sửa **critical `select-name`**: 3 `<select>` (Chat/Writing/Speaking)
     thiếu accessible name → liên kết `<label htmlFor>` + `id`.
  3. Thêm 4 route vào gate a11y (/learning-path, /chat, /writing, /speaking) → gate
     nay phủ 11 trang (login + home + 9 route đã đăng nhập).
  4. `scan()` tắt animation/transition trước khi quét (đo trạng thái cuối, chống flaky
     color-contrast do `animate-fade-in`).
- Đã merge vào `main`: **PR #129** (khung) + **PR #130** (E2E + CI E2E) + **PR #132** (coverage) + **PR #133** (size-limit) + **PR #134/#135/#136/#137** (a11y).

## Đang làm

- **a11y: AA color-contrast cho MỌI theme + quét trạng thái sau tương tác** — đang ở PR.
  1. **Phát hiện** (quét Trang chủ ở cả 4 theme): theme SÁNG rớt nặng `color-contrast`
     — **Blue sky 11 · Pink 28 vi phạm (serious)**; theme tối (Xanh đêm, Rực rỡ) sạch.
     Trái cam kết "AA ở mọi theme" (CLAUDE.md mục 4.8, 8). Gate cũ chỉ quét theme mặc định.
  2. **Cơ chế sửa:** thêm biến thể Tailwind `theme-light:` (plugin `addVariant` trong
     `tailwind.config.js`) — chỉ áp dụng cho 2 theme nền sáng (Blue sky, Pink). Cho phép
     chọn SẮC ĐỘ ĐẬM HƠN cho màu Tailwind cố định (vd. `text-amber-300 theme-light:text-amber-800`)
     mà KHÔNG đụng theme tối. An toàn (opt-in từng chỗ), giữ màu trong markup (đúng triết lý token).
  3. **Sửa Trang chủ:** 7 pill nhãn (amber/lime/rose/teal/sky/violet/accent), badge chiều học
     (`text-accent/sky`), nhấn trong ô Mẹo (`text-teal/sky`) — đều thêm `theme-light:` sắc độ
     -700/-800 đạt AA. Token `--z-400` của Pink đậm hơn (`140 122 132` → `118 100 110`) để
     mọi `text-zinc-400` đạt AA trên nền hồng.
  4. **Mở rộng gate a11y:** quét Trang chủ ở **cả 4 theme** (chống tụt lùi cam kết AA mọi
     theme), kèm test quét **menu chọn giao diện sau khi MỞ** (trạng thái sau tương tác —
     axe lúc tải trang không thấy menu). `e2e/helpers/auth.ts` nhận thêm tham số `theme`.
     Gate a11y nay **15 test**, tất cả 0 critical / 0 serious.

## Tiếp theo

> Làm tăng dần, mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (theo CLAUDE.md mục 3).

- **(Tiếp nối) Đạt AA theme SÁNG cho CÁC TRANG CÒN LẠI.** PR này mới sửa + gate Trang chủ.
  Đã quét sẵn 9 route ở 2 theme sáng — số vi phạm `color-contrast` còn lại (làm follow-up,
  nên tách PR theo từng trang/hệ màu để dễ review):
  - `/phrases` **43**, `/lessons` **32** — dùng BẢNG MÀU ĐỘNG `text-{color}-300/400` theo
    chủ đề/cấp (amber/sky/violet/pink/teal/rose/indigo/orange/cyan/purple…) → sửa ở HÀM/MAP
    gán màu (không phải từng phần tử). Đây là phần lớn nhất.
  - `/progress` **6** (màu cấp CEFR `text-{lime,accent,sky,violet,amber}-300` + link `violet-400`).
  - `/dictionary` **5** (chỉ Pink), `/learning-path` **3**, `/writing` **1** (`text-red-400`).
  - `/history`, `/chat`, `/speaking`: **0** — đã sạch.
  - Cách làm sẵn (`theme-light:`); sửa xong từng trang thì thêm route vào vòng quét đa-theme.
- (Tùy chọn, giá trị thấp) Zod validate env/input — đã đánh giá ở "Quyết định quan trọng".
- (Tùy chọn) Quét a11y trạng thái sau tương tác KHÁC cần backend (vd. sau khi gửi tin
  nhắn chat) — cần mock API; chưa làm.

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

- **a11y**: gate nay phủ **11 trang** (login, /, /progress, /dictionary, /lessons, /history,
  /phrases, /learning-path, /chat, /writing, /speaking) + Trang chủ ở **cả 4 theme** + menu
  giao diện sau khi mở — 0 critical, 0 serious. **Nợ còn lại:** quét đa-theme MỚI phủ Trang chủ;
  các trang khác chưa kiểm AA ở theme sáng (Blue sky/Pink) — xem mục "Tiếp theo". Ngoài ra axe
  chỉ quét trạng thái HIỂN THỊ lúc tải + menu giao diện; các trạng thái sau tương tác khác
  (sau gửi tin chat…) cần mock backend nên chưa kiểm.
- E2E (`e2e/`) chưa nằm trong `npm run typecheck` (không thuộc tsconfig nào) —
  Playwright tự transpile khi chạy. Thêm `tsconfig.e2e.json` nếu muốn type-check.
- Trang Login dùng text tiếng Việt hard-code (chưa qua i18n) — chưa song ngữ.
