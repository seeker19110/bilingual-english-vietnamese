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
- **fix(security/reliability): đợt rà soát toàn diện 2026-07-02 — 6 phát hiện, vá hết trong 1 PR.**
  Rà lại theo checklist đa lớp (AUDIT.md §1.5) trên repo hiện tại, mọi cổng chất lượng xanh
  từ trước. Phát hiện + vá: **(1)** `api/ai.ts` nhánh Groq trả 200 nhưng body hỏng (không phải
  JSON / thiếu `choices`) → trả 500 mà QUÊN hoàn lượt — gom parse vào `parseGroqText()` +
  try/catch hoàn lượt mọi nhánh lỗi, kèm 6 test mới (`api/ai.test.ts`, mock security/usage/fetch);
  **(2)** `googleTts.ts` gọi Google TTS bằng `fetch` trần không timeout → đổi sang
  `fetchWithTimeout` 30s (TTS/pronunciation hết treo vô hạn khi Google sự cố); **(3)** `api/tts.ts`
  `text` không có trần độ dài (body 64KB đẩy được chuỗi khổng lồ tới Google TTS, tính tiền theo
  ký tự) → chặn 4000 ký tự, trả 413; **(4)** `public/sw.js` icon notification mặc định
  `/favicon.ico` không tồn tại (chỉ có favicon.svg) → đổi `/icon-192.png`; **(5)** `server.ts`
  CSP lặp 3 lần + còn whitelist 3 domain không dùng (cdn.jsdelivr.net, fonts.googleapis.com,
  fonts.gstatic.com — font đã tự host PR #161) → gom 1 hằng `CSP_HEADER`, bỏ domain thừa;
  **(6)** bảng `pronunciations` KHÔNG có trong `supabase/schema.sql` và bản production (tạo tay
  theo setup doc cũ) **chưa bật RLS** → client ghi được vào cache dùng chung (đầu độc audio_url):
  thêm bảng + RLS vào schema.sql, migration mới `0006_pronunciations_rls.sql` (xem "Cần làm tay"),
  sửa luôn comment/message lỗi thời "chỉ female/male" (đã 4 giọng). `npm audit` production: 0 lỗ hổng.
  Đã merge: **PR #163**. Người dùng đã chạy migration trên Supabase production (xác nhận
  2026-07-02) → lỗ RLS `pronunciations` (0006) và khóa cột chi phí (0005) đã ĐÓNG THẬT trên DB đang chạy.
- **perf: tự host font Inter, bỏ Google Fonts.** Người dùng phản ánh lần đầu truy cập chậm —
  rà lại cho thấy bundle JS/CSS đầu trang đã trong ngân sách `size-limit` (110.87/116 kB JS,
  8.73/9 kB CSS brotli) và Nginx đã cache static tốt từ trước; điểm chưa tối ưu là font Inter
  tải qua Google Fonts (`fonts.googleapis.com` → `fonts.gstatic.com`), tốn thêm 2 vòng
  DNS/TLS/HTTP tới domain ngoài. Thay bằng `@fontsource-variable/inter` (file `.woff2` tự host
  cùng domain, hưởng cache immutable 1 năm như asset khác); `index.html` bỏ hết thẻ Google
  Fonts, font-family đổi tên `'Inter Variable'` (`src/index.css`, `tailwind.config.js`). Đã
  merge: **PR #161**.
- **feat(infra): chuẩn bị Cloudflare trước VPS** — người dùng đồng ý làm tiếp mục "Cloudflare"
  trong "Tiếp theo". Phần AI làm được (code/cấu hình, đã xong): `nginx/en-vi.conf` thêm
  `include /etc/nginx/cloudflare-realip.conf` (module `real_ip` — chỉ tin header
  `X-Forwarded-For`/`CF-Connecting-IP` khi request thực sự đến từ dải IP Cloudflare, chặn
  đường giả mạo IP để né rate-limit nếu ai gọi thẳng vào IP VPS bỏ qua Cloudflare); script mới
  `scripts/update-cloudflare-ips.sh` (tải dải IP Cloudflare MỚI NHẤT lúc chạy — không hard-code
  danh sách tĩnh vào repo vì dải IP có thể đổi theo thời gian); tài liệu đầy đủ
  `docs/cloudflare-setup.md` (5 bước DNS/SSL bạn tự làm trên Cloudflare + lệnh deploy VPS + cách
  kiểm tra + cách hoàn tác); ghi chú thêm ở `api/_lib/security.ts` giải thích điều kiện để IP
  đáng tin. **Phần BẠN cần tự làm** (AI không có quyền truy cập tài khoản Cloudflare/domain):
  làm theo `docs/cloudflare-setup.md` — thêm site vào Cloudflare, bật Proxy cho bản ghi `en-vi`,
  đổi nameserver ở nơi mua domain, đặt SSL/TLS mode "Full (strict)"; sau đó SSH vào VPS chạy
  `git pull` + `sudo bash scripts/update-cloudflare-ips.sh` + copy `nginx/en-vi.conf` mới +
  `nginx -t && systemctl reload nginx`.
- **Đặt Cloudflare trước VPS — ĐÃ HOÀN TẤT VÀ KIỂM CHỨNG (2026-07-02).** Người dùng tự làm phần
  Cloudflare Dashboard (thêm site, bật Proxy cho `en-vi`, đổi nameserver — xác nhận bằng
  `nslookup -type=NS` ra đúng `lennon.ns.cloudflare.com`/`kelly.ns.cloudflare.com`, đặt SSL/TLS
  "Full (strict)") + deploy trên VPS (`git pull` → `sudo bash scripts/update-cloudflare-ips.sh`
  → copy `nginx/en-vi.conf` → `nginx -t && systemctl reload nginx`). Xác minh 2 lớp: (1)
  `curl -I` thấy header `cf-ray` + `server: cloudflare`, `nginx -T` xác nhận
  `cloudflare-realip.conf` đã nạp vào cấu hình đang chạy; (2) **quan trọng nhất** — gửi 1 request
  thiếu auth thật tới `/api/claude` (từ máy người dùng, qua Cloudflare) để kích hoạt log
  `[Security][AUTH_FAILED]`, xác nhận IP hiện trong `pm2 logs` là **IP thật của người dùng** (dải
  di động nhà mạng VN), không phải IP nội bộ Cloudflare → module `real_ip` hoạt động đúng, rate
  limit theo IP (`api/_lib/security.ts`) không còn kẽ hở giả mạo IP khi có Cloudflare phía trước.
- **fix(security): CSP chặn script Cloudflare Insights (beacon.min.js).** Sau khi bật Proxy
  Cloudflare, trình duyệt tự báo lỗi console `Content-Security-Policy` chặn
  `static.cloudflareinsights.com/beacon.min.js` — script RUM Cloudflare tự chèn khi proxy bật,
  không phải do code app. Sửa `CSP_HEADER` (`server.ts`) thêm
  `https://static.cloudflareinsights.com` vào `script-src` (giữ nguyên `connect-src ... https:`
  — đã đủ cho báo cáo `cdn-cgi/rum`). Không đổi hành vi app. Lỗi 503 kèm theo trong console
  (`(index):1`) không tái hiện được từ môi trường AI (không có quyền truy cập domain production)
  — nếu còn xảy ra, cần người dùng cung cấp thêm chi tiết (thời điểm, tần suất) để tra log
  Nginx/PM2 trên VPS.

- **Audit UI/UX nút loa/micro — chuẩn hóa vị trí & đồng nhất với text** (nhánh
  `claude/ui-ux-audit-standards-i9gp19`):
  1. **KaraokeText** (chuẩn chung mọi nút loa đi kèm text): cột icon cao đúng bằng
     dòng chữ đầu (hết lệch xuống dưới); quy tắc cỡ icon theo cỡ chữ (text-xs → `xs`
     18px, text-sm trở lên → `sm` 21px) — áp lại ở Chat/Dictionary/Flashcard; thêm
     `title` cho nút; export **`KARAOKE_INDENT`** (`pl-9`) cho dòng phụ.
  2. **Bản dịch dưới câu có loa** thẳng hàng với văn bản: `pl-6` → `KARAOKE_INDENT`
     (Learn ×2, RoadmapTab ×3).
  3. **Trang Luyện nói**: loa "Nghe lại" chuyển từ bên phải → **bên trái** văn bản
     (đồng nhất chuẩn KaraokeText), icon 21px căn dòng đầu.
  4. **RoadmapTab hội thoại**: nút micro chấm phát âm chuyển từ đáy bong bóng lên
     **hàng tên người nói (bên phải)** — đồng nhất vị trí với Lessons.
  5. **Vùng chạm ≥ 44px**: utility mới **`.tap-44`** (`src/index.css`, mở rộng vùng
     bấm bằng pseudo-element `inset: min(0, calc((100%−44px)/2))`, không đổi layout;
     `:where()` để không ghi đè nút `absolute`). Áp cho: PronounceButton (đồng thời
     nâng 28→36px hiển thị, icon 18px), loa Nghe lại/mute/phòng mới/gửi (Speaking),
     loa & micro từng câu (Lessons), nút chấm phát âm + thử lại (PronunciationCheck),
     chevron (WordOfTheDay), sao từ khó (WordCard).
  6. Dọn code chết: xóa `SpeakButton.tsx` (đã bị KaraokeText thay từ lâu, không nơi
     nào import).
- **feat(chat,speaking): giọng điệu thân mật + nút "Kết thúc & chấm điểm".** Tinh chỉnh
  `chatSystemPrompt`/`speakingSystemPrompt` (`src/prompts/index.ts`, cả 2 chiều A/B): giọng
  điệu thân mật, nhẹ nhàng hơn; khi sửa lỗi LUÔN kèm 1 câu động viên (trước đây chỉ khen khi
  câu đúng). Nối tính năng chấm điểm cuối phiên — `speakingFullEvaluationPrompt` (chấm kiểu
  IELTS Speaking: fluency/từ vựng/ngữ pháp/phát âm) đã có sẵn từ trước nhưng CHƯA có UI nào gọi
  tới; thêm `chatFullEvaluationPrompt` tương tự cho Chat (không có tiêu chí phát âm vì hội thoại
  chữ). Nút "Kết thúc & chấm điểm" (Chat + Speaking) chỉ hiện sau ≥ 3 lượt trao đổi; bấm vào gọi
  AI 1 lần, hiển thị bảng điểm qua component dùng chung mới `src/components/EvaluationResultView.tsx`
  (điểm tổng, băng điểm từng tiêu chí, lỗi cần sửa, điểm mạnh, gợi ý, câu động viên — cùng phong
  cách với màn kết quả Writing). Kết quả CHỈ hiện tạm trong phiên, KHÔNG lưu Supabase → không cần
  đổi schema DB; tính 1 lượt dùng theo mode sẵn có (`chat`/`speaking`), không thêm cột giới hạn
  riêng. Đã merge: **PR #170**.
- **feat(profile): trang cá nhân, liên kết vào Tiến độ.** Trang mới `/profile`
  (`src/pages/Profile.tsx`, lazy-loaded + `RequireAuth`): avatar, tên, email, huy hiệu gói
  (Free/Pro), streak, số từ đã học, 2 nút điều hướng nhanh sang **Tiến độ** (`/progress`) +
  **Lịch sử** (`/history`), và nút đăng xuất. Avatar ở thanh header (`Layout.tsx`) trước đây chỉ
  hiển thị tĩnh — nay bấm vào mở trang này. Thêm route + key i18n `profile` (vi/en). Đã thêm
  `/profile` vào gate a11y (`AUTHED_ROUTES` trong `e2e/a11y.spec.ts`) — quét thấy 1 lỗi
  `color-contrast (serious)` ở 2 theme sáng (Blue sky/Pink) do nút Đăng xuất thiếu biến thể
  `theme-light:text-red-700` (quên áp quy ước màu đỏ sẵn có ở Writing/Chat/Speaking) → sửa ngay,
  gate a11y nay **63 test**, vẫn 0 critical/serious. Đã merge: **PR #176**.

## Đã xong (đợt cải tổ lộ trình CEFR — 2026-07-03)

- **Mỗi cấp CEFR 1 trang riêng** `/learning-path/a1…b2` (`src/pages/CefrLevelPage.tsx`):
  thẻ tổng quan (2 thanh tiến độ từ vựng + ngữ pháp, can-do thu gọn được), thẻ **"Học tiếp"**
  trỏ đúng mục kế tiếp chưa xong, unit đánh số "Phần 1..n" học theo trình tự
  **① Từ vựng → ② Ngữ pháp → ③ Hội thoại**. URL sai cấp → tự về `/learning-path`.
- **Ẩn mục đã hoàn thành 100% theo từng thành phần** (yêu cầu người dùng): vòng từ vựng
  thuộc hết / bài ngữ pháp đã đánh dấu xong / hội thoại đã xem → ẩn, gom vào nút
  "Đã hoàn thành n mục · Xem lại"; unit xong hết thu gọn còn 1 dòng (bấm mở lại được).
- **Theo dõi tiến độ ngữ pháp + hội thoại** (`src/lib/cefrProgress.ts` + 13 unit test):
  nút "Đã học xong bài này" trong bài ngữ pháp; hội thoại tự ghi "đã xem" khi mở;
  luật khóa cấp (≥70% từ vựng cấp trước) gom về 1 chỗ (`computeLockedMap`).
- **Tab "Lộ trình" thành tổng quan 4 cấp** (RoadmapTab viết lại): mỗi cấp 1 thẻ có 2 thanh
  tiến độ + nhãn "Bạn đang ở đây"/khóa + nút vào trang cấp. Màn chi tiết (bài ngữ pháp,
  flashcard, hội thoại) tách sang `src/components/CefrLessonViews.tsx` dùng chung.
- **Từ vựng "Hôm nay" học THEO CẤP** (chốt với người dùng): `getCircles()` xếp vòng nền tảng
  theo đúng thứ tự vòng trong lộ trình A1→B2 (hết A1 mới sang A2…), phần mở rộng từ điển vẫn
  nằm sau cùng; thẻ từ hiện chip cấp (A1…) — `src/lib/curriculum.ts` + test thứ tự.
- **Hạ tiêu đề "Học theo lộ trình" xuống dưới thanh tab** (gọn đầu trang — yêu cầu người dùng).
- Gate a11y thêm `/learning-path/a1` (4 theme). Đã verify bằng cách lái app thật (Playwright):
  ẩn/hiện mục hoàn thành, khóa B2, redirect URL sai, tiến độ giữ nguyên sau reload.
  Đã merge: **PR #180**.
- **Đồng bộ tiến độ ngữ pháp/hội thoại lên Supabase** (yêu cầu người dùng 2026-07-03):
  migration `0007` thêm cột `cefr_grammar`/`cefr_dialogues` vào `learning_progress`
  (kèm cập nhật `schema.sql`); `progressSync.ts` đẩy/kéo + hợp nhất union 2 tập mới
  (`pullProgress` đổi sang `select('*')` để DB chưa chạy 0007 không gãy phần kéo cũ);
  `cefrProgress.ts` gọi `pushProgress` khi mark/unmark bài ngữ pháp + khi xem hội thoại
  lần đầu (xem lại không đẩy thừa). ⚠️ Chạy migration TRƯỚC khi deploy — xem "Cần làm tay".

## Đã xong (đưa 4 tab học vào trang từng cấp — 2026-07-03)

- **Chuyển 4 tab Hôm nay · Ôn SRS · Từ khó · Kiểm tra** từ trang `/learning-path` vào
  **trang riêng của từng cấp** `/learning-path/a1…b2` (yêu cầu người dùng): thanh tab đầu
  trang cấp thêm tab "Bài học" (danh sách unit như cũ) + 4 tab học; cấp còn khóa thì ẩn
  thanh tab. Nội dung 4 tab tách ra `src/components/StudyTabs.tsx` (từ `Learn.tsx` cũ).
- **Dữ liệu 4 tab LỌC THEO TỪ VỰNG CỦA CẤP**: helper mới `getLevelWords()` +
  `getBeyondCefrWords()` + `getTodayBatchFrom()` trong `src/lib/curriculum.ts` (khử trùng
  cùng luật với `getLearningPath` → mỗi từ thuộc đúng 1 cấp; có unit test). Cấp cuối (B2)
  học tiếp phần NGOÀI lộ trình CEFR (vòng nền tảng lẻ + cụm "Mở rộng" từ điển) để không
  mồ côi phần mở rộng. Giới hạn ngày (20 từ/lượt, tối đa 100, quiz mở batch) vẫn CHUNG toàn app.
- **Trang `/learning-path` chỉ còn tổng quan**: mốc từ vựng + bản đồ 4 cấp (`RoadmapTab`).
  Nút "Kiểm tra" trong `QuickActions` đổi thành "Lộ trình" (tab Kiểm tra giờ nằm trong cấp).
  Preload audio 20 từ "hôm nay" chuyển theo sang trang cấp.
- Lưu ý hành vi: badge Ôn SRS/Từ khó giờ đếm THEO CẤP → từ đến hạn ôn của cấp nào thì vào
  trang cấp đó để ôn (tổng toàn app vẫn xem ở `/progress`).
- **Fix a11y `color-contrast` (RoadmapTab, bắt bởi CI PR #182)**: thẻ cấp bị khóa dùng
  `opacity-80` để làm mờ cả khối — làm chữ bên trong (vốn đã sát ngưỡng AA) tụt dưới 4.5:1
  ở theme nền sáng (Blue sky/Pink). Lỗi này CÓ SẴN từ trước nhưng chưa bị gate bắt vì tab
  "Lộ trình" không phải tab mặc định của `/learning-path` cũ; nay trang chỉ còn đúng bản đồ
  lộ trình nên lộ ra. Bỏ hẳn `opacity-80`, giữ nguyên trạng thái khóa bằng Lock icon + dòng
  "Thuộc ≥70%..." sẵn có (không cần làm mờ cả thẻ). Verify: chạy lại toàn bộ `/learning-path`
  4 theme + full E2E suite (68/68) xanh.

## Đã xong (mở rộng từ vựng + đào sâu B1/B2 — 2026-07-03)

- **8 vòng từ vựng chủ đề mới** (`src/data/curriculum.ts`, FOUNDATION), ~16 từ/vòng có
  câu ví dụ song ngữ, đã rà KHÔNG trùng với 618 từ nền tảng sẵn có: A1 `countries` (Quốc
  tịch & đất nước), A1 `communication` (Điện thoại & liên lạc), A2 `restaurant` (Nhà hàng
  & gọi món), A2 `festivals` (Lễ hội & tiệc tùng), B1 `opinions` (Ý kiến & tranh luận), B1
  `news` (Tin tức & sự kiện), B2 `arts-culture` (Nghệ thuật & văn hóa), B2 `science-tech`
  (Khoa học & công nghệ).
- **Làm giàu 6 unit CEFR có sẵn**: gắn `countries`→`a1-greetings`, `communication`→`a1-actions`,
  `restaurant`→`a2-shopping`, `festivals`→`a2-past`, `opinions`→`b1-modals`,
  `arts-culture`→`b2-natural` (thêm vào `vocabCircleIds`, không đổi ngữ pháp unit cũ).
- **Đào sâu B1 & B2** (theo yêu cầu người dùng — 2 cấp trước đó ít unit/vòng từ vựng hơn
  A1/A2): thêm hẳn 1 unit MỚI mỗi cấp, cả ngữ pháp lẫn từ vựng —
  - B1 `b1-narrative` "Thuật lại sự việc": 2 bài ngữ pháp mới (quá khứ tiếp diễn
    was/were+V-ing, quá khứ hoàn thành had+V3) + vòng từ vựng `news` + 2 hội thoại mẫu.
  - B2 `b2-advanced-structures` "Cấu trúc nâng cao": 2 bài ngữ pháp mới (câu điều kiện
    hỗn hợp mixed conditionals, đảo ngữ inversion) + vòng từ vựng `science-tech` + 2 hội
    thoại mẫu.
  - Mỗi bài ngữ pháp đủ 3 phần làm giàu (tipVi, 5 lỗi thường gặp, 10 câu quiz) đúng chuẩn
    các bài cũ. Thêm 1 dòng canDo cho B1 (thuật lại chuyện) và B2 (câu điều kiện hỗn hợp +
    đảo ngữ).
  - B1: 5→6 unit, 13→15 bài ngữ pháp. B2: 5→6 unit, 12→14 bài ngữ pháp.
- Tổng: FOUNDATION 34→42 vòng, ~618→772 từ. Đã chạy lại `scripts/gen-curriculum-json.ts` +
  `scripts/gen-learn-json.ts` để đồng bộ `public/data/{curriculum,cefr,dialogues}.json`
  (client đọc qua fetch, không bundle thẳng — xem comment đầu 2 script).
- Verify: build/typecheck/lint/format/test/size-limit xanh; lái app thật bằng Playwright
  (đánh dấu toàn bộ từ đã thuộc để mở khóa B1/B2) — xác nhận 2 unit mới hiện đúng trong
  trang cấp, bài ngữ pháp mới render đủ ví dụ có nghe/lỗi thường gặp/quiz, hội thoại mới
  phát đúng 2 giọng theo tên nhân vật; full E2E suite (68/68, gồm a11y 4 theme) xanh.

## Đã xong (tăng từ vựng lộ trình CEFR lên ~1500 từ — 2026-07-03)

- **Mục tiêu người dùng**: tăng tổng từ vựng lộ trình CEFR (A1→B2) từ 771 lên ~1500 từ,
  cân bằng lại ưu tiên B1/B2 (2 cấp ít từ hơn A1/A2). Làm theo từng cấp, 1 PR/cấp.
- **A1: 251→378 từ** (+8 vòng: daily-actions, house-rooms, basic-verbs-2, people-basic,
  basic-descriptions, basic-places, basic-food-drink, family-extended). **A2: 222→382 từ**
  (+10 vòng: hobbies-leisure, daily-chores, body-health-2, shopping-extended,
  restaurant-extended, weather-extended, travel-extended, personality-extended,
  clothing-extended, animals-extended). Gộp 1 PR, đã merge: **PR #186**.
- **B1: 169→377 từ** (+13 vòng: workplace, money-finance, education-further,
  technology-use, entertainment-media, sports-extended, emotions-extended,
  environment-issues, city-life, opinions-extended, narrative-extra, relationships-b1,
  problems-solutions). **PR #187** (gộp chung với 2 fix logic ở mục dưới).
- **B2: 130→386 từ** (+16 vòng: business-extended, technology-advanced, medical-advanced,
  social-issues, arts-culture-advanced, science-advanced, environment-advanced,
  abstract-concepts, communication-advanced, law-justice, politics-government,
  travel-advanced, food-culture-advanced, mental-health, education-advanced,
  economy-global). Gộp vào **PR #187** (đẩy thêm commit sau khi vá 2 lỗi logic).
- Mỗi vòng ~16 từ có câu ví dụ song ngữ, gắn vào `vocabCircleIds` của unit CEFR có sẵn theo
  đúng chủ đề (không tạo unit/ngữ pháp mới). Rà không trùng khóa từ (`word`, không phân biệt
  hoa/thường) bằng script kiểm tra riêng sau mỗi đợt.
- **Hoàn tất mục tiêu**: tổng lộ trình CEFR 771→**1523 từ** (A1 378, A2 382, B1 377, B2 386).
  Verify: build/typecheck/lint/format/test (105/105)/size-limit xanh; full E2E suite
  (68/68, a11y 4 theme) xanh.

## Đã xong (audit logic/đồng nhất + vá 2 lỗi — 2026-07-03)

> Theo yêu cầu người dùng "audit lại tính đồng nhất, logic, lỗi của dự án" giữa lúc đang tăng
> từ vựng CEFR. Chi tiết đầy đủ: `AUDIT.md` PHẦN A00.

- **Lỗi khóa lại cấp CEFR khi tăng từ vựng** — `computeLockedMap` tính % mở khóa SỐNG trên
  tổng từ vựng hiện tại; tăng từ vựng (PR #185-187) làm % người dùng đã đạt ngưỡng trước đó
  tụt xuống → cấp sau bị khóa lại dù đang học dở. Vá bằng cơ chế **grandfather**: cột mới
  `cefr_unlocked` (localStorage + Supabase, migration `0008`) ghi nhớ cấp đã từng đủ điều kiện
  mở khóa — 1 khi đã mở thì không khóa lại nữa. Hàm mới `computeLockedMapPersisted`
  (`src/lib/cefrProgress.ts`), gọi thay `computeLockedMap` ở `CefrLevelPage.tsx`/`RoadmapTab.tsx`
  (hàm cũ giữ nguyên, vẫn dùng nội bộ + còn đủ test cũ). 3 test mới.
- **Ranh giới "ngày" tính theo UTC thay vì giờ Việt Nam** — 9 chỗ dùng
  `new Date().toISOString().slice(0, 10)` (`src/lib/{stats,storage,cloud,curriculum,
dictionaryApi}.ts`, `api/{_lib/usage,push,dictionary}.ts`) khiến ranh giới "ngày mới" thực chất
  là 7h sáng giờ VN thay vì nửa đêm — hoạt động 0h-7h sáng bị tính nhầm sang ngày hôm trước
  (lượt dùng reset trễ, streak/Dashboard có thể hiện "đứt" sai). Thêm helper dùng chung
  `vnDateStr()` (offset cố định +7h, Việt Nam không có DST) ở `src/lib/date.ts` (client) +
  `api/_lib/date.ts` (server, không import chéo được do tsconfig tách `src`/`api`) — thay thế
  cả 9 chỗ. 6 test mới (3 mỗi bản) + sửa 1 test cũ (`stats.test.ts`) dùng chung logic ngày mới.
- **Đợt audit thứ 2 (theo yêu cầu người dùng rà sâu hơn)** — phát hiện thêm 1 lỗi cùng lớp
  với F1 (PHẦN A0) nhưng ở nhánh STT: `api/_lib/openaiStt.ts` `transcribeAudio` coi HTTP 200
  thiếu/sai kiểu trường `text` giống hệt im lặng thật (chuỗi rỗng hợp lệ) → không throw nên
  `api/stt.ts` không hoàn lượt dù đây là body hỏng từ provider. Đã đối chiếu `callGemini`/
  `googleTts.ts` (đã validate đúng, không lỗi) — chỉ STT còn thiếu. Sửa: throw khi
  `typeof data.text !== 'string'`, giữ nguyên trả `''` khi im lặng thật. 5 test mới
  (`openaiStt.test.ts`). Ghi nhận thêm 1 mục mức thấp CHƯA sửa (tùy chọn): nhánh Anthropic của
  `api/ai.ts` không parse JSON để kiểm tra cấu trúc trước khi trả cho client (chỉ hoàn lượt khi
  `!resp.ok`) — rủi ro thấp vì là API trả phí/ổn định, xem AUDIT.md PHẦN A00.
- Verify: build/typecheck/lint/format/test (110/110, +14 tổng cả 2 đợt)/size-limit xanh; full
  E2E suite (68/68, a11y 4 theme) xanh sau khi sửa.
- ⚠️ Cần chạy migration `0008` trên production TRƯỚC khi deploy (xem "Cần làm tay").

## Đã xong (audit sâu lần 2 + Sentry — 2026-07-04)

> Theo yêu cầu người dùng "audit sâu và fix". Container phiên này clone mới nên
> `node_modules` trống lúc đầu (mọi lệnh gate tưởng hỏng) — cài lại bằng `npm ci` là hết,
> không phải lỗi code. Sau khi cài: build/typecheck/lint/test (110/110) đều xanh, không phát
> hiện lỗi nghiêm trọng nào. Viết script kiểm tra cấu trúc dữ liệu CEFR/từ vựng (89 vòng,
> 61 bài, 23 unit): 0 tham chiếu gãy, 0 quiz sai index/trùng đáp án, 0 vòng mồ côi.

- **Nhãn "thứ" trên biểu đồ streak lệch múi giờ** — `getActivity7Days`/`getActivityCalendar`
  (`src/lib/stats.ts`) dùng `d.getDay()` (thứ theo giờ LOCAL của trình duyệt) trong khi ngày
  hiển thị (`dow`) đã tính theo giờ Việt Nam (`vnDateStr`) → người xem ở múi giờ khác VN có
  thể thấy nhãn thứ lệch 1 ngày so với ô thực tế. Thêm `vnDayOfWeek()` (`src/lib/date.ts`,
  cùng cách tính offset +7h với `vnDateStr`) thay `d.getDay()` ở cả 2 hàm. 2 test mới.
- **1 từ trùng giữa 2 vòng ở A1** (`"I"` — chữ cái trong vòng `letters` trùng đại từ "tôi"
  trong vòng `greetings`) — đã cân nhắc nhưng KHÔNG sửa: muốn hết trùng phải đổi cách định danh
  từ toàn cục (`word.toLowerCase()`, dùng chung cho learned/SRS/hard-words toàn app) sang định
  danh theo từng vòng — rủi ro cao (có thể làm mất tiến độ đã lưu của người dùng thật) so với
  lợi ích cực nhỏ (lệch 1/379 từ A1, và cả 2 đều nằm ở unit đầu tiên nên thực tế học gần như
  cùng lúc). Giữ nguyên, ghi lại ở đây để không audit lại nhầm là bug chưa biết.
- **Thêm Sentry (observability)** — bắt lỗi thật khi chạy production, cả client lẫn server:
  - Client: `src/lib/errorTracking.ts` (`initErrorTracking()` gọi ở `main.tsx`,
    `captureException()` gọi trong `ErrorBoundary.componentDidCatch`). Tải `@sentry/react` bằng
    `import()` ĐỘNG, tách riêng chunk `vendor-sentry` (`vite.config.ts` `manualChunks`) — không
    nằm trong bundle khởi động nên KHÔNG tính vào ngân sách `size-limit` (đã verify: 112.51kB →
    112.58kB, gần như không đổi vì chunk chỉ tải khi thật sự dùng).
  - Server: `api/_lib/sentry.ts` (`initSentryServer()` gọi trong `server.ts` sau
    `dotenv.config()`, `captureServerException()` gọi ở catch của `wrapEdge` + bộ hẹn giờ nhắc
    học).
  - CẢ 2 đều **no-op hoàn toàn nếu chưa đặt `SENTRY_DSN`/`VITE_SENTRY_DSN`** (`.env.example`) —
    an toàn merge ngay, không ảnh hưởng gì tới hành vi hiện tại cho tới khi người dùng tự thêm
    DSN thật. Không bật performance tracing/session replay (chỉ bắt exception, tránh vượt quota
    free). CSP hiện có (`connect-src ... https:`) đã đủ rộng cho domain ingest của Sentry,
    không cần sửa `server.ts` CSP_HEADER.
- Verify: build/typecheck/lint/test (112/112, +2 so với đợt trước)/size-limit xanh.
- ⚠️ Cần làm tay: tạo project Sentry (miễn phí, sentry.io) rồi điền `SENTRY_DSN` +
  `VITE_SENTRY_DSN` vào `.env` trên VPS (xem "Cần làm tay" bên dưới).

## ⚠️ Cần làm tay (chưa xong)

- **Chạy migration `0007_learning_progress_cefr.sql` VÀ `0008_learning_progress_cefr_unlocked.sql`
  trên Supabase production** (Dashboard → SQL Editor) — **TRƯỚC khi deploy code mới lên VPS**.
  Nếu deploy code trước, upsert của `progressSync.ts` lỗi "column does not exist" → đồng bộ
  tiến độ (kể cả từ vựng/SRS) tạm ngưng tới khi chạy migration (kéo về vẫn chạy nhờ `select('*')`).
  0008 thêm cột `cefr_unlocked` (grandfather chống khóa lại cấp CEFR — xem AUDIT.md PHẦN A00).
- ~~Đặt Cloudflare trước VPS~~ — ĐÃ XONG (xem "Đã xong" ở trên,
  kiểm chứng bằng log IP thật 2026-07-02).
- _(Hiện không còn mục nào.)_ ~~Chạy migration `0005_lockdown_cost_columns.sql` +
  `0006_pronunciations_rls.sql` trên Supabase production~~ — ĐÃ XONG: người dùng xác nhận
  đã chạy trên Dashboard → SQL Editor (2026-07-02). Lỗ RLS (cột chi phí + cache phát âm
  dùng chung) đã đóng thật trên DB đang chạy, không chỉ trong schema.

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

- ~~Tiến độ ngữ pháp/hội thoại CEFR chỉ nằm localStorage~~ ĐÃ XONG (người dùng yêu cầu
  2026-07-03): đồng bộ qua 2 cột mới `cefr_grammar`/`cefr_dialogues` của bảng
  `learning_progress` (migration `0007`, hợp nhất kiểu union giống learned/hard).
  ⚠️ Còn bước LÀM TAY: chạy migration 0007 trên Supabase production TRƯỚC khi deploy
  (xem "Cần làm tay").

- **a11y**: gate nay **63 test** — login + Trang chủ (chiều A) ×4 theme + Trang chủ chiều B ×2
  theme sáng + menu giao diện đã mở ×4 theme + 10 trang × 4 theme (/progress, /dictionary,
  /lessons, /history, /phrases, /learning-path, /chat, /writing, /speaking, /profile) + **màn
  KẾT QUẢ AI (Chat/Writing/Speaking) × 4 theme** (mock `/api/claude`) — 0 critical, 0 serious ở
  MỌI theme, gồm cả trạng thái sau tương tác có/không cần backend. Nợ a11y đã đóng.
- ~~E2E (`e2e/`) chưa nằm trong `npm run typecheck`~~ ĐÃ XONG: thêm `tsconfig.e2e.json` +
  script `typecheck:e2e`, gộp vào `npm run typecheck` (CI tự phủ, không cần đổi workflow).
- ~~Trang Login dùng text tiếng Việt hard-code (chưa qua i18n) — chưa song ngữ.~~ ĐÃ XONG:
  Login nay dùng i18n `T` + có nút gạt VI/EN (xem "Đã xong" đợt áp khung, PR #147).
