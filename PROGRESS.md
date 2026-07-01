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
  nhỏ lẻ (xem "Nợ kỹ thuật") + việc sản phẩm mới (thanh toán Pro, chạy thật
  script gắn nhãn CEFR).

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
  luôn E2E, không cần đổi workflow. Đã merge: **PR #149**.
- **Hạ tầng gắn nhãn CEFR cho từ vựng mở rộng** — repo không có wordlist CEFR nào sẵn để tra
  chính xác (đã xác nhận), nên chọn cách **AI phân loại theo lô** (quyết định cùng người dùng).
  Thêm `CefrWordLevel` (`'A1'..'C2'`, rộng hơn `CefrLevel['id']` A1-B2 của lộ trình vì từ điển
  có cả từ nâng cao) + field `level?` optional trên `DictEntry` (`src/types.ts`,
  `api/_lib/dictionaryData.ts`) — CHƯA có dữ liệu thật. Logic thuần tách riêng + có test
  (`api/_lib/cefrTagging.ts` + `.test.ts`, 9 test: dựng prompt, parse JSON từ AI kể cả khi lỡ bọc
  markdown/có chữ thừa, bỏ qua phần tử lỗi không throw cả batch). Script orchestrator
  `scripts/tag-cefr-levels.ts` (`npm run tag:cefr`) đọc `public/data/dictionary/chunk-*.json`,
  ưu tiên provider theo key có sẵn (Gemini free → Groq free → Anthropic trả phí, khớp
  `.env.example`), ghi lại sau MỖI batch (an toàn Ctrl+C, resume bằng cách bỏ qua từ đã có
  `level`). Đã kiểm: gọi thật tới Gemini API với key giả từ sandbox này → nhận đúng lỗi 400
  "API key not valid" (xác nhận mạng + luồng lỗi/retry hoạt động, file KHÔNG bị ghi hỏng khi
  batch lỗi). **CHƯA chạy thật** (sandbox không có `GEMINI_API_KEY`/`GROQ_API_KEY`/
  `ANTHROPIC_API_KEY`) — ~9.500 từ × phân loại AI là quyết định có ảnh hưởng (chi phí/quota, dù
  Gemini free) nên dừng hỏi người dùng trước khi chạy thật, theo CLAUDE.md mục 12. Đã hỏi người
  dùng có muốn chạy ngay trong phiên không — chọn **tự chạy sau** trên máy có `.env`. Đã merge:
  **PR #150**.
- **docs:** đồng bộ nốt `PROJECT.md` (còn sót từ đợt PR #148: chưa cập nhật khi #149/#150 merge —
  i18n Login/`tsconfig.e2e.json`/hạ tầng CEFR ghi nhầm là "chưa xong"/"tiếp theo"). Đã merge: **PR #151**.
- **fix(learning-path):** 5 unit tái dùng trùng tên nhân vật giữa các bài (Mai, Lan×2, Linh, Trang)
  → đổi tên không trùng (Vân, Yến, Trâm, Ly, Hạnh); thêm `speakerAGender`/`speakerBGender` cho
  `Dialogue` (gán cho cả 63 hội thoại đã đặt tên). Tab "Lộ trình" (`RoadmapTab`) giờ phát **2 giọng
  TTS riêng** cho 2 nhân vật hội thoại (trước dùng chung 1 giọng) — áp dụng cho cả nút "Phát tất
  cả" lẫn nút loa từng câu (`KaraokeText` nhận thêm prop `voice` tùy chọn). Đã merge: **PR #152**.
- **chore:** thêm cấu hình model cho Claude Code (`.claude/settings.json`) — mặc định `haiku`,
  fallback `opus` cho việc phức tạp, bật thinking mode + effort cao, cân bằng chi phí/chất lượng
  cho các phiên làm việc trên repo này. Đã merge: **PR #153/#154**.
- **Zod validate input (đợt 1 — `api/stt.ts` + `api/tts.ts`)** — thêm `api/_lib/validation.ts`
  (`readJsonBody` + `validateBody`, dùng chung) thay cho parse/validate tay ở 2 endpoint có body
  JSON đơn giản nhất, giữ NGUYÊN status code + message (kể cả 413 khi audio quá dài, qua
  `.refine(..., { params: { status } })`). Có 5 test cho helper (`validation.test.ts`). Đã merge:
  **PR #156**.
- **Zod validate input (đợt 2 — `api/push.ts`)** — validate riêng phần `subscription` (bắt buộc +
  đúng kiểu, dùng `SubscriptionSchema` + `validateBody`) cho action `subscribe`/`unsubscribe`, giữ
  NGUYÊN message lỗi cũ ("Thiếu dữ liệu subscription", cùng 1 message cho mọi field thiếu — không
  đổi để giữ hành vi). `action`/`remindHour`/`hour`/`secret` GIỮ NGUYÊN cách kiểm tra tay hiện có
  (vốn đã có `typeof` guard, không có lỗi tiềm ẩn như `subscription` trước đây dùng `as` cast +
  truthy check lỏng lẻo). Đã merge: **PR #157**.
- **fix(karaoke):** hội thoại "Phát tất cả" trong Lộ trình (`RoadmapTab.tsx` `DialogueView`)
  KHÔNG sáng chữ theo giọng đọc như khi bấm nghe từng dòng — vì `startPlayAll` gọi `speak()`
  không kèm callback `onWord`, trong khi mỗi dòng dùng `KaraokeText` (tự quản lý trạng thái
  riêng, không biết cha đang phát). Sửa: `KaraokeText` nhận thêm prop `externalState` (tùy chọn,
  KHÔNG đổi hành vi 6+ nơi khác đang dùng component — Từ điển/Cụm từ/Từ vựng hôm nay/Lộ trình
  ví dụ ngữ pháp) để cha điều khiển trạng thái phát/từ đang đọc; `DialogueView` theo dõi
  `dlgWordSync` (chỉ khi audio đang đọc ĐÚNG `ln.en` — văn bản `KaraokeText` hiển thị) và truyền
  xuống dòng đang phát.
- **Icon loa/micro to hơn (1.5x)**: `KaraokeText` (loa, dùng chung toàn ứng dụng), nút "Nghe câu
  này" + `InlinePronounce` (micro) trong hội thoại (`Lessons.tsx`, dùng lại ở `RoadmapTab.tsx`) —
  vùng chạm rõ hơn trên mobile. (Thử 3x trước, người dùng phản hồi to quá → chỉnh còn 1.5x.) Đã
  kiểm bằng Playwright screenshot thật (không chỉ đọc code): layout không vỡ ở mobile viewport
  (390px), a11y gate `/lessons` + `/learning-path` vẫn 0 critical/serious ở cả 4 theme.
- **Karaoke áp dụng cho MỌI TTS >1 từ** (theo yêu cầu mở rộng) — 2 giai đoạn, gộp chung PR #158:
  - **Đợt 1 (tái dùng `KaraokeText` có sẵn):** `Chat.tsx` (2 chỗ: câu trả lời + nhận xét),
    `Flashcard.tsx`/`WordCard.tsx` (câu ví dụ `ex_en`) — thay `SpeakButton` + chữ thường bằng
    `KaraokeText`. Bỏ luôn chữ ví dụ tĩnh lặp lại (trước đây hiện 2 lần: 1 lần chữ thường + 1 nút
    loa riêng) → gộp thành 1 chỗ duy nhất có karaoke.
  - **Đợt 2 (thêm hạ tầng mới):** `Speaking.tsx` (tính năng chính) — `speakBilingual()`
    (`src/lib/tts.ts`) nhận thêm 2 tham số cuối tùy chọn `onSpeechWord`/`onFeedbackWord` (không đổi
    lời gọi cũ, tham số optional ở cuối). `SpeakBubble` thêm component `HighlightText` (giống
    `WordText` ở Lessons.tsx) + state `wordSync` (tin nhắn/phần/từ đang phát) ở component cha, áp
    dụng cho cả lúc AI vừa trả lời (tự phát) lẫn bấm "Nghe lại". Gate hiển thị bằng `speaking &&
wordSync?.msgId===...` — hết phát (mute/gửi tin mới/dừng) tự tắt highlight mà không cần dọn
    state ở từng nơi gọi `stopSpeaking()`.
  - Đã kiểm: `npx playwright test e2e/a11y.spec.ts --grep "chat|speaking|dictionary|learn"` —
    24/24 pass, 0 critical/serious ở cả 4 theme, gồm cả màn "kết quả AI" (mock `/api/claude`) của
    Chat/Speaking. Đã merge: **PR #158**.
- **fix(security): audit lại phát hiện 2 lỗ High cùng gốc rễ — RLS bypass giới hạn gói/lượt.**
  Audit sâu 4 vùng (bảo mật/RLS, Speaking/STT/TTS, hiệu năng, cloud-sync) cho thấy repo tổng
  thể tốt (cổng chất lượng xanh, không lộ secret/XSS, RLS bật đủ, crypto TTS vững), nhưng RLS
  chỉ chặn theo **DÒNG**, không theo **CỘT**: policy `own profile`/`own usage` cho phép người
  dùng đã đăng nhập tự ghi đè `profiles.plan` (tự nâng Pro) hoặc reset `daily_usage.*_count`
  (bypass giới hạn lượt) ngay từ console trình duyệt — vô hiệu hóa cơ chế đếm-lượt-server
  (`consume_usage` RPC) đang chạy production. Vá bằng quyền-THEO-CỘT Postgres: migration mới
  `supabase/migrations/0005_lockdown_cost_columns.sql` + cập nhật `supabase/schema.sql`
  (`revoke update(plan)`; `daily_usage` client chỉ còn ghi được `learn_count`, 4 cột đếm lượt
  chỉ `service_role`/RPC ghi được). Xóa `pushUsage` (`src/lib/cloud.ts`, code chết — không ai
  gọi, nếu nối dây lại sẽ ghi đè đếm server). Kèm 2 sửa Low: karaoke lệch 1 từ khi text có
  khoảng trắng thừa (`KaraokeText.tsx` + `Speaking.tsx` bỏ qua đoạn rỗng khi split) và đính
  chính comment rate-limit `tts-gen` (`api/tts.ts`). Gộp `AUDIT.md`/`AUDIT_REPORT.md`/
  `TRANSLATION_AUDIT.md` (3 file rời rạc, phình dần) thành 1 `AUDIT.md` duy nhất (3 phần theo
  thời gian, không mất nội dung/bằng chứng nào). Đã merge: **PR #159**.

## ⚠️ Cần làm tay (chưa xong)

- **Chạy migration `supabase/migrations/0005_lockdown_cost_columns.sql` trên Supabase production**
  (Dashboard → SQL Editor) — PR #159 đã merge nhưng migration này KHÔNG tự chạy được từ phiên
  làm việc (không có credentials Supabase trong môi trường), phải làm tay. An toàn chạy lại
  (idempotent); không phá luồng client/server hiện có. **Đây là bước thực sự đóng lỗ RLS** —
  code/schema mới chỉ đảm bảo DB mới an toàn, DB đang chạy vẫn mở cho tới khi chạy migration này.

## Tiếp theo

> Làm tăng dần, mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (theo CLAUDE.md mục 3).

- Thanh toán Pro (cổng nâng cấp gói) — cần quyết định sản phẩm (nhà cung cấp, giá, webhook) trước
  khi code; theo CLAUDE.md mục 12 phải dừng hỏi người dùng trước khi bắt đầu.
- Chạy thật `npm run tag:cefr` (cần key AI) rồi review mẫu kết quả + cân nhắc hiển thị badge CEFR
  trên trang Từ điển (chưa làm UI — hạ tầng dữ liệu trước, UI sau khi có dữ liệu thật để kiểm tra).
  Môi trường phiên làm việc hiện tại không có key AI nào (`GEMINI_API_KEY`/`GROQ_API_KEY`/
  `ANTHROPIC_API_KEY`) — đã hỏi lại người dùng, xác nhận giữ quyết định cũ: **tự chạy trên máy có
  `.env`**.
- Zod validate input (đợt 3, tùy chọn) — cân nhắc `api/ai.ts` (logic cắt/sanitize message phức
  tạp, cố tình lenient — giá trị thêm thấp hơn 2 đợt trước); query param của
  `api/dictionary.ts`/`api/pronunciation.ts` đã sanitize kỹ bằng tay, giá trị thêm Zod thấp hơn.
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
- Zod (validate input): trước đây đánh giá giá trị thấp (ưu tiên E2E/a11y trước) — nay bắt đầu
  làm THEO ĐỢT NHỎ (không "big bang" cả `api/`): đợt 1 xong `stt.ts`/`tts.ts` (PR #156), đợt 2 —
  `push.ts`, xem "Đang làm". Bản Zod dùng là v4 (`z.string({ error })`,
  `.refine(fn, { error, params })` — khác cú pháp `message`/`errorMap` của v3).

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
