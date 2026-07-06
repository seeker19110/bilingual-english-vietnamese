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
- **Đổi nguồn gắn nhãn CEFR: wordlist THẬT trước, AI chỉ fallback (2026-07-05)** — người dùng hỏi
  có wordlist CEFR miễn phí nào không; đã nghiên cứu và xác nhận **CEFR-J Vocabulary Profile v1.5**
  (A1-B2, Yukio Tono/Tokyo University of Foreign Studies — dùng thương mại được, miễn phí, chỉ cần
  ghi nguồn) + **Octanove Vocabulary Profile C1/C2 v1.0** (CC BY-SA 4.0), tải từ
  `openlanguageprofiles/olp-en-cefrj`, lưu ở `data/cefrj/*.csv` + `data/cefrj/SOURCE.md` (nguồn +
  giấy phép + trích dẫn bắt buộc). Thêm `api/_lib/cefrjLookup.ts` (logic thuần, có test — 11 test:
  parse CSV bỏ header/dòng hỏng, tách biến thể viết cách nhau bằng "/", tra theo pos rồi fallback
  cấp DUY NHẤT của từ khi không mâu thuẫn). `scripts/tag-cefr-levels.ts` nay tra wordlist này
  TRƯỚC (miễn phí, không giới hạn `LIMIT`, không cần API key) — AI (Gemini/Groq/Anthropic) CHỈ
  gọi cho từ không có trong wordlist (thêm biến `NO_AI_FALLBACK=1` để chạy thử chỉ bằng wordlist).
  Đã chạy thử thật trên bản sao `public/data/dictionary/chunk-*.json` (không đụng file gốc, xoá
  sau khi kiểm): **5.799/10.006 từ (~58%) gắn được nhãn chỉ bằng wordlist, không tốn AI** — phần
  còn lại (~4.200 từ, đa số từ ít phổ biến/idiom) mới cần AI ước lượng. Build/typecheck/lint/test
  (183/183) đều xanh. **CHƯA chạy thật trên file gốc** (vẫn cần quyết định có chạy AI cho phần
  còn thiếu không — xem "Tiếp theo"). Đã merge: **PR #202**.
- **Chạy thật `tag:cefr` (chỉ wordlist) trên file gốc (2026-07-05)** — chạy
  `NO_AI_FALLBACK=1 npm run tag:cefr` trên `public/data/dictionary/chunk-*.json` thật:
  **5.799/10.006 từ (~58%) đã có nhãn CEFR**, phân bố A1=969/A2=1073/B1=1732/B2=1545/C1=345/C2=135,
  không tốn AI. Đã merge: **PR #203**.
- **Thêm 2 tầng tra cứu miễn phí nữa (lemma + Words-CEFR-Dataset), phủ ~96% phần còn lại
  (2026-07-05)** — người dùng hỏi tiếp có nguồn miễn phí nào bổ sung không cho ~4.207 từ chưa
  gắn được nhãn; phân tích cho thấy phần lớn là BIẾN THỂ (số nhiều/quá khứ/gerund...) của từ đã
  có trong CEFR-J, không phải từ hoàn toàn mới. Thêm 2 tầng:
  (a) **`deriveLemmaCandidates` + `lookupCefrLevelWithLemma`** (`api/_lib/cefrjLookup.ts`) — suy
  dạng gốc theo quy tắc tiếng Anh chuẩn (pos-aware: số nhiều/động từ/so sánh), tra lại chính
  CEFR-J/Octanove (không hạ độ tin cậy vì vẫn cùng nguồn xác định).
  (b) **Words-CEFR-Dataset** (MIT, Maximax67 — `github.com/Maximax67/Words-CEFR-Dataset`) —
  `api/_lib/wordsCefrDataset.ts` tra cấp CEFR đã tính sẵn cho ~172.000 từ tiếng Anh (suy luận từ
  CEFR-J + tần suất Google Ngrams + lemma/stem). Chỉ commit **bản trích lọc**
  `data/words-cefr-dataset/subset.csv` (19.811/248.185 dòng gốc, ~280KB — chỉ giữ từ khớp từ
  điển dự án, script tái tạo: `scripts/extract-words-cefr-subset.ts` /
  `npm run extract:words-cefr`), không commit nguyên ~13MB gốc. Đã spot-check 6 từ đối chiếu
  CEFR-J thật (abandon/accept/action/happy/record×2) → **khớp 100%** khi giá trị dataset là số
  NGUYÊN → dùng làm tín hiệu "tin cậy cao" (`confidence: 'confirmed'`); số THẬP PHÂN = nội suy
  theo tần suất (không có trong CEFR-J gốc) → `confidence: 'estimated'`, tin cậy thấp hơn (dữ
  liệu vẫn ghi nhãn CEFR bình thường, chỉ khác ở mức tin cậy hiển thị trong log script).
  `scripts/tag-cefr-levels.ts` nay chạy đủ 3 tầng: CEFR-J(+lemma) → Words-CEFR-Dataset → AI
  (fallback cuối). +20 test `cefrjLookup.test.ts`, +9 test `wordsCefrDataset.test.ts` (tổng
  201/201). Chạy thử trên bản sao dữ liệu thật (đã có sẵn 5.799 từ từ PR #203): thêm được
  **3.798 từ nữa miễn phí** (662 qua lemma-CEFR-J + 1.757 Words-CEFR-Dataset tin cậy cao + 1.379
  tin cậy thấp hơn) → chỉ còn **409/10.006 từ (~4%)** thật sự cần AI (chủ yếu cụm từ/idiom +
  thuật ngữ công nghệ/tên thương hiệu như "bitcoin", "javascript", "ipad" — không có trong bất
  kỳ wordlist CEFR miễn phí nào). Build/typecheck/lint/test đều xanh. **CHƯA chạy thật để GHI
  vào file gốc** (mới dry-run bản sao) — xem "Tiếp theo".
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

## Đã xong (mở cấp C1–C2, lộ trình đủ 6 cấp — 2026-07-06)

> Yêu cầu người dùng: "thêm đầy đủ cấp học C1-C2 của CEFR vào lộ trình, gộp Đợt 2
> CEFR C1-C2 (1.407 từ)". Kế hoạch + quyết định chi tiết: `docs/research/lo-trinh-cefr-c1-c2.md`.

- **Mở rộng lộ trình A1→B2 thành A1→C2 (6 cấp).** Kiến trúc vốn data-driven từ
  `CEFR_LEVELS` nên chủ yếu là THÊM DỮ LIỆU: `RoadmapTab`/`Home`/`CefrLevelPage`
  tự render 6 cấp; chuỗi mở khóa B2→C1→C2 tự nối; phần "học tiếp ngoài CEFR"
  (`getBeyondCefrWords`) tự dời từ B2 sang C2 (bám `levels[last]`).
- **Từ vựng C1/C2 lấy TỰ ĐỘNG từ từ điển đã gắn nhãn** (không gõ tay): 2.357 từ
  C1/C2 trong từ điển đều có sẵn nghĩa TV + câu ví dụ song ngữ + freq. Script mới
  `scripts/gen-cefr-c1c2-vocab.ts` lọc (bỏ ~9 từ gắn nhầm có `freq<2000` như
  "trying/cannot/standing"; khử ~100 từ trùng nền tảng), sắp theo tần suất, cắt
  thành vòng 16 từ → `src/data/cefrC1C2Vocab.json` (**C1 687 từ/43 vòng · C2 1.561
  từ/98 vòng**). Wrapper `src/data/cefrC1C2Vocab.ts` gắn kiểu; `curriculum.ts` nối
  vào `FOUNDATION` (`FOUNDATION_BASE` A1–B2 + vòng C1/C2). Script idempotent (bỏ
  qua vòng "cefr-c1-_"/"cefr-c2-_" khi đọc key nền tảng → chạy lại an toàn).
- **Ngữ pháp C1/C2 soạn tay** (`src/data/cefrAdvanced.ts`, cùng chuẩn làm giàu như
  A1–B2): **C1 10 bài** (rút gọn mệnh đề quan hệ, câu chẻ It/Wh-cleft, đảo ngữ phủ
  định & điều kiện, V-ing/to-V đổi nghĩa, thức giả định + wish, nhượng bộ) ·
  **C2 7 bài** (đảo ngữ nâng cao & fronting, lược bỏ/thay thế, danh từ hóa, mệnh đề
  phân từ/tuyệt đối, giả định trang trọng, tình thái/hedging). `buildUnits()` ghép
  nhóm vòng từ vựng vào từng Phần; các Phần dư (nhiều vòng hơn bài ngữ pháp) thành
  "Từ vựng nâng cao N". 4 hội thoại mẫu C1/C2 (`dialogues.ts`).
- **Màu:** accent **rose (C1)** / **cyan (C2)** thêm vào `cefrAccent.ts` +
  `Dashboard.tsx` (khớp `LEVEL_COLOR` badge từ đã có — AA đã kiểm qua `/dictionary`).
  Nhãn "A1 → B2" → "A1 → C2" (`Learn.tsx`, `CefrLevelPage.tsx`, `RoadmapTab.tsx`).
- **Không đổi schema DB:** cột `cefr_grammar`/`cefr_dialogues`/`cefr_unlocked` là
  mảng id chuỗi tự do → C1/C2 dùng chung, không cần migration.
- Regen JSON: `gen-curriculum-json.ts` (230 vòng, 3.772 từ) + `gen-learn-json.ts`
  (6 cấp, 78 bài ngữ pháp, 131 hội thoại).
- Verify: build/typecheck/lint (0 cảnh báo)/test (201/201)/size-limit (114.31/116 kB)
  xanh; E2E a11y thêm `/learning-path/c1` — 0 critical/serious ở 4 theme; lái app
  thật (Playwright) xác nhận bản đồ 6 cấp + trang C1/C2 mở khóa render đủ vòng từ
  vựng/ngữ pháp/hội thoại.

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

## Đã xong (cải tiến lộ trình học — 5 đợt theo docs/research/cai-tien-lo-trinh-hoc.md — 2026-07-04)

> Theo kế hoạch trong `docs/research/cai-tien-lo-trinh-hoc.md` (PR #189, đã duyệt thứ tự làm
> "làm hết" + đồng ý đổi mặc định tốc độ 10 + đồng ý xen kẽ từ vựng↔ngữ pháp). Mỗi đợt 1 commit
> riêng trên cùng nhánh, verify đầy đủ (build/typecheck/lint/test/size + lái app thật bằng
> Playwright) trước khi sang đợt tiếp theo.

- **Đợt 1 — SRS toàn cục + cap phiên + leech**: tab Ôn SRS trước đây lọc theo từ vựng CẤP đang
  mở (`studyPool`) → từ cấp khác đến hạn không hiện, quên dần. Giờ mặc định ôn TOÀN BỘ lộ trình
  (`getLearningPath()`), có toggle lọc "chỉ cấp này" (`SRSReview`, `CefrLevelPage.tsx`). Cap
  `SRS_SESSION_CAP = 30` thẻ/phiên, ưu tiên thẻ quá hạn lâu nhất (`getDueWords(uid, pool, limit)`
  — `lib/srs.ts`), tránh ngợp khi quay lại sau vài ngày nghỉ. Thẻ bị "Quên" ≥3 lần tự vào diện
  leech (`lapses`, `getLeechWords`) — gộp vào tab Từ khó cùng đánh dấu tay.
- **Đợt 2 — Mini-quiz đủ 20 từ, 2 chiều**: mini-quiz mở batch trước chỉ hỏi 5/20 từ, 1 chiều
  (EN→VI). Giờ hỏi ĐỦ cả batch, xen kẽ đều EN→VI/VI→EN (`buildMiniQuiz`, `StudyTabs.tsx`). Trả
  lời sai → ôn lại flashcard ĐÚNG những từ sai (phase `mini-quiz-review`) trước khi cho làm lại.
- **Đợt 3 — Chọn tốc độ học 5/10/20 từ/ngày**: `getDailySpeed`/`setDailySpeed` (`lib/curriculum.ts`,
  localStorage `et_speed_<uid>`). Người dùng MỚI (chưa thuộc từ nào) mặc định **10** (trong
  khuyến nghị 10-20 từ/ngày); người dùng ĐÃ CÓ tiến độ trước đó giữ nguyên **20** để không đổi
  trải nghiệm đột ngột. Chọn ở trang Hồ sơ (`Profile.tsx`). Trần ngày = 5× tốc độ (công thức cũ,
  chỉ đổi từ `DAILY_GOAL` cố định sang theo từng người — `getDailyMax`). Cập nhật copy liên quan
  (FAQ `index.html`, `Home.tsx`, `README.md`, `CLAUDE.md`).
- **Đợt 4 — Hạ tầng sắp "Mở rộng" theo tần suất (CHƯA chạy dữ liệu thật)**: thêm
  `DictEntry.freq` + `compareByFreq()` để `getCircles()` sắp ~8.500 từ "Mở rộng" theo tần suất
  (luật Zipf) thay vì alphabet, từ thiếu `freq` xếp cuối/giữ nguyên thứ tự cũ. **Chưa điền freq
  thật** — môi trường phiên làm việc không có wordlist tần suất thật (NGSL/SUBTLEX) nên KHÔNG tự
  bịa dữ liệu (theo CLAUDE.md mục 5). Đã dựng sẵn `scripts/assign-word-freq.ts` (đọc wordlist
  `.txt`/`.csv` thật, idempotent, an toàn Ctrl+C, cùng mô hình `scripts/tag-cefr-levels.ts`) +
  `api/_lib/wordFreq.ts` (logic thuần, có test) — chạy khi có file wordlist thật (xem "Tiếp theo").
- **Đợt 5 — Xen kẽ từ vựng↔ngữ pháp + nút "Tôi đã biết vòng này"**: `findNextStep`
  (`lib/cefrProgress.ts`) giờ xen kẽ vòng từ vựng ↔ bài ngữ pháp TRONG 1 unit (vòng 1 → bài 1 →
  vòng 2 → bài 2 …) thay vì bắt xong 100% từ vựng mới gợi ý ngữ pháp — tránh unit lớn (~120 từ)
  khiến nhiều ngày liền chỉ lật thẻ. Chỉ đổi thứ tự gợi ý, không đổi ngưỡng "xong vòng" (vẫn
  100%). Thêm nút "Tôi đã biết vòng này" trên màn flashcard (`VocabFlash`, `CefrLessonViews.tsx`)
  — quiz nhanh tối đa 10 câu, đúng ≥90% → đánh dấu CẢ VÒNG đã thuộc, vào SRS với interval dài 7
  ngày (`addToSRSKnown`, `lib/srs.ts`) thay vì due ngay hôm nay, KHÔNG tính vào bộ đếm học/ngày.
- Verify mỗi đợt: build/typecheck/lint (0 cảnh báo)/format/test (136/136 cuối đợt 5, +24 so với
  đầu phiên)/size-limit đều xanh + lái app thật bằng Playwright (seed localStorage giả lập
  session, xác nhận UI đúng hành vi: badge SRS đếm toàn cục, cap 30 + ưu tiên quá hạn, mini-quiz
  20 câu xen kẽ 2 chiều, tốc độ mặc định 10/20 đúng theo user mới/cũ, test-out đánh dấu đúng cả
  vòng + không tính vào bộ đếm ngày).

## Đã xong (nghiên cứu cải tiến UI/UX — 2026-07-04)

> Theo yêu cầu người dùng "nghiên cứu cải tiến luôn ui/ux". CHỈ tài liệu, không đổi code.
> Kết quả: `docs/research/cai-tien-ui-ux.md` — khảo sát bằng Playwright thật (12 trang +
> 6 luồng tương tác ở khổ mobile 375×812, đo cuộn ngang/vùng chạm/vị trí phần tử bằng máy),
> đối chiếu checklist mobile-first + UI/UX 4 trạng thái của khung (BO-SUNG-chat-luong-Nhom-2).

- 11 vấn đề xếp hạng (3 🔴): trang chủ là menu tĩnh không có "Học tiếp"/SRS due (U1); không có
  bottom-nav, đổi chế độ nào cũng phải về Home (U2); onboarding hỏi 3 câu nhưng KHÔNG nơi nào
  đọc lại câu trả lời (U3 — "AI sẽ điều chỉnh độ khó" chưa được thực hiện). Bug layout thật đo
  được: hàng nhập Chat tràn 15px ở 375px vì input thiếu `min-w-0` (U4); throttle 10s giữa mỗi
  tin chat (U5); lỗi kỹ thuật tiếng Anh phơi nguyên văn ra UI (U6). Kèm 5 mục nhỏ U7–U11.
- Kế hoạch 5 đợt PR nhỏ (U-1 vá điểm → U-5 bottom-nav) + 4 câu hỏi cần người dùng chốt
  (bottom-nav?, throttle 10s→3s?, vị trí thẻ Học tiếp, badge "Không giới hạn") — xem mục 5–6
  của tài liệu.

## ĐÃ XONG — TRIỂN KHAI kế hoạch UI/UX (2026-07-04 → 2026-07-05)

> Người dùng đã duyệt "triển khai luôn" toàn bộ kế hoạch ở `docs/research/cai-tien-ui-ux.md`,
> dùng phương án khuyến nghị cho cả 4 câu hỏi mở (đồng ý bottom-nav; giảm throttle 10s→3s; thẻ
> "Học tiếp" đặt TRÊN hàng 3 ô Ngôn ngữ/Streak/Giọng; bỏ bớt badge "Không giới hạn" dư thừa).
> Đã merge **U-1** (PR #194) + **U-2** (PR #193) + **U-3** (PR #195) + **U-4** (PR #197) +
> **U-5** (bottom-nav, PR #198) + **giảm throttle + "đã xem" Lessons/CommonPhrases** (nhánh
> làm việc hiện tại) — toàn bộ kế hoạch đã triển khai xong.

### U-3 — ĐÃ LÀM (2026-07-05, nhánh làm việc hiện tại)

- **`src/lib/onboarding.ts` (mới)**: chiều ĐỌC cho dữ liệu onboarding (trước chỉ ghi qua
  `saveOnboarding`, không nơi nào đọc lại). 2 tầng như profile: cache localStorage
  (`et_onboarding_<uid>`, ghi ngay lúc onboarding xong) → Supabase `profiles`
  (`user_level`/`goal`/`daily_minutes`, fetch nền cho thiết bị mới). Kèm hook `useOnboarding()`
  - `minutesToSpeed()` (5→5, 10→10, 20/30→20). 9 test mới (`onboarding.test.ts`, mock supabase).
- **`Onboarding.tsx`**: sau khi lưu → cache local + `setDailySpeed(minutesToSpeed(minutes))` —
  phút/ngày khai lúc onboarding giờ đặt luôn tốc độ học từ vựng (trước đây bị bỏ qua, ai cũng
  nhận mặc định 10).
- **`Chat.tsx` / `Speaking.tsx`**: SetupScreen nhận `defaultLevel` từ onboarding thay vì cứng
  `'intermediate'`. Onboarding về trễ (thiết bị mới) chỉ áp lại khi người dùng CHƯA tự bấm chọn
  (ref `levelTouched` — không ghi đè lựa chọn tay).
- **`CefrLevelPage.tsx`**: banner gợi ý test-out ở trang A1 khi khai trình độ ≥ Trung cấp —
  chỉ hiện khi từ vựng A1 < ngưỡng mở A2 (`UNLOCK_PCT`), có nút X đóng (ghi nhớ
  `et_a1_testout_dismissed_<uid>`), trỏ tới nút "Tôi đã biết vòng này — kiểm tra nhanh" có sẵn.
- Verify: typecheck/lint (0 cảnh báo)/format/test (157/157)/build/size-limit (112.96/116 kB)
  xanh; lái app thật bằng Playwright khổ mobile 375px (9/9 kịch bản: mặc định trình độ theo
  cache, không cache giữ Trung cấp như cũ, banner A1 hiện/ẩn/nhớ sau reload, flow onboarding
  thật ghi đúng cache + tốc độ 20). Full E2E suite 68/68 xanh.

### U-2 — ĐÃ LÀM (chưa merge, xem nhánh làm việc hiện tại)

- Thẻ **"Học tiếp"** đầu trang Home (`Home.tsx`), đặt TRÊN hàng 3 ô Ngôn ngữ/Streak/Giọng đọc —
  đọc `findNextStep` (`lib/cefrProgress.ts`, cần `loadCefr()`+`loadFoundation()` như
  `CefrLevelPage.tsx`) để tìm CẤP đầu tiên chưa khóa còn mục chưa xong, hiện đúng vòng từ vựng
  hoặc bài ngữ pháp kế tiếp. Bấm vào đi thẳng `/learning-path/<cấp>` (tab "Bài học" mặc định, đã
  có sẵn nút "Học tiếp" nổi bật ở đầu — 1 chạm nữa là vào đúng màn).
  2 chip phụ (không lồng trong nút chính, tránh nút-trong-nút sai HTML):
  số thẻ SRS đến hạn (`getSRSStats`, TOÀN lộ trình — không cần nạp từ điển) bấm vào mở thẳng
  `/learning-path/<cấp>?tab=srs`; tiến độ mục tiêu ngày (`getDailyLearned`/`getDailyMax`,
  `lib/curriculum.ts`) chỉ hiển thị, không bấm được.
- **`CefrLevelPage.tsx`** thêm hỗ trợ mở thẳng tab qua URL `?tab=today|srs|hard|quiz|lessons`
  (dùng `useSearchParams`, tab không hợp lệ/thiếu → mặc định "Bài học" như cũ) — hạ tầng cần
  thiết để chip SRS ở Home điều hướng đúng tab.
- Không hiện thẻ khi: dữ liệu chưa tải xong, hoặc TOÀN BỘ lộ trình A1→B2 đã hoàn thành (edge
  case hiếm, không có "cấp đang học dở" nào để gợi ý).
- Verify: build/typecheck/lint (0 cảnh báo)/format/test (149/149)/size-limit (112.84/116 kB JS)
  đều xanh; lái app thật bằng Playwright (seed localStorage giả lập user mới + user có thẻ SRS
  đến hạn) — xác nhận thẻ hiện đúng vòng từ vựng đầu tiên (A1 "Đại từ & lời chào"), chip SRS bấm
  vào mở đúng tab Ôn SRS và hiện đúng từ đến hạn; quét axe thật cả 4 theme trên Home — 0
  critical/serious. Full E2E suite (68/68) vẫn xanh.

### U-1 (một phần) — ĐÃ MERGE

- `lib/ai.ts`: lỗi kỹ thuật ("Invalid API response...") không còn phơi ra UI — thông điệp song
  ngữ thân thiện, chi tiết kỹ thuật vẫn `console.warn` + Sentry (`captureException`). Giữ nguyên
  message server đã thân thiện sẵn. +7 test (`lib/ai.test.ts`).
- `Chat.tsx`: `min-w-0` cho input — sửa bug tràn 15px ở 375px (đã ĐO THẬT bằng Playwright, xem
  tài liệu nghiên cứu mục U4).
- Vùng chạm ≥44px (`tap-44`, lớp có sẵn trong `index.css` — mở rộng vùng bấm vô hình, KHÔNG đổi
  kích thước hiển thị): avatar mở Hồ sơ (`Layout.tsx`), toggle Nữ/Nam (`VoiceToggle.tsx`),
  breadcrumb "‹ Lộ trình A1 → B2" (`CefrLevelPage.tsx`).
- Copy lỗi thời: Login "Dữ liệu lưu máy bạn" (sai từ khi có Supabase sync) → phản ánh đúng thực
  tế; FAQ `index.html` "7400+ từ" → "10.000+ từ" (khớp số thật ở trang Từ điển).
- `History.tsx`: empty state thêm nút CTA đi đúng trang luyện tập (chat/writing/speaking) theo
  tab đang rỗng — trước đó chỉ có thông điệp, không có hành động (đúng checklist khung).

### U-1 — CÒN LẠI (chưa làm, làm tiếp trước khi sang U-2)

- Bỏ bớt/gộp badge "Không giới hạn" lặp trên 3/7 card ở Home — quyết định: bỏ khỏi card không
  cần nhấn mạnh, hoặc đổi thành số liệu hữu ích hơn (vd số bài/số từ). Cần chọn 1 hướng.
- Vùng chạm chip từ vựng xếp sát nhau (`Dictionary.tsx` mục "Chủ đề phổ biến", chip vòng từ vựng
  trong unit `CefrLevelPage.tsx`) — **CỐ Ý CHƯA** áp `tap-44` vì các chip nằm cạnh nhau chỉ cách
  `gap-1.5`; mở vùng chạm vô hình lên 44px có thể chồng lấn sang chip bên cạnh → bấm nhầm. Cần
  tăng `gap` trước rồi mới áp `tap-44`, hoặc chỉ tăng padding nhẹ (`py-1` → `py-1.5`/`py-2`) —
  cần thử nghiệm kỹ hơn, không hợp với tinh thần "vá nhanh" của đợt này.

### U-4 — ĐÃ LÀM (2026-07-05, nhánh làm việc hiện tại)

- **`CefrLevelPage.tsx`**: tiêu đề cấp ("A1 — Sơ cấp") chỉ hiện to (`PageHeader` + subtitle) ở
  tab "Bài học" — 4 tab học (Hôm nay/Ôn SRS/Từ khó/Kiểm tra) đã có ngữ cảnh riêng (vd "Từ
  3/10") nên thu tiêu đề thành 1 dòng nhỏ, đỡ chiếm chỗ màn hình nhỏ.
- **`StudyTabs.tsx`**: "Tổng đã thuộc: 0/10199" (tab Hôm nay) trước đây dùng `getPathProgress`
  (toàn bộ lộ trình ~10.199 từ) — gây hiểu lầm khi đang xem riêng 1 cấp. Đổi sang tiến độ CỦA
  CẤP: thêm `getPoolProgress(pool, learned)` (`lib/curriculum.ts`, tổng quát hóa từ
  `getPathProgress` — cùng logic đếm, nhận `pool` bất kỳ thay vì luôn `getLearningPath()`) rồi
  gọi với `pool` đã lọc theo cấp sẵn có ở trang cha — không cần truyền thêm `level`/`circleById`
  qua nhiều lớp component.
- **`QuickActions`** (Chia sẻ/Nhắc học): chỉ hiện ở tab "Bài học" — 4 tab học không cần lặp lại.
- 3 test mới cho `getPoolProgress` (`curriculum.test.ts`: pool rỗng, chỉ đếm từ trong pool,
  total khác toàn lộ trình).
- Verify: typecheck/lint (0 cảnh báo)/format/test (160/160)/build/size-limit (112.95/116 kB)
  xanh; lái app thật bằng Playwright — xác nhận tiêu đề gọn 1 dòng + QuickActions ẩn ở 4 tab
  học, "Tổng đã thuộc: 0/378" đúng tổng A1 (không phải 0/10199). Full E2E suite 68/68 xanh.

### U-5 (phần chính) — ĐÃ LÀM (2026-07-05, nhánh làm việc hiện tại)

> Quyết định người dùng chốt trước khi làm: tab "Luyện tập" **nhớ chế độ dùng gần nhất**
> (không mở sheet chọn) — Chat/Nói/Viết là 3 route độc lập, chưa có trang gộp chung.

- **`components/BottomNav.tsx` (mới)**: bottom tab bar cố định 4 mục Trang chủ · Lộ trình ·
  Luyện tập · Tiến độ — CHỈ hiện < 640px (`sm:hidden`, khớp breakpoint `sm:` Tailwind). Tab
  "Luyện tập" đọc/ghi `et_last_practice_<uid>` (localStorage) mỗi khi vào `/chat`/`/speaking`/
  `/writing` — bấm vào đưa thẳng tới route đã dùng gần nhất, mặc định `/chat` cho user chưa
  từng vào. Ẩn hoàn toàn ở `/login`, `/onboarding` (kiểm tra theo path, không chỉ dựa `!user`
  vì user context vẫn còn khi ở /onboarding). Gắn vào `App.tsx` (sibling `<Routes>`, trong
  `<BrowserRouter>`).
- **`index.css`**: biến `--bnav-h` (0 trên desktop, `4rem + safe-area` dưới 640px qua media
  query khớp breakpoint `sm:`) — mọi trang dùng chung 1 biểu thức
  `calc(...+var(--bnav-h))`/`h-[calc(100dvh-var(--bnav-h))]` mà KHÔNG cần viết class riêng cho
  từng breakpoint (biến tự về 0 trên desktop).
- **Rà toàn bộ trang** (nội dung/thanh dưới không bị BottomNav che — đây là rủi ro cao nhất
  của đợt này theo tài liệu gốc):
  - 7 trang layout cố định viewport (`h-dvh`/`h-[100dvh]`): `Chat.tsx`, `Speaking.tsx` (sticky
    input/nút ghi âm), `Lessons.tsx`/`CommonPhrases.tsx` (cả list lẫn detail — có thanh tìm
    kiếm cố định dưới ở list), `Dictionary.tsx` — đổi sang
    `h-[calc(100dvh-var(--bnav-h))]`; các flex-child "dính đáy" (input/search) tự động dời
    lên trên nav vì cả khối flex ngắn lại, không cần sửa riêng từng phần tử.
  - 7 trang cuộn thường (`min-h-dvh`): `Home.tsx`, `CefrLevelPage.tsx`, `Dashboard.tsx`,
    `Learn.tsx`, `Profile.tsx`, `Writing.tsx` (2 màn), `History.tsx` — thêm
    `pb-[calc(1.5rem+var(--bnav-h))]` (hoặc tương ứng) vào `<main>`.
- **`QuickActions`** (Chia sẻ/Nhắc học): bỏ khỏi 9 trang (Chat/Writing/Speaking/History/
  Dictionary/Lessons/CommonPhrases/Learn/CefrLevelPage) — chỉ còn ở `Dashboard.tsx` (đã có
  sẵn) + `Profile.tsx` (mới thêm), theo đúng đề xuất gốc "dời sang Hồ sơ/Tiến độ".
- Nhãn "Trang chủ/Lộ trình/Luyện tập/Tiến độ" đi qua i18n (`T.home` có sẵn + 3 key mới
  `navPath`/`navPractice`/`navProgress`) theo **ngôn ngữ giao diện**, không theo chiều học A/B
  (tránh lặp lại lỗi đã sửa ở U-1 — xem PR #194).
- 5 test E2E mới (`e2e/bottomnav.spec.ts`): hiện/ẩn đúng route, tab Luyện tập nhớ đúng chế độ,
  input Chat không bị che, QuickActions đúng vị trí mới, cuộn thật xuống đáy Home vẫn bấm được
  nút cuối trang.
- Verify: typecheck/lint (0 cảnh báo)/format/test (160/160)/build/size-limit (114.3/116 kB —
  tăng ~1.35kB do BottomNav + icon mới) xanh. Lái app thật bằng Playwright khổ mobile 390×844 —
  phát hiện ban đầu dùng `fullPage` screenshot cho ảnh sai (nav "dán" giữa trang, quirk render
  fixed-position của Playwright khi chụp fullPage) — xác nhận lại bằng cuộn thật + bounding box
  thật, không có che phủ thật. Full E2E suite 73/73 xanh (68 cũ + 5 mới).

### Giảm throttle + "đã xem" Lessons/CommonPhrases — ĐÃ LÀM (2026-07-05, nhánh làm việc hiện tại)

> Kế hoạch `docs/research/cai-tien-ui-ux.md` xem như đã triển khai hết (U-1 → U-5 + throttle).

- **Giảm throttle**: `useApiThrottle.ts` — mặc định `delayMs` đổi từ `10000` xuống `3000`; bỏ
  override `delayMs: 10000` tường minh ở `Chat.tsx`/`Writing.tsx`/`Speaking.tsx` (dùng chung
  mặc định mới của hook, tránh lặp giá trị 3 nơi). Đã chốt: không tăng trần chi phí vì lượt/ngày
  cap riêng qua `daily_usage`, throttle chỉ cần đủ chặn double-click/bão request.
- **`lib/viewedTracking.ts` (mới)**: Set "đã xem" tổng quát theo `namespace` (readSet/writeSet
  localStorage, mẫu giống `cefrProgress.ts`) — dùng chung cho cả Lessons và CommonPhrases thay
  vì viết trùng 2 lần. 6 test mới (`viewedTracking.test.ts`).
- **`Lessons.tsx`/`CommonPhrases.tsx`**: đánh dấu đã xem khi mở 1 bài/chủ đề; thẻ CTA "Tiếp tục"
  đầu danh sách trỏ tới mục đầu tiên (theo thứ tự danh sách gốc) CHƯA xem — ẩn khi đang tìm
  kiếm. Lessons dùng `meta.id` (số thứ tự 1..350, khớp "Bài N"); CommonPhrases dùng
  `meta.starter` (chuỗi duy nhất, không có field id riêng).
- 2 test E2E mới (`e2e/continue-viewing.spec.ts`): gợi ý đúng mục đầu tiên, đổi đúng sau khi
  xem xong mục trước. Phát hiện phụ: màn chi tiết CommonPhrases chỉ có nút back ở header (về
  thẳng Home) — không có nút "quay lại danh sách" riêng như Lessons (`LessonView`'s "←
  Danh sách") — ghi nhận, không sửa (ngoài phạm vi đợt này).
- Verify: typecheck/lint (0 cảnh báo)/format/test (166/166)/build/size-limit (114.33/116 kB)
  xanh. Full E2E suite 75/75 xanh (73 cũ + 2 mới).

Verify mỗi đợt như các đợt trước: typecheck/lint(0 cảnh báo)/format/test/build/size-limit
xanh + lái app thật bằng Playwright ở khổ mobile trước khi commit.

## Đã xong (hoàn tất đợt 4 + đợt 6 cải tiến lộ trình học — 2026-07-04)

> ⚠️ Phiên làm việc này ban đầu triển khai LẠI TOÀN BỘ 6 đợt của
> `docs/research/cai-tien-lo-trinh-hoc.md` trên 1 nhánh riêng — không biết rằng một session
> song song khác ĐÃ merge phần lớn cùng kế hoạch đó (đợt 1,2,3,5 ở trên) qua PR #190 trước
> khi PR của phiên này kịp merge. Phát hiện xung đột khi chuẩn bị merge (PR #191, đã ĐÓNG
> không merge). Đã dựng lại nhánh từ `main` mới nhất (đã có #190) và chỉ mang sang 2 phần
> KHÔNG trùng với #190:

- **Hoàn tất Đợt 4 — chạy thật script gắn tần suất**: hạ tầng `api/_lib/wordFreq.ts` +
  `scripts/assign-word-freq.ts` (từ PR #190) đã sẵn sàng nhưng chưa có wordlist thật. Chạy
  thật bằng nguồn **SUBTLEX-US** (gói npm `subtlex-word-frequencies`, giấy phép ISC, tác giả
  `wooorm`, 74.286 từ, nguồn Brysbaert & New 2009) — sinh wordlist `.txt` (sắp theo tần suất
  giảm dần) từ gói rồi chạy `FREQ_LIST=... npm run tag:freq`. Kết quả: **9.540/10.006 từ có
  freq** (466 từ không có, chủ yếu cụm nhiều từ/idiom — xếp cuối phần "Mở rộng" như thiết
  kế). Đã hỏi người dùng trước khi chọn nguồn thay thế NGSL (NGSL không có gói npm/nguồn tải
  trực tiếp ổn định trong môi trường chạy script) — được đồng ý. Idempotent (chạy lại không
  đổi gì). Đã kiểm mẫu tay: "a"→hạng 6, "about"→51, "above"→1337 — đúng trực giác thông dụng.
- **Mới — V8: Quiz ngữ pháp trong tab "Kiểm tra"**: `buildQuiz()` (`StudyTabs.tsx`) trộn tối
  đa 3 câu quiz ngữ pháp (`GrammarLesson.quiz`, dữ liệu có sẵn) — CHỈ lấy từ bài **đã đánh dấu
  "Đã học xong"** (`grammarQuizPool` tính ở `CefrLevelPage.tsx` từ `doneGrammar`) — trộn cùng
  câu từ vựng như cũ (tổng vẫn ~10 câu/lượt). Câu ngữ pháp hiện dạng câu có chỗ trống (vd "I
  ___ a student.") thay vì từ đơn. Trả lời sai → nút "Mở lại bài" mở đúng bài ngữ pháp đó.
  Ngữ pháp trước đây không có vòng lặp củng cố như từ vựng — nay ôn lại gián tiếp qua tab
  Kiểm tra.
- **Mới — V2 (phần còn lại): Vé nghỉ streak**: `getStreak()` (`lib/storage.ts`) tự động bắc
  cầu qua NGÀY ĐẦU TIÊN bị bỏ lỡ trong ~7 ngày gần nhất (1 vé/tuần, giảm churn 21% ở
  Duolingo). Ghi nhớ ngày đã dùng vé (`et_streak_freeze_<uid>`) để không dùng lặp trong cùng
  1 tuần + idempotent. ⚠️ Lưu CỤC BỘ (localStorage), CHƯA đồng bộ Supabase — thêm cột/migration
  cho tính năng nhẹ này chưa xứng đáng ở giai đoạn này.
- **V9 (FSRS thay SM-2): KHÔNG làm** — đúng khuyến nghị "cân nhắc, không gấp" của tài liệu
  nghiên cứu gốc.
- 6 test mới (`storage.test.ts` — file mới, streak freeze bắc cầu/cooldown/idempotent).
  Verify: build/typecheck/lint/test (149/149)/format/size-limit xanh. Lái app thật bằng
  Playwright — xác nhận: (1) tab Kiểm tra hiện câu hỏi dạng "___" xen giữa câu từ vựng; (2)
  seed lịch sử có 1 ngày nghỉ ở giữa → `/progress` hiện đúng streak bắc cầu (4, không đứt còn 2) + `et_streak_freeze_*` ghi đúng ngày dùng vé. Full E2E suite (68/68, a11y 4 theme) xanh.
- **Bài học rút ra**: khi nhiều phiên làm việc có thể chạy song song trên cùng repo, nên kiểm
  tra PR đang mở/mới merge trên GitHub TRƯỚC khi bắt đầu 1 kế hoạch lớn đã có trong tài liệu
  research — tránh trùng công sức. Không có cách nào phiên này biết trước về phiên kia (không
  có cơ chế khoá/thông báo giữa các session Claude Code chạy độc lập).

## ⚠️ Cần làm tay (chưa xong)

- ~~Điền dữ liệu tần suất từ thật cho phần "Mở rộng"~~ — ĐÃ XONG (xem "Đã xong" bên dưới):
  chạy thật bằng nguồn SUBTLEX-US (gói npm `subtlex-word-frequencies`), 9.540/10.006 từ có freq.

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

## Đã xong (thay 409 từ đầu tiên của Đợt 1 CEFR A1-B2 — 2026-07-05)

- **Bối cảnh:** người dùng yêu cầu bổ sung 100% từ CEFR A1→C2 còn thiếu trong từ điển (không chỉ
  409 từ ban đầu). Đối chiếu toàn bộ wordlist CEFR-J/Octanove với từ điển hiện có (nền tảng
  `curriculum.ts` + mở rộng `public/data/dictionary/`) cho thấy **tổng 3.056 từ thiếu** (A1=48,
  A2=161, B1=443, B2=997, C1=600, C2=807; 2.932 từ đơn + 124 cụm từ). Đã chốt chia **2 đợt**: Đợt
  1 = A1→B2 hoàn chỉnh (1.649 từ), Đợt 2 = C1→C2 (1.407 từ, làm sau, PR riêng).
- **Đã hoàn tất 409/1.649 từ của Đợt 1** — xoá 409 từ đơn không có trong CEFR-J/Words-CEFR-Dataset
  (idiom + từ lóng công nghệ/thương hiệu: bitcoin/ipad/javascript/paypal...), thay bằng 409 từ
  CEFR-J thật (ưu tiên A1=26 → A2=112 → B1=271), viết đầy đủ nội dung (vi/ex_en/ex_vi/ipa_en/
  ipa_vi) qua 4 agent song song theo đúng quy ước IPA tiếng Việt của từ điển (thanh điệu Bắc Bộ,
  chỉ phiên âm âm tiết đầu bản dịch `vi`). Đã kiểm tra khớp 100% word/pos/level + spot-check IPA
  tay ~20 từ đều đúng quy tắc trước khi gộp.
- **Đã gộp vào `public/data/dictionary/` thật:** xoá 409 entry cũ, chèn 409 entry mới, sắp lại
  alphabet + dàn đều 10 chunk (~1000/chunk). Chạy `scripts/assign-word-freq.ts` (SUBTLEX-US, gói
  `subtlex-word-frequencies`) điền `freq` cho 373/409 từ mới (36 từ có dấu chấm/gạch nối như
  "a.m."/"mrs." không khớp wordlist, giữ nguyên như thiết kế cũ — xếp cuối phần Mở rộng).
- **Kết quả: 10.006/10.006 từ (100%) đã có nhãn CEFR** — không còn từ nào thiếu `level`, không
  trùng từ (`10.006 unique`), không thiếu field bắt buộc nào.
- Verify: build ✅ · typecheck ✅ · lint ✅ (0 cảnh báo) · format ✅ · test ✅ (201/201) ·
  size-limit ✅ (114.33/116 kB JS, 8.91/9 kB CSS).
- An toàn xoá đã được xác nhận trước (research agent): `src/data/curriculum.ts` (circle nền
  tảng) tự chứa dữ liệu riêng, không tham chiếu cứng vào `public/data/dictionary/`; SRS/tiến độ
  học của người dùng lưu theo string từ, từ bị xoá chỉ "mồ côi" (không crash).
- **CI của PR #204 báo failure** nhiều lần rerun nhưng log tải về lỗi 404 liên tục — nghi hạn chế
  môi trường CI mô phỏng của phiên làm việc này, không phải lỗi code thật (verify local nhiều lần
  đều xanh).

## Đã xong (hoàn tất 1.059 từ đơn còn lại của Đợt 1 A1-B2 — 2026-07-05, PR #205)

- **Quyết định đổi hướng so với batch 409 trước:** batch 409 dùng cách "swap" (xoá từ rác, thay
  từ CEFR-J thật, giữ nguyên tổng 10.006). Kiểm tra lại trước khi làm tiếp: chạy thử tier 1+2 của
  `tag:cefr` (bỏ qua field `level` có sẵn) trên toàn bộ dict hiện tại → **100% từ đều tra được**,
  tức là KHÔNG còn "từ rác thật sự" nào để swap nữa (batch 409 đã dọn sạch). Từ đây **đổi sang
  GROW từ điển** (thêm thẳng, không xoá gì) — an toàn hơn, không có gì để cân nhắc đánh đổi.
  `size-limit` không bị ảnh hưởng (dictionary là JSON tĩnh fetch runtime qua `fetch()`, không nằm
  trong bundle JS mà `size-limit` đo).
- **Đối chiếu lại CEFR-J v1.5 (A1-B2) với dict sau batch 409** (10.006 từ) → còn thiếu 1.271 mục.
  Lọc: 125 cụm nhiều từ (hoãn — cần gắn `pos` theo vai trò ngữ pháp thật, không dùng `idiom`), 15
  mảnh vỡ/viết tắt mơ hồ (`'m/'re/'s`, `mr/mrs/ms/dr/pm/id/cv/eco`, `ness` do CEFR-J tách từ lỗi,
  tên riêng `smith/englishman`, lỗi chính tả `mommie`), 67 từ trùng nghĩa BrE/AmE với từ đã có
  (colour/color, organise/organize, gramme/gram, litre/liter, cheque/check, gaol/jail... — dùng
  hàm chuyển đổi hậu tố BrE→AmE tự viết + danh sách bất quy tắc, xem lịch sử chat để tái tạo nếu
  cần) → còn lại **1.059 từ đơn** thật sự cần thêm.
- **Viết nội dung qua 4 round, 11 agent song song** (batch ~90-125 từ/agent, tối đa 3 agent chạy
  cùng lúc — theo đúng khuyến cáo "đừng launch quá nhiều agent song song" ở lần trước): round 1
  (311 từ: hết A1=3+A2=6+B1=114 còn thiếu + 194 B2), round 2 (188 từ B2 — 1 agent lỗi do chạm giới
  hạn phiên, chạy lại thành công), round 3 (282 từ B2), round 4 (278 từ B2, xong tròn 1.059).
- **Kiểm tra chất lượng bằng script tự viết** (không lưu vào repo, chỉ dùng tạm trong phiên):
  đối chiếu thanh điệu Unicode (combining diacritic) của ÂM TIẾT ĐẦU trong `vi` với ký hiệu thanh
  trong `ipa_vi` — bắt được **25/1.059 lỗi thật** (2.4%) trước khi gộp, chủ yếu 2 dạng lặp lại
  nhiều agent: (1) "sự"/"tự" (thanh nặng) bị phiên nhầm thành thanh ngang — lỗi phổ biến nhất dù
  đã nhắc trong prompt từ round 2 trở đi; (2) khi `vi` là cụm nhiều chữ, agent phiên âm nhầm sang
  chữ thứ 2/3 thay vì chữ đầu (vd "được trân trọng" → phiên nhầm "trân"). Cũng chuẩn hoá 1 agent
  dùng sai ký hiệu `ɨ` thay vì `ɯ` cho nguyên âm "ư" (quy ước cũ dùng ɯ 1.574 lần, ɨ 0 lần).
- Chạy `scripts/assign-word-freq.ts` (SUBTLEX-US) sau mỗi round — điền freq cho ~85% từ mới mỗi
  lô (phần còn lại là từ hiếm không có trong SUBTLEX, giữ nguyên như thiết kế cũ).
- **Kết quả: từ điển 10.006 → 11.065 từ** (100% có `level`, không trùng, không thiếu field).
- Verify mỗi round: build/typecheck/lint(0 cảnh báo)/format/test(201/201)/size-limit
  (114.33/116 kB JS — không đổi vì dictionary không nằm trong bundle) — xanh cả 4 lần.
- PR: https://github.com/seeker19110/bilingual-english-vietnamese/pull/205

## Đã xong (dọn từ trùng lặp lãng phí lượt học — 2026-07-05)

- Người dùng phát hiện lộ trình học có nhiều **từ giống nhau bị tách thành 2 mục riêng** (biến thể
  số nhiều/chia thì của cùng 1 từ gốc, vd `account`/`accounts`, `allow`/`allows`) → tốn 1 lượt học
  hằng ngày cho thứ về bản chất người dùng đã biết. Kiểm tra thực tế:
  - Trùng giữa Nền tảng (`curriculum.ts`) và Mở rộng (từ điển): **không phải vấn đề** — code
    (`getCircles()` trong `src/lib/curriculum.ts:146-152`) đã tự loại theo `wordKey` từ trước.
  - Trong 11.065 từ của từ điển Mở rộng: **675 nhóm cùng gốc từ / 1.474 từ liên quan** — phần lớn
    là số nhiều (-s/-es) hoặc động từ chia thì ngôi 3 (-s) của đúng 1 từ đã có.
- **Tiêu chí lọc (theo quyết định người dùng):** chỉ gộp cặp có **CÙNG `pos`** (loại trừ 72 cặp
  khác `pos` như `act`(v)/`acts`(n), `blue`(adj)/`blues`(n) — nghĩa khác hẳn, không phải số nhiều
  thật). Trong 461 cặp cùng `pos`, loại thêm thủ công **17 cặp** trông giống số nhiều nhưng thực
  chất khác nghĩa/chức năng ngữ pháp:
  - Đại từ sở hữu tuyệt đối khác tính từ sở hữu: `hers/ours/theirs/yours` (giữ cả 2, không phải số
    nhiều của `her/our/their/your`).
  - Nghĩa lệch hẳn khỏi số nhiều đơn thuần: `sometimes`≠`sometime`, `backwards`≠`backward` (thêm
    nghĩa "lạc hậu"), `glasses`(kính mắt)≠`glass`(ly/vật liệu), `guts`(can đảm, thành ngữ)≠`gut`
    (ruột), `credits`(cuối phim)≠`credit`(tín dụng), `nerves`(sắc thái riêng)≠`nerve`, `terms`
    (điều khoản)≠`term`(thuật ngữ/học kỳ), `stairs`(cả cầu thang)≠`stair`(1 bậc), `sales`(doanh
    số)≠`sale`(giảm giá), `utilities`(dịch vụ công ích)≠`utility`(tiện ích), `stats`(còn nghĩa
    "ngay lập tức", thân mật)≠`stat`.
  - **Pluralia tantum** (tiếng Anh luôn nói số nhiều, không có dạng số ít tự nhiên): `pajamas`,
    `trousers` — giữ nguyên cả 2, không xoá.
- **Còn lại 444 cặp** gộp an toàn (chiếm 370/444 đã có nhãn rõ "(số nhiều)"/"số nhiều của..." ngay
  trong bản dịch `vi` — tín hiệu đáng tin sẵn có trong dữ liệu; 74 cặp còn lại là chia động từ ngôi
  3 số ít hoặc diễn đạt khác chữ nhưng cùng nghĩa, đã soát tay từng dòng). Xoá **444 mục trùng**
  khỏi `public/data/dictionary/chunk-*.json`, giữ dạng gốc/số ít (đúng đề xuất: thông dụng hơn,
  nhiều `freq` thấp hơn). Không có trường hợp bắc cầu (mục vừa bị xoá vừa là đích giữ lại của cặp
  khác). Kết quả: **từ điển 11.065 → 10.621 từ**, không còn nhóm biến thể số nhiều/chia thì thuần
  tuý bị tách đôi.
- Build/typecheck/lint (0 cảnh báo)/format/test (201/201) đều xanh — không có test nào hard-code
  tổng số từ nên không cần sửa gì khác. `dictionary` là JSON tĩnh fetch runtime, không nằm trong
  bundle JS nên `size-limit` không đổi.
- ⚠️ Chưa làm (nằm ngoài phạm vi đợt này): 125 cụm nhiều từ trùng lặp dạng cụm (vd cần xem lại
  "each other"/"one another"...) và rà lại các biến thể `-ing`/`-ed` mang nghĩa tính từ khác nhau
  thật sự (amazed/amazing...) — KHÔNG đụng vì có giá trị sư phạm riêng, giữ nguyên theo đúng phạm
  vi đã thống nhất.

## Đã xong (badge CEFR ở trang Từ điển — 2026-07-05)

- Hạ tầng dữ liệu `level` (100% từ đã gắn CEFR) có sẵn nhưng chưa hiển thị ở UI. Thêm badge cấp
  CEFR (A1-C2) cạnh badge loại từ trong kết quả tra từ (`src/pages/Dictionary.tsx`) — chỉ hiện khi
  `e.level` có giá trị.
- `LEVEL_COLOR` (`src/lib/pos.ts`) dùng ĐÚNG màu accent đã gán cho A1/A2/B1/B2 ở lộ trình học
  (xem `accent` trong `data/cefr.ts`: A1=emerald, A2=sky, B1=violet, B2=amber) để giữ màu ngữ
  nghĩa nhất quán toàn app (CLAUDE.md mục 4.8); C1/C2 dùng rose/cyan (2 màu chưa dùng cho pos/level
  nào khác, tránh trùng màu "idiom" đã là fuchsia).
- **Phát hiện thêm 1 lỗi a11y có sẵn TỪ TRƯỚC** khi tự viết E2E tạm để kiểm contrast badge mới:
  gate a11y chính thức (`e2e/a11y.spec.ts`) quét `/dictionary` nhưng CHƯA BAO GIỜ có kết quả tìm
  kiếm thật trong lúc quét (không mock `/api/dictionary` hay chunk tĩnh) → 2 lỗi `color-contrast`
  ở theme sáng (Blue sky/Pink) lọt lưới bấy lâu: (1) câu ví dụ tiếng Anh trong kết quả tra từ
  (`text-accent-300/80` và `/70`, 2 chỗ ở `KaraokeText`) thiếu `theme-light:text-accent-800`;
  (2) chip lọc loại từ "Tất cả" ở trạng thái đang chọn cũng thiếu `theme-light:text-accent-800`.
  Đã sửa cả 3 chỗ, tự viết E2E tạm (mock chunk từ điển, dựng đủ 6 cấp CEFR) kiểm lại đủ 4 theme —
  0 critical/serious, đã xoá file test tạm sau khi xác nhận (không đưa vào gate CI vì cần
  mock chunk tĩnh phức tạp hơn `mockClaude`, để dành nếu cần mở rộng gate sau).
- Build/typecheck/lint (0 cảnh báo)/format/test (201/201)/size-limit (114.29/116 kB JS)/a11y đầy đủ
  63 test đều xanh.

## Đã xong (125 cụm nhiều từ còn lại của Đợt 1 A1-B2 — 2026-07-06)

- Hoàn tất phần cuối của Đợt 1: **125 cụm nhiều từ** trong CEFR-J A1-B2 mà từ điển còn thiếu
  (vd "good morning", "bus stop", "each other", "according to"). Đối chiếu lại CEFR-J v1.5:
  145 cụm A1-B2 tổng, 20 đã có sẵn → còn đúng 125 cụm cần thêm.
- **Gắn `pos` theo vai trò ngữ pháp THẬT** (không dùng `idiom`): phần lớn là `n` (danh từ ghép
  như "bus stop"), số ít `prep` ("according to", "next to", "instead of"...), `adv` ("all right",
  "face to face", "next door", "upside down"), `pron` ("each other", "no one"), `adj` ("de facto",
  "fed up", "worn out", "environmentally friendly"), `interj` ("good morning/afternoon/night"),
  `v` cho cụm bán trợ động từ ("have to", "used to", "ought to"). Giữ `level` đúng từ CEFR-J.
- **Kiểm chất lượng bằng chính script đối chiếu thanh điệu** (thanh của âm tiết ĐẦU trong `vi` so
  với ký hiệu thanh cuối `ipa_vi`) như các đợt trước — bắt được **2/125 lỗi copy-paste** trước khi
  gộp (air conditioning "điều" thanh huyền bị gắn nhầm ˨˩ʔ; travel agent "nhân" bị gắn nhầm IPA của
  từ khác) → đã sửa, chạy lại 0 lỗi.
- Phân bố cụm mới lên 10 chunk theo round-robin (giữ chunk cân bằng). Chạy `tag:freq` (SUBTLEX-US)
  sau khi gộp — cụm nhiều từ hầu hết không có trong wordlist đơn từ nên giữ nguyên (xếp cuối phần
  Mở rộng, đúng thiết kế). Kết quả: **từ điển 10.621 → 10.746 từ** (100% có `level`, không trùng,
  0 pos/level không hợp lệ, không thiếu field bắt buộc).
- Build/typecheck/lint (0 cảnh báo)/format/test (201/201)/size-limit (114.29/116 kB — dictionary là
  JSON tĩnh, không nằm trong bundle) đều xanh.
- **→ Đợt 1 (A1-B2) đã HOÀN TẤT HẲN** (cả từ đơn lẫn cụm nhiều từ). Còn lại: Đợt 2 (C1-C2).

## ⏭️ Còn lại: Đợt 2 (C1-C2) — làm ở phiên sau

> Việc lớn, làm qua NHIỀU phiên. Nếu hit session limit giữa chừng: dừng, KHÔNG tự relaunch hàng
> loạt agent, ghi lại đúng đã làm tới đâu rồi chờ người dùng (theo CLAUDE.md mục 3).

- **Đợt 2 — C1→C2 (1.407 từ)**: làm sau khi Đợt 1 xong hẳn (kể cả phần cụm từ), PR riêng, quy
  trình tương tự (đối chiếu Octanove C1/C2 wordlist → lọc trùng/rác → viết nội dung theo lô →
  gộp → freq → verify → commit). Nhớ chạy lại kiểm tra script đối chiếu thanh điệu trước khi gộp
  mỗi lô — bắt lỗi hiệu quả, chi phí thấp.

## Tiếp theo

> Làm tăng dần, mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (theo CLAUDE.md mục 3).

- Thanh toán Pro (cổng nâng cấp gói) — cần quyết định sản phẩm (nhà cung cấp, giá, webhook) trước
  khi code; theo CLAUDE.md mục 12 phải dừng hỏi người dùng trước khi bắt đầu.
- ~~Chạy thật `NO_AI_FALLBACK=1 npm run tag:cefr` trên file gốc~~ ĐÃ XONG (2026-07-05) — 100%
  từ điển đã có nhãn CEFR thật, không cần AI. ~~Badge CEFR trên trang Từ điển~~ ĐÃ XONG
  (2026-07-05, PR #207) — hiển thị badge A1-C2 cạnh badge loại từ trong kết quả tra từ.
- ~~Zod validate input (đợt 3)~~ ĐÃ XONG (2026-07-05) — xem "Quyết định quan trọng" bên dưới.
  Query param của `api/dictionary.ts`/`api/pronunciation.ts` vẫn giữ nguyên (đã sanitize kỹ
  bằng tay, giá trị thêm Zod thấp — GET query, không phải JSON body).
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
- Zod (validate input): trước đây đánh giá giá trị thấp (ưu tiên E2E/a11y trước) — làm THEO ĐỢT
  NHỎ (không "big bang" cả `api/`): đợt 1 `stt.ts`/`tts.ts` (PR #156), đợt 2 `push.ts`, **đợt 3
  (cuối) — `ai.ts` (2026-07-05, nhánh làm việc hiện tại): schema CHỈ định hình lại logic lenient
  cũ (cắt bớt tin nhắn/nội dung, mặc định max_tokens/system) qua `.catch()`/`.transform()`,
  KHÔNG siết chặt thêm — duy nhất giữ nguyên 1 hành vi từ chối (413 khi tổng nội dung quá lớn).
  2 điểm khác `stt.ts`/`tts.ts`: (a) response lỗi lồng `{ error: { message } }` (không phẳng như
  stt/tts) để khớp `src/lib/ai.ts:58` đọc `err.error?.message`; (b) không dùng `readJsonBody` vì
  body đã đọc qua `req.text()` để kiểm tra `MAX_BODY_BYTES` trước đó — Request stream chỉ đọc
  được 1 lần. +6 test mới (`api/ai.test.ts`, tổng 16/16). Toàn bộ rollout Zod đã xong.** Bản Zod
  dùng là v4 (`z.string({ error })`, `.refine(fn, { error, params })` — khác cú pháp
  `message`/`errorMap` của v3).

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
