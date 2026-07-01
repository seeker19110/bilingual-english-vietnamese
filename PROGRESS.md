# PROGRESS.md — Trạng thái dự án

> Cập nhật sau mỗi mốc đáng kể. AI đọc file này để biết đang ở đâu.
> Chi tiết tính năng sản phẩm: xem mục 13 trong `CLAUDE.md`.

> **Nhịp làm việc theo giới hạn giờ (xem CLAUDE.md mục 3):**
> ≥ 70% → hoàn tất việc đang làm, tạo PR rồi **DỪNG chờ người dùng cho phép**.
> < 70% → sau khi PR **merge** thì **tự động tiếp tục** mục kế tiếp.

## Giai đoạn hiện tại

- GĐ 4–5 (Phát triển + nâng chất lượng). Sản phẩm đã deploy thật
  (https://en-vi.donghanhcungban.com). Đang **áp bộ khung** lên dự án có sẵn
  theo `docs/framework/AP-DUNG-vao-du-an-co-san.md` — Lớp 1 (hàng rào) xong;
  Lớp 2 (E2E, a11y, bundle-size, i18n Login) đã đóng — còn rà nợ kỹ thuật
  nhỏ lẻ (xem "Nợ kỹ thuật") + việc sản phẩm mới (thanh toán Pro, CEFR).

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
- **a11y: AA color-contrast cho MỌI theme + quét trạng thái sau tương tác** — đã merge
  (**PR #140/#141/#142**). Thêm biến thể Tailwind `theme-light:` (plugin `addVariant`,
  chỉ áp cho 2 theme nền sáng Blue sky/Pink) để chọn sắc độ đậm hơn cho màu Tailwind cố
  định mà KHÔNG đụng theme tối; chỉnh token `--z-400` của Pink. Phủ AA cho Trang chủ (chiều
  A+B), menu giao diện đã mở, và 9 trang đã đăng nhập ở cả 4 theme (qua map dùng chung:
  `pos.ts`, `COLOR_MAP` Phrases, `COLORS` Lessons, CEFR Dashboard, tab Learn, IPA…). Bắt
  thêm lỗi sẵn có ở theme tối Rực rỡ (IPA fuchsia /70 → /90). Gate a11y khi đó **47 test**.
- **a11y: gate MÀN KẾT QUẢ cần backend (Chat/Writing/Speaking)** — phần a11y CUỐI còn lại.
  E2E chặn `/api/claude` trả câu mẫu cố định (`mockClaude`) và vô hiệu hóa TTS cho trang Nói
  (`muteTts`: chặn `/api/tts` + stub `speechSynthesis` để `speakBilingual` không treo) để
  dựng UI kết quả (bong bóng trả lời + nhận xét, bảng điểm IELTS + lỗi cần sửa) rồi quét axe
  ở **cả 4 theme**. Gate bắt được lỗi SÓT từ đợt trước: thân nhận xét `text-amber-200` ở bong
  bóng Chat (`src/pages/Chat.tsx`) + Speaking (`src/pages/Speaking.tsx`) thiếu `theme-light:`
  → contrast chỉ 1.19 trên nền sáng; đã thêm `theme-light:text-amber-800` (khớp dấu ✅ cùng
  ô). Gate a11y nay **59 test** (62 E2E tổng) — 0 critical / 0 serious ở mọi theme + mọi
  trạng thái tương tác (gồm cả màn kết quả AI). → Đóng hẳn nợ a11y. Đã merge: **PR #143**.
- **CI deploy: health check chờ + retry** — gate deploy thật chờ app lên hẳn rồi mới coi là
  thành công, tự retry thay vì fail ngay ở lần gọi đầu. Đã merge: **PR #144** + **#145**.
- **chore(dictionary):** bỏ từ "sauté" khỏi từ điển (không phù hợp ngữ cảnh). Đã merge: **PR #146**.
- **i18n Trang đăng nhập (song ngữ vi/en)** — Trang Login là trang cuối còn hard-code tiếng
  Việt; đã chuyển toàn bộ chữ sang hệ i18n sẵn có (`useLang()` → `T`, `src/i18n/index.ts`).
  Thay khối key `login*` cũ (bỏ hoang, không khớp thiết kế) bằng bộ key khớp Login hiện tại
  cho cả vi/en (brand, tagline, tab đăng nhập/đăng ký, placeholder, nút, lỗi, feature pills).
  Vì `/login` không có header, **thêm nút gạt VI/EN** (segmented, `aria-pressed`, `role=group`)
  góc trên phải để người nước ngoài (chiều B) đổi ngôn ngữ trước khi đăng nhập. Chữ vi giữ
  nguyên byte → không đổi hình + smoke cũ còn xanh. E2E: thêm 2 test (login tiếng Anh khi
  `ui_lang=en` + nút VI/EN đổi ngôn ngữ tại chỗ). a11y `/login` vẫn 0 critical/serious. Đã
  merge: **PR #147**.
- **docs:** đồng bộ `CLAUDE.md`/`PROGRESS.md` với code thật (sửa 3 ghi chú lỗi thời — STT đã tách
  lượt riêng từ trước chứ không dùng chung `speaking`; `security.ts` không còn debug log tạm; CEFR
  đã có % hoàn thành theo cấp) + viết `PROJECT.md` từ template rỗng thành tài liệu thật (schema,
  API, MoSCoW…). Đã merge: **PR #148**.
- **`tsconfig.e2e.json`** — đóng nợ "E2E chưa nằm trong `npm run typecheck`": thêm cấu hình
  typecheck riêng cho `e2e/` + `playwright.config.ts` (mirror `tsconfig.api.json`), gộp vào
  `npm run typecheck` qua script mới `typecheck:e2e`. CI (`npm run typecheck`) nay tự phủ
  luôn E2E, không cần đổi workflow. Đây là PR hiện tại.

## Đang làm

- (Chờ duyệt) PR `tsconfig.e2e.json` — xem mục cuối "Đã xong".

## Tiếp theo

> Làm tăng dần, mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (theo CLAUDE.md mục 3).

- Thanh toán Pro (cổng nâng cấp gói) — cần quyết định sản phẩm (nhà cung cấp, giá, webhook) trước
  khi code; theo CLAUDE.md mục 12 phải dừng hỏi người dùng trước khi bắt đầu.
- Gắn nhãn CEFR cho từ vựng mở rộng (việc dữ liệu — xem CLAUDE.md mục 13).
- (Tùy chọn, giá trị thấp) Zod validate env/input — đã đánh giá ở "Quyết định quan trọng".
- a11y đã hoàn tất (gồm cả màn kết quả AI qua mock API). Không còn hạng mục a11y chừa lại.
  Nếu cần phủ thêm: trạng thái STT thật (ghi âm trình duyệt) — giá trị thấp vì luồng STT
  dùng chung UI bong bóng đã được gate qua màn kết quả Speaking.

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

- **a11y**: gate nay **59 test** — login + Trang chủ (chiều A) ×4 theme + Trang chủ chiều B ×2
  theme sáng + menu giao diện đã mở ×4 theme + 9 trang × 4 theme (/progress, /dictionary,
  /lessons, /history, /phrases, /learning-path, /chat, /writing, /speaking) + **màn KẾT QUẢ
  AI (Chat/Writing/Speaking) × 4 theme** (mock `/api/claude`) — 0 critical, 0 serious ở MỌI
  theme, gồm cả trạng thái sau tương tác có/không cần backend. Nợ a11y đã đóng.
- ~~E2E (`e2e/`) chưa nằm trong `npm run typecheck`~~ ĐÃ XONG: thêm `tsconfig.e2e.json` +
  script `typecheck:e2e`, gộp vào `npm run typecheck` (CI tự phủ, không cần đổi workflow).
- ~~Trang Login dùng text tiếng Việt hard-code (chưa qua i18n) — chưa song ngữ.~~ ĐÃ XONG:
  Login nay dùng i18n `T` + có nút gạt VI/EN (xem "Đã xong" đợt áp khung, PR #147).
