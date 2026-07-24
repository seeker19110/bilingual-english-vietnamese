# PROGRESS.md — Trạng thái dự án

> AI đọc file này để biết đang ở đâu. Chi tiết tính năng: `PROJECT.md`. Lịch sử đầy đủ từng PR:
> `git log`/PR đã merge trên GitHub — file này chỉ giữ **tóm tắt** + việc còn mở + quyết định lớn.
>
> **Nhịp làm việc theo giới hạn giờ (CLAUDE.md mục 3):** ≥ 70% usage → hoàn tất việc đang làm, tạo
> PR rồi DỪNG chờ duyệt. < 70% → sau khi PR merge, tự động tiếp tục mục kế tiếp.

## Giai đoạn hiện tại

GĐ 4–5 (Phát triển + nâng chất lượng). Sản phẩm đã deploy thật
(https://en-vi.donghanhcungban.com). Đã áp xong Lớp 1 (hàng rào: Prettier/ESLint/TS
strict/husky/CI) và Lớp 2 (E2E Playwright + a11y AA toàn site + coverage ratchet + bundle-size
budget) của `docs/framework/AP-DUNG-vao-du-an-co-san.md`. **Đã rời Supabase hoàn toàn
(2026-07-19→20, Giai đoạn A→E) — xem `docs/migration-thoat-ly-supabase.md`.** Không có việc
code nào đang mở; còn vài thao tác THỦ CÔNG trên VPS (xem "Cần làm tay").

## Đã xong — tóm tắt theo mảng

**Lõi sản phẩm (MVP → v2):** đăng nhập Supabase Auth · 3 chế độ Chat/Viết/Nói song ngữ (STT
Groq-OpenAI + TTS Google Cloud 2 giọng, cache mã hoá AES-256-GCM) · đếm lượt/ngày atomic
(RPC `consume_usage`/`refund_usage`) tách riêng theo mode (chat/writing/speaking/stt) · mở
chiều B (dạy Việt qua Anh) · deploy VPS (PM2 + Nginx + Let's Encrypt) sau Cloudflare · nút
"Kết thúc & chấm điểm" cuối phiên Chat/Speaking · trang cá nhân `/profile`.

**Lộ trình học:** vòng từ vựng nền tảng theo chủ đề, tốc độ 5/10/20 từ/ngày tự chọn · lộ trình
chuẩn CEFR **A1→C2 đầy đủ 6 cấp** (mỗi cấp 1 trang riêng, thứ tự Từ vựng→Ngữ pháp→Hội thoại,
4 tab Hôm nay/Ôn SRS/Từ khó/Kiểm tra lọc theo cấp) · bài thi cuối cấp chặn lên cấp (≥70%) ·
SRS toàn cục (cap phiên, leech, vé nghỉ streak) · xen kẽ từ vựng↔ngữ pháp · quiz ngữ pháp ·
Sổ lỗi cá nhân (Mistake Bank, `/mistakes`) · gamification (flashcard lật 3D, màn ăn mừng
streak/confetti, vòng cung phiên học nối lộ trình↔Chat/Speaking qua `targetWords`).

**Từ điển & dữ liệu:** 12.073 mục, **100% đã gắn nhãn CEFR** (A1-C2, qua CEFR-J/Octanove/
Words-CEFR-Dataset + AI cho phần còn thiếu) · dạng biến thể từ (`WordForms`, 8.740 từ, 200 bất
quy tắc) kèm ví dụ song ngữ cho ~391 ô bất quy tắc · tần suất từ thật (SUBTLEX-US, 9.540/10.006
từ) dùng để sắp "Mở rộng" theo độ thông dụng thay vì alphabet.

**Hạ tầng/chất lượng:** CI gate (lint/typecheck/test/build/format/E2E) trên mọi PR · coverage
ratchet + bundle-size budget (`size-limit`, thay Lighthouse CI) · a11y AA toàn site qua axe
(kể cả màn kết quả AI, 4 theme) — **đã đóng nợ a11y** · Zod validate input toàn bộ `api/*.ts` ·
Sentry error tracking (code xong, no-op tới khi có DSN) · auto-run migration Supabase khi
deploy (`deploy.sh` → `npm run migrate`, cần `SUPABASE_DB_URL`) · audit bảo mật/logic nhiều đợt
(RLS theo cột chặn tự nâng Pro/bypass lượt, timeout fetch, refund lượt khi provider lỗi, ranh
giới ngày theo giờ VN — chi tiết `AUDIT.md`) · **deploy zero-downtime (2026-07-20)**: PM2
chuyển cluster mode (1 instance) + `wait_ready` (`server.ts` gửi `process.send('ready')` sau
`app.listen` + graceful shutdown SIGINT/SIGTERM) — trước đó fork mode `pm2 reload` = tắt cũ
rồi mới bật mới → app chết ~10s mỗi lần deploy (thấy trong log deploy: 9 lần curl
"Couldn't connect"); logic reload + health check gom về `scripts/pm2-reload.sh` (cả
`deploy.yml`/`deploy.sh`/`scripts/deploy.sh` cùng gọi, tự phát hiện fork mode cũ để
delete+start MỘT lần vì PM2 không đổi được exec_mode qua reload) — đã kiểm chứng bằng PM2
thật trong sandbox: 3.766 request liên tục xuyên 2 lần reload, 0 request rớt.

**Tính năng mới:** Thử thách "Challenge 1 phút/ngày" (`/challenge`) — từ 2026-07-15 chạy
**CHU KỲ TUẦN** Thứ 2→CN (bảng 7 ô, tổng kết tuần vào CN, ăn mừng 7/7; bỏ vòng 30 ngày/vé
nghỉ/mốc — huy hiệu sẽ quay lại ở M2). ~~Migration `0010_challenge_entries.sql` chưa chạy trên
production~~ **hết hiệu lực (2026-07-20)** — ghi chú từ thời Supabase; sau khi rời hẳn sang
Postgres tự host, bảng `challenge_entries` đã có sẵn trong `postgres/schema.sql` (baseline khi
khởi tạo DB mới) nên tự động có qua `npm run migrate:pg`, không cần chạy riêng.

**i18n/UX:** song ngữ toàn site kể cả `/login` · bottom-nav mobile (Trang chủ/Lộ trình/Luyện
tập/Tiến độ) · thẻ "Học tiếp" ở Home · karaoke (sáng chữ theo giọng đọc) áp dụng mọi TTS >1 từ ·
chuẩn hoá vị trí nút loa/micro + vùng chạm ≥44px.

**Giọng TTS 14 giọng + gói VIP + admin cấu hình (2026-07-21, nhánh
`claude/chirp-3-hd-voice-upgrade-c06eds`, CHƯA MERGE — xem "Cần làm tay"):** mở rộng từ 4 → 14
giọng Chirp3-HD thật (7 nữ/7 nam, xác minh qua Google TTS `voices.list`) cho cả en-US/vi-VN ·
mọi user tự chọn giọng ở trang Hồ sơ (`VoicePicker`), lưu toàn cục áp dụng mọi trang · thêm gói
`vip` (bên cạnh free/pro) · **quyết định người dùng 2026-07-21:** hạn mức free=5/pro=100/
vip=không giới hạn (lượt/tính năng/ngày), khuyến mãi ra mắt hiện đang bật (mọi user = VIP tới
hết 31/12/2026, cấu hình được) · trang `/admin-settings` (admin xác thực qua `ADMIN_EMAILS`
trong `.env`) cho chỉnh 15 hạn mức + bật/tắt khuyến mãi lưu trong bảng `app_settings` — server
(`usage.ts`/`voiceAccess.ts`, cache 30s) và client (`src/lib/appSettings.ts`, đồng bộ lúc mở
app qua ETag/If-None-Match, không fetch thừa khi chưa đổi gì) đều đọc từ đây, không còn hard-
code trong nhiều file rời rạc.

## Tiếp theo

> Mỗi mục 1 PR, dừng xin duyệt ở mỗi cổng (CLAUDE.md mục 3).

- **[Kế hoạch 2026-07-22] Giao diện + nội dung theo độ tuổi** — nhánh
  `claude/ui-redesign-age-groups-rk71g8`. Ý tưởng: app đổi giao diện thị giác và giọng điệu nội
  dung theo nhóm tuổi người dùng, đặc biệt nhóm Nhi đồng cần giao diện vui nhộn hơn hẳn. Đã
  nghiên cứu code thật (`src/lib/theme.ts`, `postgres/schema.sql`, `src/pages/Onboarding.tsx`,
  `src/pages/Profile.tsx`, `api/auth.ts`, `api/profile.ts`, `src/prompts/index.ts`) và **chốt
  cùng người dùng** các quyết định sau:
  - **4 nhóm tuổi:** Nhi đồng (<10) · Thiếu niên (10–15) · Thanh niên (16–22) · Người lớn (23+).
  - **Cả giao diện lẫn nội dung** đổi theo tuổi (không chỉ 1 trong 2).
  - **Lấy nhóm tuổi bằng cách hỏi lúc đăng ký/hồ sơ** — cột `age_group` trong `profiles`, KHÔNG
    hỏi ngày sinh thật, chỉ cho chọn thẳng nhóm (tránh thu thập dữ liệu nhạy cảm trẻ em).
  - **Nhóm Nhi đồng sẽ bị khoá cứng vào theme vui nhộn riêng** (GĐ 2, chưa làm) — không cho tự
    đổi sang 4 theme người lớn hiện có.
  - **4 giai đoạn nhỏ, mỗi giai đoạn 1 PR, dừng xin duyệt ở mỗi cổng.**

  **GĐ 1 (nền tảng thu thập nhóm tuổi) — CODE XONG, cổng commit đã đạt (build/typecheck/lint/
  format/test 613/613/size xanh — người dùng cần chạy migration thật để dùng được):**
  - `postgres/migrations/0002_age_group.sql` (mới) — cột `profiles.age_group` (text, check 4
    giá trị, cho phép NULL — user cũ chưa chọn tự fallback `'nguoi_lon'` ở code, KHÔNG ép migrate
    ngược). Rollback: `alter table profiles drop column if exists age_group`.
  - `api/profile.ts` — `GET` trả thêm `ageGroup` (NULL → `'nguoi_lon'`); `POST` mở rộng 2 action:
    `onboarding` (nhận thêm `ageGroup` optional, giữ nguyên giá trị cũ nếu không gửi — dùng
    `coalesce`) và action MỚI **`set-age-group`** (chỉ đổi đúng 1 cột — quyết định người dùng:
    tách riêng khỏi action `onboarding` thay vì tái dùng, giống pattern `setDailySpeed`/
    `setWeeklyGoal` chỉ đổi 1 giá trị). **Xác nhận sửa lại so với đề xuất ban đầu:** KHÔNG đụng
    `api/auth.ts` action `register` — level/goal/dailyMinutes vốn không lưu lúc đăng ký mà lưu
    sau đó qua `POST /api/profile` (từ bước cuối Onboarding), nhóm tuổi theo đúng luồng này.
  - `src/types.ts` — thêm `export type AgeGroup`.
  - `src/lib/onboarding.ts` — mở rộng `OnboardingData`/cache/`fetchOnboarding` theo đúng pattern
    2 tầng (cache localStorage → server) đã có; thêm `pushAgeGroup()` (bắn-rồi-quên, dùng cho
    Profile.tsx) + `isValidAgeGroup()`.
  - `src/pages/Onboarding.tsx` — **thêm bước chọn nhóm tuổi làm BƯỚC ĐẦU TIÊN** (quyết định người
    dùng: trước bước Trình độ, vì nhóm tuổi có thể ảnh hưởng giọng điệu các bước sau) — luồng
    onboarding từ 3 → 4 bước, progress bar + số thứ tự các bước sau đã dịch lại đúng.
  - `src/pages/Placement.tsx` — hàm `applyResultNow` (đổi trình độ từ trang Hồ sơ) giữ nguyên
    `ageGroup` đã có khi ghi đè lại profile (không vô tình xoá về mặc định).
  - `src/pages/Profile.tsx` — section mới "Nhóm tuổi" (pattern giống section tốc độ học/mục
    tiêu tuần đã có), gọi action `set-age-group` riêng qua `pushAgeGroup()`.
  - `src/lib/onboarding.test.ts` — cập nhật 3 test cũ theo field mới + 3 test mới (ageGroup lạ
    → fallback, server trả ageGroup hợp lệ → giữ đúng giá trị).
  - **Việc người dùng cần làm:** `npm run migrate:pg` trên VPS (hoặc máy dev) để tạo cột
    `age_group` trước khi deploy — thiếu cột này thì `api/profile.ts` sẽ lỗi SQL ngay.
  - **Tiếp theo (GĐ 2, CHƯA LÀM):** theme "Nhi đồng" vui nhộn — mở rộng `src/lib/theme.ts` +
    bộ biến `--a-*` mới trong `src/index.css` (kiểm AA kỹ vì màu sặc sỡ dễ vi phạm tương phản),
    tự áp + khoá cho nhóm Nhi đồng. Sau đó GĐ 3 (giọng điệu AI theo tuổi ở `src/prompts/
index.ts`) và GĐ 4 tuỳ chọn (gắn nhãn tuổi cho nội dung `curriculum.ts`).

- **Rời Supabase (2026-07-19→20, xem `docs/migration-thoat-ly-supabase.md`)**: GĐ A (Postgres 16
  tự host trên VPS) + GĐ B (auth tự viết Bearer token thay Supabase Auth) + GĐ C lõi
  (profiles/daily_usage/learning_progress qua `/api/profile`/`/api/progress`) + GĐ D (Cloudflare
  R2 thay storage) **ĐÃ CUTOVER + XÁC NHẬN trên production**. **GĐ C phần còn lại ĐÃ CODE XONG
  (2026-07-19, 2 nhánh):** (1) PR #274 — `tts_cache`/`pronunciations`/`push_subscriptions` sang
  `pgPool`; (2) nhánh `claude/dong-bo-tiep-tuc-rr5ghs` (đã merge nhánh #274 vào cho đồng bộ) —
  route mới `/api/history` (lịch sử chat/viết/nói + learn_count, thay `cloud.ts` query Supabase),
  `/api/challenge` (thay `challengeCloud.ts`), `/api/tutor-feedback` (thay `tutorFeedback.ts`),
  `api/leaderboard.ts` sang `pgPool`, XÓA `src/lib/supabase.ts` (client hết sạch Supabase),
  thêm 6 route mới vào dev proxy `vite.config.ts`. **GĐ E (dọn dẹp) ĐÃ XONG (2026-07-20,
  cùng phiên):** gỡ `@supabase/supabase-js` khỏi `package.json`, xóa `api/_lib/supabaseAdmin.ts`
  - nhánh driver `supabase` trong `fileStorage.ts` (mặc định còn `local`/`r2`), xóa biến
    `SUPABASE_*`/`VITE_SUPABASE_*` khỏi `.env.example`/`vite-env.d.ts`/`vitest.setup.ts`/
    `playwright.config.ts`, xóa thư mục `supabase/` (schema cũ còn trong git history) — sửa
    3 script seed còn gọi Supabase trực tiếp sang `pgPool`+`saveAudio()`
    (`scripts/seed-pronunciations.ts`, `scripts/prefetch-tts-patterns.ts`, `scripts/seed-all.ts`),
    xóa 2 công cụ di trú 1 lần đã hết tác dụng sau GĐ D
    (`scripts/check-supabase-audio.ts`, `scripts/sync-storage-to-vps.ts`) + script migration
    Supabase cũ (`scripts/run-migrations.ts`, đã có `run-pg-migrations.ts` thay thế). **Phát
    hiện + vá 1 lỗi nghiêm trọng lúc dọn dẹp:** `deploy.sh`, `scripts/deploy.sh` (2 script deploy
    khác nhau, xem ghi chú dưới) và `.github/workflows/deploy.yml` đều gọi `npm run migrate`
    (script Supabase cũ vừa xóa) — nếu không sửa thì **deploy tiếp theo sẽ crash ngay bước
    migration** (`set -e`). Đã đổi cả 3 chỗ sang `npm run migrate:pg`. Cập nhật
    `CLAUDE.md` mục 4+6, `docs/deploy-vps-ubuntu.md` (viết lại Bước 0 + khối `.env` mẫu +
    troubleshooting), `docs/DEPLOY.md`, `docs/seed-guide.md`, `DEPLOY_QUICK_GUIDE.md`,
    `DEPLOY_STEPS.md`, `BILINGUAL_SYSTEM.md`. Xóa 4 doc gốc đã hoàn toàn lỗi thời
    (`SUPABASE_SYNC_SETUP.md`, `AUTH_SETUP.md`, `PRONUNCIATION_CACHE_SETUP.md`,
    `TTS_CACHE_SETUP.md`, `PRONUNCIATION_CACHE_SPEC.md` — 2 file cuối tự ghi "có thể xóa" sẵn
    trong nội dung). Build/typecheck/lint/format/size/test xanh trước khi commit (xem PR).
    **Bổ sung cùng PR (2026-07-20, theo yêu cầu "copy hết dữ liệu TTS từ VPS, cache qua R2"):**
    `scripts/sync-storage-to-r2.ts` (`npm run sync:r2`) — đẩy audio ĐÃ CACHE TRƯỚC KHI bật R2
    lên Cloudflare R2 qua `saveAudio()` rồi cập nhật `audio_url`; an toàn chạy lại, có
    `--dry-run`/`--force`/`BUCKET`/`LIMIT`. **Bản đầu SAI — đã sửa (2026-07-20, người dùng chạy
    thử trên VPS thật báo "0 dòng" ở cả 2 bucket):** bản đầu đọc danh sách file cần đồng bộ TỪ
    DB (`select ... from tts_cache`), nhưng quyết định 2026-07-19 "bỏ qua migrate dữ liệu người
    dùng cũ" khiến Postgres tự host khởi động RỖNG — DB không có dòng nào dù `uploads/` trên VPS
    vẫn còn hàng nghìn file audio cache từ trước cutover, nên script cũ luôn thấy "0 dòng" và
    không đẩy được gì (bug thật, không phải môi trường thiếu dữ liệu). **Đã viết lại:** quét
    THẲNG ổ đĩa (`uploads/tts-cache/**/*.mp3`, `uploads/pronunciations/*.mp3`), suy
    hash/lang/voice (tts-cache) hoặc word/voice (pronunciations) từ TÊN FILE, upload lên R2 rồi
    `INSERT ... ON CONFLICT` tái tạo dòng DB — không cần dòng DB có sẵn. An toàn 100% cho
    tts-cache (VOICE_VERSION nằm trong hash, hash cũ tự động không khớp nếu giọng đã đổi); với
    pronunciations phải GIẢ ĐỊNH `voice_version = VOICE_VERSION hiện tại` (không suy được từ tên
    file, ghi rõ trong code — rủi ro thấp vì hằng số này chưa từng đổi). **Bug thứ 2 phát hiện
    khi chạy thật trên VPS (2026-07-20, sau khi merge bản quét ổ đĩa):** bucket `tts-cache` có
    quá nhiều file (bằng chứng thật — VPS báo lỗi) khiến `walkMp3()` crash
    `RangeError: Maximum call stack size exceeded` — nguyên nhân: `out.push(...(await
walkMp3(...)))` dùng spread để gộp mảng con vào `out`, mà spread truyền MỖI phần tử thành 1
    đối số riêng cho `.push()` → tràn giới hạn số đối số của V8 khi thư mục có hàng chục nghìn
    file. Sửa: đổi `walkMp3` sang nhận `out` làm tham số TRUYỀN QUA THAM CHIẾU (gom bằng
    `out.push(rel)` từng phần tử, không spread mảng con) — đã tự kiểm bằng cách tạo 150.000 file
    giả trong sandbox và chạy hàm mới, xác nhận không lỗi (bản cũ chắc chắn crash ở quy mô này).
    **VẪN CHƯA CHẠY THẬT TRÊN VPS SAU BẢN VÁ NÀY** (chỉ soát code + tự kiểm hàm quét file,
    build/typecheck/lint/test xanh) — việc người dùng cần làm: SSH vào VPS, `git pull`,
    `STORAGE_DRIVER=r2 npm run sync:r2 -- --dry-run` xem trước → bỏ `--dry-run` chạy thật — xem
    `docs/migration-thoat-ly-supabase.md` mục 10 bước 7.

- **Nâng cấp 5 hạng mục sư phạm còn thua app lớn** — ĐẶC TẢ ĐÃ VIẾT + người dùng ĐÃ CHỐT cả 4
  quyết định (2026-07-15: theo thứ tự ưu tiên · LÀM Azure · LÀM giải đấu tuần M5 · THAY Challenge
  bằng giải đấu tuần M5b) → theo bảng ưu tiên 17 PR mà làm:
  `docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md` (① chấm phát âm 2 giai đoạn · ② động
  lực duy trì (kể cả giải đấu tuần) · ③ nghe đa dạng · ④ placement test · ⑤ eval độ tin cậy AI).
  Tài liệu này KẾ THỪA các đề xuất D/H và V-4/V-5 bên dưới — khi làm theo nó thì đánh dấu mục
  trùng ở dưới. **Đã xong:** PR #1 (`lib/placement.ts` thuật toán bậc thang), PR #2 (trang
  `/placement` + nối onboarding) — PR #239, đã merge 2026-07-15. PR #3 (tốc độ phát TTS, ③ N1)
  — `RateToggle` toàn cục + `getRatePref`/`setRatePref` (`lib/tts.ts`) + `preservesPitch` +
  nối vào CefrLessonViews/Lessons/KaraokeText/Speaking/CommonPhrases/Dictionary — PR #240, đã
  merge 2026-07-15. PR #4 (xoay giọng nghe, ③ N2) — random giọng câu Nghe bài thi/placement
  (`ExamQuestion.audioVoice`) + `WordVoiceCycleButton` ở flashcard (xoay 4 giọng); hội thoại
  CEFR đã tự khác giọng theo vai A/B từ trước, không cần sửa — PR #241, đã merge 2026-07-15.
  PR #5 (golden set + eval baseline, ⑤ T1) — `scripts/eval-tutor-fixtures.json` (~60 câu),
  `scripts/eval-tutor.ts` (`npm run eval:tutor`, gọi đúng prompt+model+guardrail production qua
  `api/_lib/aiConfig.ts` mới tách), logic chấm thuần `scripts/lib/evalScoring.ts` + test (vào CI),
  luật eval khi đổi prompt/model ghi ở CLAUDE.md §8 — ĐÃ MERGE (PR #242, 2026-07-15). ⚠️ Số baseline
  (`docs/research/eval-tutor-baseline.md`) CẦN NGƯỜI CÓ KEY chạy `npm run eval:tutor -- --write-baseline`
  (sandbox Claude không có key AI). PR #6 (trap phát âm Việt + coach tip, ① G1) — đã merge
  (PR #244, 2026-07-15). PR #7 (mục tiêu tuần, ② M1) — `lib/weeklyGoal.ts` (3/5/7 ngày/tuần,
  tuần từ Thứ 2 giờ VN, cùng luật "ngày có học" với streak) + chọn ở `/profile` + vòng tiến độ
  `GoalRing` ở Dashboard + màn ăn mừng 1 lần/tuần (`WeeklyGoalCelebration`, nối sau màn streak
  trong StudyTabs) + đồng bộ cột `weekly_goal` (migration `0012`, hợp nhất updatedAt mới hơn
  thắng) — ĐÃ MERGE (PR #246, 2026-07-15), CÙNG PR đó: Challenge chuyển CHU KỲ TUẦN (xem quyết
  định mới bên dưới). PR #8 (huy hiệu, ② M2) — `src/data/achievements.ts` (~19 huy hiệu tĩnh,
  5 nhóm: streak 7/30/100/365 · từ vựng 100/500/1000 · qua cấp CEFR A1-C2 (6) · kỹ năng 10 phiên
  nói/10 bài viết đã chấm · challenge 10/30/100 bài + tuần trọn vẹn 7/7) + `src/lib/achievements.ts`
  (`checkNewAchievements` — CHỈ so dữ liệu ĐÃ CÓ SẴN, không thêm tracking mới; "chỉ cộng thêm",
  không thu hồi) — gọi ở 5 điểm chạm (học từ mới StudyTabs, nộp challenge, chấm bài viết, luyện
  nói, thi cuối cấp) + toast khi vừa đạt + lưới huy hiệu ở `/profile` (backfill huy hiệu cũ khi
  mở trang). ⚠️ KHÔNG làm "điểm phát âm ≥90 lần đầu" như đặc tả gốc — `pronounceScore.ts` chưa
  lưu lịch sử điểm, thêm tracking mới sẽ vượt phạm vi 1 PR nhỏ; thay bằng nhóm kỹ năng/challenge
  hiện có. Đồng bộ cột `achievements` (migration `0013`, hợp union) — ĐÃ MERGE (PR #247,
  2026-07-16). PR #9 (bài luyện nghe dictation, ③ N3) — tab thứ 6 "Nghe" ở trang cấp CEFR
  (`components/StudyTabs.tsx` `ListeningTab`, `pages/CefrLevelPage.tsx`), 2 chế độ: "Chọn nghĩa"
  (tái dùng `buildListeningQuestions` của `cefrExam.ts` — xuất khẩu thêm, cùng engine phần Nghe
  đề thi cuối cấp, tái dùng `ExamQuestionCard`) + "Gõ lại" (dictation — `lib/listening.ts` dựng
  câu từ hội thoại/ví dụ từ điển của cấp, chấm bằng `scorePronunciation`/`scoreWords` đã có).
  Tốc độ mặc định theo cấp (A1-A2 0.9× · B1-B2 1× · C1-C2 1.1×, `LISTENING_RATE_BY_LEVEL`) —
  nới kiểu `rate` của `speak()`/`speakBilingual()` từ `Rate` (0.75/1/1.25) sang `number` để nhận
  giá trị này (RateToggle không đổi) — ĐÃ MERGE (PR #248, 2026-07-16). PR #10 (vá prompt theo
  eval, ⑤ T2) BỊ CHẶN — cần baseline T1 trước (`npm run eval:tutor -- --write-baseline`, cần
  người có key AI, sandbox không có) → **bỏ qua tạm, làm PR #11 (comeback + Home "Hôm nay", ② M4)
  trước**. PR #11 — `lib/comeback.ts` (bỏ ≥3 ngày → banner "Mừng bạn quay lại" + phiên rút gọn
  5 thẻ SRS/3 từ mới qua `?tab=srs&cap=5`/`?tab=today&cap=3` mới thêm ở `TodayLesson`/`SRSReview`
  — CHỈ giới hạn batch/due list phiên đó, KHÔNG đổi tốc độ đã lưu) + `storage.daysSinceLastActivity`
  (mới) + `vocab.getRecentlyLearnedWords` (mới, cho gợi ý "Luyện nói với từ vừa học" ở Home —
  nối đề xuất B đã có CTA sẵn ở StudyTabs, đây là lối vào từ Home cho người không đang giữa
  phiên học) — ĐÃ MERGE (PR #249, 2026-07-16). PR #12 (nhắc thông minh, ② M3) — **PHẠM VI ĐÃ
  CHỐT VỚI NGƯỜI DÙNG (2026-07-16): chỉ làm phần NỘI DUNG xoay theo ngữ cảnh, KHÔNG làm "giờ
  nhắc thông minh"** (server tự chọn giờ gửi cần thêm tracking GIỜ hoạt động — `daily_usage`
  hiện chỉ có NGÀY — là đổi schema/thêm theo dõi, người dùng chọn không làm). Đã làm:
  `api/_lib/reminderContent.ts` (mới, hàm thuần) — `pickReminderMessage()` chọn 1 trong 5 mức
  ưu tiên: streak sắp mất (loss-aversion mạnh nhất) → SRS đến hạn → gần đạt mục tiêu tuần (còn
  đúng 1 ngày) → đang tham gia challenge (giữ nguyên) → chung chung (fallback cũ); `computeStreakAtRisk`/
  `computeWeeklyDaysDone` tính từ `daily_usage` 14 ngày gần nhất (không vé nghỉ streak — ước
  lượng nới tay chỉ để chọn nội dung, không phải số hiển thị chính thức). `api/push.ts`
  `sendReminders()` gọi các hàm này (Supabase query mới: `daily_usage` mở rộng 14 ngày +
  `learning_progress.srs`/`weekly_goal`), fail-open nếu lỗi. `api/_lib/date.ts` thêm
  `addDays`/`weekStartOf` (mirror `src/lib/date.ts`, đúng quy ước "api/\_lib không import từ
  src/lib" đã có từ trước). Giờ nhắc vẫn do người dùng tự chọn như cũ (`remind_hour`) — ĐÃ
  MERGE (PR #250, 2026-07-16). PR #13 (nút 👍/👎 + bảng `tutor_feedback`, ⑤ T3) — migration
  `0014` + `lib/tutorFeedback.ts` + nút vote cạnh mỗi khối "✅ Nhận xét" ở Chat.tsx/Speaking.tsx
  (👎 lưu `{userInput, aiFeedback}`, 👍 chỉ đổi UI không ghi DB, vote 1 lần/tin nhắn) — ĐÃ MERGE
  (PR #252, 2026-07-16). PR #14 (giải đấu tuần: migration + tính điểm tuần + `/api/leaderboard`,
  ② M5 phần 1/3) — migration `0015_league.sql` (cột `profiles.nickname`/`league_opt_in`,
  unique index không phân biệt hoa thường, khoá quyền ghi client như cột `plan` — chỉ server
  ghi được qua API mới); `api/_lib/leaderboard.ts` (hàm thuần: `currentWeekRange` tái dùng
  `weekStartOf` của `api/_lib/date.ts`, tính điểm tuần **1 điểm/lượt học từ-ôn SRS
  (`daily_usage.learn_count` — gộp chung vì app không tách 2 việc này thành 2 cột riêng) · 5
  điểm/phiên Chat-Viết-Nói · 15 điểm/challenge nộp**, `rankEntries` dense-rank, validate
  nickname 3-20 ký tự + lọc từ bậy cơ bản CHECK THEO TỪ NGUYÊN VẸN — tránh dương tính giả kiểu
  "Adam"/"Vladimir" chứa chuỗi con "dm"/"vl") + 24 unit test ca biên (tuần Thứ2/CN, cột null,
  đồng điểm, dương tính giả từ bậy). `api/leaderboard.ts` (mới, đăng ký ở `server.ts`): `GET`
  trả `{week, me, top}` (cache in-memory 5 phút theo tuần, chỉ tính điểm cho user đã opt-in);
  `POST {action:'set-nickname'|'opt-out'}` — trùng tên dựa vào unique index DB (bắt lỗi
  Postgres `23505` trả 409 thân thiện) thay vì tự query kiểm tra trước (tránh race condition).
  Điểm tính HOÀN TOÀN ở server từ dữ liệu server-side sẵn có (daily_usage/challenge_entries),
  client không gửi điểm lên (CLAUDE.md §4.2) — ĐÃ MERGE (PR #253, 2026-07-16). PR #15 (trang
  Giải đấu tuần + opt-in nickname, ② M5 phần 2/3) — thêm `LeagueSection` (mới,
  `src/components/LeagueSection.tsx`) vào NGAY trang `/challenge` hiện có thay vì tách route
  riêng (challenge = hoạt động ghi điểm cao nhất của giải, gộp chung 1 trang hợp lý hơn tách
  đôi — giữ đúng tinh thần "quay challenge vẫn dùng được không cần vào giải" của đặc tả): gọi
  `/api/leaderboard` qua `src/lib/leaderboardApi.ts` (mới) — chưa opt-in thì hiện ô nhập
  nickname + nút "Tham gia"; đã opt-in thì hiện hạng/điểm của mình + nút "Rời giải"; luôn hiện
  top bảng xếp hạng (kể cả chưa tham gia, để tạo động lực). Phát hiện qua E2E: nút "Thử lại"
  thiếu biến thể `theme-light:text-accent-800` → contrast 1.97 trên nền sáng (theme Blue
  sky/Pink), đã vá — bài học: MỌI màu `accent-400`/`red-400`... đặt trực tiếp trên nền
  `zinc-900` (tự đổi sáng/tối theo theme) đều phải kèm `theme-light:` tương ứng, không suy đoán
  từ các đoạn code khác trông giống — phải tự chạy `npx playwright test e2e/a11y.spec.ts` để
  bắt được lỗi này (không thấy qua build/lint/unit test). `vite.config.ts` thêm
  `/api/leaderboard` vào `API_ROUTES` (dev server proxy — thiếu dòng này thì trang gọi API mới
  sẽ 404 im lặng lúc `npm run dev`/E2E). ĐÃ MERGE (PR #254, 2026-07-16). **PR #16 KHÔNG CÒN VIỆC
  GÌ ĐỂ LÀM** (rà lại đặc tả sau khi #14+#15 merge, 2026-07-16): "gọn logic 30 ngày → chu kỳ
  tuần" đã xong ở PR #246, "huy hiệu M2" đã xong ở PR #247, và trang giải đấu ở PR #15 KHÔNG
  tách route riêng (gộp vào `/challenge` có sẵn) nên không có "đường cũ" nào cần redirect →
  ② M5/M5b (Giải đấu tuần) coi như ĐÃ XONG HẲN sau PR #14+#15, bỏ qua PR #16. **Tiếp theo:**
  PR #17 (Azure Pronunciation Assessment, ① G2 — người dùng đã chốt làm 2026-07-15) hoặc quay
  lại PR #10 (vá prompt theo eval) nếu có người chạy được baseline T1
  (`npm run eval:tutor -- --write-baseline`, cần key AI thật, sandbox không có). Cả 2 việc còn
  lại trong bảng ưu tiên đều cần MỘT bước của người dùng trước khi làm tiếp: PR #17 cần tự tạo
  `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` (chỉ cần lúc DEPLOY THẬT, code viết được ngay không
  cần key) — sandbox vẫn research pricing/API hiện hành trước khi code theo đúng KHUNG 3; PR
  #10 cần người có key AI chạy baseline trước.
- PR #17 (Azure Pronunciation Assessment — SERVER, ① Giai đoạn 2 phần 1/2): research-first
  (KHUNG 3) trước khi code — xác nhận lại free tier F0 (5h audio/tháng), REST API
  "recognition/conversation" (KHÔNG SDK), header `Pronunciation-Assessment` base64 JSON
  (`ReferenceText`/`GradingSystem`/`Granularity`/`Dimension`/`PhonemeAlphabet`), response
  `NBest[].PronunciationAssessment`/`Words[].Phonemes[]` — nguồn: Microsoft Learn + Q&A
  (link trong lịch sử chat phiên này). Migration `0016_pronounce_usage.sql` — cột
  `daily_usage.pronounce_count` + mở rộng danh sách cột hợp lệ của RPC
  `consume_usage`/`refund_usage` (0001/0004) — free 10/ngày, pro 100/ngày
  (`api/_lib/usage.ts` thêm mode `'pronounce'`, `src/types.ts` LIMITS đồng bộ). Thư viện mới
  `api/_lib/azurePronounce.ts`: hàm THUẦN `parseAzurePronounceResponse` (parse response Azure
  → shape rút gọn `{overall,accuracy,fluency,completeness,words:[{word,score,errorType,
phonemes:[{phoneme,score}]}]}` — chọn `PhonemeAlphabet:'IPA'` thay mặc định SAPI để khớp ký
  hiệu IPA đã có sẵn trong `src/data/pronunciationTraps.ts`, PR client sau map thẳng không cần
  bảng chuyển đổi) tách riêng khỏi `assessPronunciation` (gọi mạng) để test bằng fixture, không
  cần key thật — 12 test. Handler `api/pronounce-assess.ts` (đăng ký `server.ts` + parser JSON
  riêng 5MB do audio base64 lớn hơn giới hạn mặc định 64kb, giống `/api/stt`; `vite.config.ts`
  API_ROUTES cho dev) — chưa cấu hình `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` → 503
  `{fallback:true}` NGAY, KHÔNG trừ lượt (client PR sau tự rơi về Giai đoạn 1 miễn phí); lỗi
  Azure sau khi đã trừ lượt → hoàn lượt (đúng nguyên tắc "đường đi của tiền" của `/api/claude`)
  — 9 test. **Tác dụng phụ phát hiện được khi làm việc này:** `isUsageMode()` (dùng để validate
  `mode` gửi lên `/api/claude`) trước đó chấp nhận CẢ `'stt'` (và giờ sẽ chấp nhận cả
  `'pronounce'` nếu không sửa) — cho phép client gửi `mode:'stt'`/`'pronounce'` lên
  `/api/claude` để đếm nhầm sang cột khác, né giới hạn chat. Đã vá: `api/ai.ts` giờ dùng
  `CHAT_ENDPOINT_MODES` riêng (chỉ `chat`/`writing`/`speaking`) thay vì tái dùng `isUsageMode`
  dùng chung — thêm 5 test ca biên (`mode` lạ/số/null đều rơi về `'chat'`). **Chưa làm ở PR
  này (để PR sau):** client WAV convert (`src/lib/wav.ts`) + UI điểm âm vị chi tiết + fallback
  Giai đoạn 1 khi hết lượt/lỗi/chiều B. ĐÃ MERGE (PR #255, 2026-07-16). PR #17 phần 2/2
  (client): `src/lib/wav.ts` — hàm THUẦN `toMonoPcm16kHz` (downmix nhiều kênh + resample nội
  suy tuyến tính) + `encodeWavPcm16` (đóng gói header RIFF/WAVE/fmt/data 44 byte + PCM16) tách
  khỏi `blobToWav16kMono` (wrapper gọi `AudioContext.decodeAudioData` — CHỈ chạy được ở trình
  duyệt thật, không test bằng vitest/jsdom) — 10 test cho 2 hàm thuần (mono passthrough,
  downmix stereo, upsample/downsample đúng tỉ lệ, clamp biên độ, lượng tử hoá đúng int16).
  `src/lib/audioRecorder.ts` (mới, KHÔNG dùng lại `challengeRecorder.ts` — module đó gắn chặt
  hằng số/luồng dành cho Challenge quay video 180s, dùng chung sẽ lẫn ngữ nghĩa): ghi âm
  NGẮN chỉ-âm-thanh, trần mặc định 15s, cùng kiểu mã lỗi permission/unsupported như
  `challengeRecorder.ts` để nhất quán. `src/lib/pronounceAssessApi.ts`: convert WAV rồi gọi
  `/api/pronounce-assess`, phân biệt `fallback:true` (chưa cấu hình/hết lượt → nên rơi về
  Giai đoạn 1) với lỗi cứng (audio hỏng/mạng lỗi → báo thử lại) — 6 test (mock `blobToWav16kMono`
  - `fetch`). UI: `src/components/DetailedPronunciationCheck.tsx` (mới) — nút "Chấm chi tiết
    bằng AI (beta)" ghi âm → chấm → hiện overall/accuracy/fluency/completeness + chip màu theo
    điểm từng từ (bấm để xem từng âm vị, cùng ngưỡng màu 85/65/40 với `pronounceFeedback` của
    Giai đoạn 1 cho nhất quán cảm nhận) — nối vào `PronunciationCheck.tsx`, CHỈ hiện khi
    `lang==='en'` (Azure chưa hỗ trợ vi-VN). **Phát hiện qua E2E a11y (đã vá TRƯỚC KHI commit):**
    nút "Chấm chi tiết..." dùng `text-violet-300` không kèm `theme-light:` → lặp đúng lỗi contrast
    đã gặp ở PR #254 — lần này áp `theme-light:` cho MỌI màu cố định (violet/emerald/lime/amber/
    rose) ngay từ đầu thay vì để a11y test bắt sau. Đã tự xác nhận nút thực sự render trong DOM
    lúc quét (không phải quét "trúng" 1 trang không hiện component) trước khi tin cậy kết quả
    xanh. **Không tự map phoneme → tip tiếng Việt của bảng trap Giai đoạn 1** như đặc tả gốc dự
    kiến — Azure chấm theo `referenceText` mình cung cấp (không phải transcript độc lập như STT),
    nên logic "spoken khác target → tra bảng trap" của Giai đoạn 1 không áp dụng trực tiếp được;
    UI Giai đoạn 2 hiện điểm âm vị trực tiếp, việc map tip cụ thể để ngỏ cho đợt sau nếu cần. Code
    xong (build/typecheck/lint/size xanh, test 534/534, E2E 117/117 gồm quét a11y `/dictionary`
    xác nhận nút mới không vỡ contrast), chờ merge.
- **Quy tắc phân việc theo độ phức tạp** (CLAUDE.md mục 3, quyết định 2026-07-15): đọc đặc tả
  trước khi giao việc; việc phức tạp Opus tự làm, việc vừa giao subagent Sonnet, việc cơ học
  giao subagent Haiku — áp dụng cho mọi PR tiếp theo của mục trên.
- **Cải tiến sư phạm** (`docs/research/danh-gia-tien-trien-hoc-2026-07-07.md`, đề xuất A→H —
  bảng trạng thái trong tài liệu đó đã CŨ, rà lại 2026-07-16 theo việc thực đã merge): A (Sổ
  lỗi cá nhân) đã xong. B đã xong — nút "Luyện ngay N từ này bằng hội thoại" có sẵn ở màn
  batch-done (`StudyTabs.tsx`, `?words=`) TỪ TRƯỚC; PR #11 (M4) bổ sung lối vào từ Home. **C
  (sản xuất chủ động, gõ chính tả) + D (nghe hiểu) đã xong** — PR #248 (③ N3, tab "Nghe" ở
  trang cấp CEFR) làm đúng cả 2: "Chọn nghĩa" (D) + "Gõ lại"/dictation (C). **G (chấm phát âm
  cấp âm vị) đã xong** — PR #255/#256 (Azure Pronunciation Assessment, ① Giai đoạn 2). **E (ngữ
  pháp có vòng ôn lặp theo mastery) ĐÃ XONG (2026-07-16, "thêm tất cả" — người dùng chọn trộn
  vào tab Kiểm tra sẵn có thay vì làm màn ôn riêng)**: tận dụng LẠI engine SM-2 có sẵn
  (`src/lib/srs.ts`) thay vì viết engine mới — thêm 3 hàm mỏng `addGrammarToSRS`/
  `reviewGrammar`/`getDueGrammarLessonIds`, dùng tiền tố khoá `grammar:<lessonId>` để chia sẻ
  chung kho `srs_${uid}` với thẻ từ vựng mà KHÔNG đụng namespace (có test xác nhận 1 lessonId
  trùng tên 1 từ tiếng Anh vẫn tách biệt hoàn toàn 2 lịch ôn). `cefrProgress.ts`
  `markGrammarDone()` tự vào vòng ôn khi đánh dấu "đã học xong". `StudyTabs.tsx` `buildQuiz()`
  (tab Kiểm tra) nay ưu tiên chọn bài ngữ pháp ĐẾN HẠN trước (hết bài due mới rơi về ngẫu
  nhiên như cũ); trả lời đúng/sai tự suy ra đánh giá 'good'/'again' cập nhật lịch ôn tiếp theo
  (không hỏi người dùng tự chấm như thẻ từ vựng). `CefrLevelPage.tsx` thêm badge số đỏ trên
  tab "Kiểm tra" hiện số bài ngữ pháp đến hạn (cùng kiểu badge với tab "Ôn SRS"). Không cần
  bảng Supabase mới (đồng bộ qua `pushProgress` như mọi state SRS/grammar khác). 5 test mới
  (`srs.test.ts`), build/typecheck/lint/size xanh, test 551/551. **H (SM-2 → FSRS) ĐÃ XONG
  (2026-07-16, research-first theo KHUNG 3 trước — xem
  `docs/research/sm2-den-fsrs-2026-07-16.md`)**: thay ruột `src/lib/srs.ts` dùng thư viện
  `ts-fsrs@5.4.1` (FSRS-6, MIT, xác nhận field thật qua `node_modules/ts-fsrs/dist/index.d.ts`
  thay vì đoán) với `enable_short_term: false` (bỏ bước học theo PHÚT kiểu Anki mặc định, giữ
  đúng nhịp học theo NGÀY của app) — giữ NGUYÊN mọi chữ ký hàm public
  (`addToSRS`/`reviewWord`/`getDueWords`/`getSRSStats`/`getNextReview`/`getLeechWords`/
  `addToSRSKnown` + 3 hàm ngữ pháp ở trên) nên KHÔNG phải sửa `StudyTabs.tsx`/`Flashcard.tsx`/
  `Challenge.tsx`/`cefrProgress.ts`, áp dụng tự động cho CẢ từ vựng lẫn ngữ pháp (dùng chung 1
  engine từ đề xuất E). **Quyết định người dùng (2 điểm hỏi trước khi code):** làm NGAY + hướng
  chuyển đổi **"cắt hẳn, đặt lại từ New"** (khác khuyến nghị "chuyển dần" của tôi) — mọi thẻ SRS
  cũ (từ vựng + ngữ pháp) coi như học lại từ đầu, thực hiện tự nhiên qua đổi shape lưu
  `localStorage` (dữ liệu SM-2 cũ không còn khớp field mới). **Phát hiện qua test thật (không
  suy đoán công thức, chạy `node --input-type=module` trực tiếp `ts-fsrs` trước khi viết
  assertion):** `lapses` (leech/tab Từ khó) giờ chỉ tăng khi trượt SAU KHI đã học được — không
  tính lần trượt đầu tiên lúc thẻ còn mới (ngữ nghĩa hợp lý hơn SM-2 cũ); tie-break độ ưu tiên ôn
  đổi "ease thấp nhất" → "difficulty cao nhất" trước (cùng ý định: thẻ khó hơn ôn trước).
  **Bundle vượt ngân sách 5.71kB (116→121.71kB brotli, đo thật bằng `npm run size`)** — người
  dùng chọn nâng `.size-limit.json` lên 123kB thay vì huỷ, chấp nhận đổi ~5% bundle đầu lấy lợi
  ích giảm 20-30% lượt ôn. Build/typecheck/lint/format/size xanh, test 551/551. **F** (giữ
  chân) — streak freeze đã có từ trước; "tổng kết tuần" nay có thể coi là đã phủ một phần qua
  mục tiêu tuần (`weeklyGoal.ts`, PR #246) + màn ăn mừng, dù không phải 1 màn "tổng kết" riêng.
- **Gộp thẻ Home (2026-07-16, theo yêu cầu người dùng)**: 2 thẻ riêng "Các bài hội thoại mẫu"
  (`/lessons`) + "Các câu thông dụng" (`/phrases`) gộp thành 1 thẻ "Hội thoại và các câu thông
  dụng" (`src/pages/Home.tsx`), dùng lại đúng kiểu thẻ "group" đã có sẵn cho thẻ gia sư AI (1
  header + nút con) — sửa `ModeCard` type + render để chấp nhận lưới 2 HOẶC 3 nút con (trước
  chỉ cứng `grid-cols-3`). Khối "💡 Mẹo" (gợi ý bắt đầu từ Câu thông dụng rồi sang Luyện nói)
  chuyển từ đứng riêng ở CUỐI trang Home vào NGAY trong thẻ gộp này (field `showTip` mới trên
  kiểu `group`). Thêm i18n `dialoguesPhrasesTitleA/B`, `dialoguesPhrasesDescA/B`,
  `tagDialoguesPhrases` (cả 2 ngôn ngữ giao diện, giữ nguyên các key cũ vì `Lessons.tsx`/
  `CommonPhrases.tsx` không đổi, 2 trang đó vẫn còn nguyên). Build/typecheck/lint/size xanh,
  test 551/551, E2E 117/117 (a11y Home cả 4 theme).
- **Gộp tiếp thành nút "Nghe" trong thẻ gia sư AI (2026-07-16, theo yêu cầu người dùng)**: thẻ
  "Hội thoại và các câu thông dụng" ở trên bị XÓA hẳn — gộp thành 1 nút con "Nghe" (icon
  `Headphones`) NGAY trong thẻ "Học cùng gia sư AI" (nay 4 nút: Nghe · Chat · Nói · Viết, lưới
  2×2). **Quyết định người dùng khi hỏi trước khi code:** bấm "Nghe" mở 1 màn chọn nhỏ (modal,
  style giống hộp chọn giờ nhắc học ở `QuickActions.tsx`) cho chọn tiếp "Các bài hội thoại mẫu"
  (`/lessons`) hay "Các câu thông dụng" (`/phrases`), KHÔNG vào thẳng 1 trang cố định. State
  `showListenPicker` mới trong `Home.tsx`; sub-item "Nghe" dùng path giả `LISTEN_PICKER_PATH`
  để phân biệt với nav() bình thường trong `onClick` chung của mọi nút con nhóm. Khối "💡 Mẹo"
  đổi chữ tham chiếu "Câu thông dụng" → "Nghe" cho khớp nút mới (`tipPhrases`). Xóa hẳn các key
  i18n `dialoguesPhrasesTitleA/B`/`dialoguesPhrasesDescA/B`/`tagDialoguesPhrases` (không còn
  dùng ở đâu, xác nhận bằng grep trước khi xóa) — thêm `listen`/`listenDescA/B`/
  `listenPickerTitle`. Đã tự xác nhận bằng Playwright chụp ảnh thật (không chỉ đọc code): thẻ
  gộp hiện đúng 4 nút, bấm "Nghe" mở đúng modal 2 lựa chọn. Build/typecheck/lint/format/size
  xanh, test 551/551, E2E a11y Home 8/8 (cả 4 theme, không lỗi mới).
- **Bổ sung dạng biến thể từ điển** (`docs/research/bo-sung-dang-bien-the-tu-dien.md`) — **Bước
  2 + Bước 4 ĐÃ XONG (2026-07-16, "thêm tất cả")**:
  - **Bước 2 (gắn `base`)**: rà toàn bộ `IRREGULAR_VERBS`/`IRREGULAR_PLURALS`/
    `IRREGULAR_COMPARATIVES` (`src/data/irregularForms.ts`) so với từ điển, có kiểm tra **khớp
    pos** trước khi động vào (phát hiện vài từ đồng âm khác nghĩa mà từ điển chỉ lưu 1 nghĩa —
    vd "bear" chỉ có nghĩa danh từ "con gấu" dù bảng động từ bất quy tắc có "bear→borne"; tương
    tự "ring/spring/speed/dream/mistake" chỉ có nghĩa danh từ, "echo" chỉ có nghĩa động từ dù
    bảng số nhiều bất quy tắc kỳ vọng danh từ — **14 dạng bị BỎ QUA có chủ đích** vì lệch pos,
    không tự suy đoán/gộp nghĩa). 138 entry ĐÃ CÓ trong từ điển được gắn thêm `base` (vd
    went/gone→go, children→child, better/best→good). 95 entry CÒN THIẾU hẳn (64 dạng động từ +
    31 số nhiều bất quy tắc, vd hid/geese/appendices) được soạn tay theo đúng quy ước có sẵn
    (`vi`: "đã... (quá khứ/phân từ của X)" hoặc "những... (số nhiều của X)") và thêm vào 10 file
    `public/data/dictionary/chunk-*.json` (round-robin, tổng 12.073→12.168 từ) — `pos`/`level`
    lấy nguyên từ entry gốc, `ipa_vi` KHÔNG tự bịa mà tái dùng đúng phiên âm đã xác minh của
    "đã"/"những" (mọi `vi` mới đều cố tình bắt đầu bằng 1 trong 2 từ này). **7 dạng bị bỏ qua**
    vì từ gốc còn thiếu hẳn trong từ điển (louse/elf/parenthesis/fungus/memorandum/vertex/
    torpedo) — để dành đợt bổ sung từ điển sau. ~~**Nợ kỹ thuật MỚI phát hiện (chưa sửa)**:
    entry "played" có trường `forms` tự tham chiếu vô nghĩa~~ **ĐÃ TRẢ XONG (2026-07-17, xem
    mục "Dọn forms rác từ điển" bên dưới)**.
  - **Bước 4 (search hiểu biến thể)**: `src/lib/dictionaryApi.ts` xây `formsIndexCache` (dạng
    biến thể QUY TẮC từ trường `forms` đã tính sẵn → từ gốc) 1 lần rồi tái dùng; `searchDictionary`
    trả thêm `matchedForm` khi query khớp đúng 1 dạng KHÔNG có entry riêng (vd "books"/"played")
    và bản thân query đó CHƯA PHẢI 1 headword thật (tránh gợi ý nhầm khi 1 dạng biến thể trùng
    với 1 từ độc lập khác, có test riêng cho ca này). `src/pages/Dictionary.tsx` hiện dòng gợi ý
    `"books" là 1 dạng của "book"` ngay trên dải chip lọc loại từ. 7 test mới
    (`src/lib/dictionaryApi.test.ts`, mock `loadDictionary`). Build/typecheck/lint/size xanh,
    test 546/546. **Chưa xác nhận được qua trình duyệt thật** (môi trường phiên này không có
    `.env`/khoá Supabase nên `/dictionary` không load được để chạy Playwright sống) — đã bù bằng
    kiểm tra JSON hợp lệ + đếm entry đúng 12.168 bằng script + 7 unit test bao phủ đủ ca biên.
- **Dọn forms rác từ điển (2026-07-17, trả nợ kỹ thuật "played" ở trên — rà TOÀN BỘ 12.168
  entry)**: 3 lớp rác cùng gốc rễ (script `gen-word-forms.ts` tin quy tắc mù quáng):
  - **194 entry là dạng chia QUY TẮC của từ khác** (played/buying/goes/has/is/causes… + danh từ
    gentlemen/pajamas) từng bị coi như từ gốc → sinh forms chồng đuôi ("playedded"). Sửa TRONG
    generator (idempotent, chạy lại không tái nhiễm): thêm lượt 1 lập chỉ mục "dạng chia → từ
    gốc" (kể cả dạng chia ĐỘNG TỪ GIẢ ĐỊNH cho danh từ/tính từ gốc — bắt "displayed" dù
    "display" mang pos n; ưu tiên từ gốc là động từ thật nên "does"→do chứ không →doe); lượt 2
    bỏ forms + gắn `base` trỏ về từ gốc cho các entry này (194 base mới — search/UI "Xem từ
    gốc" dùng được ngay). Guard chống bắt oan: không đụng động từ bất quy tắc GỐC (feed ← fee),
    không tính khoá comparative ("flatter" động từ ≠ so sánh của flat), danh từ gerund
    (building/meeting) giữ nguyên số nhiều hợp lệ.
  - **Tính từ phân từ đuôi -ied** (fried/dried) bị sinh "frieder/friedest" → chặn trong
    `comparativeForms` ("red" 1 âm tiết thật vẫn có redder/reddest).
  - **Số nhiều vô nghĩa/SAI NGHĨA cho danh từ đặc biệt** — nặng nhất `corps→"corpses"` (= xác
    chết!), axis→"axises", oasis→"oasises", alumnus→"alumnuses", tennis→"tennises",
    sunglasses→"sunglasseses", jesus→"jesuses"… Bổ sung danh sách ngoại lệ ở
    `src/data/irregularForms.ts`: 10 bất quy tắc Hy Lạp/Latin (axes/oases/emphases/alumni/
    genera…), 8 bất biến (corps/chassis/headquarters/offspring…), 16 không đếm được (bệnh/môn
    chơi: diabetes/tennis/chess…), 29 chỉ-có-số-nhiều (sunglasses/amenities + số nhiều mà SỐ ÍT
    chưa có entry: cubs/lads/babes…), và set MỚI `NO_PLURAL_NOUNS` (danh từ riêng/ký hiệu:
    jesus/gps/les… — không chia, không hiện gì).
  - **Quyết định kèm theo**: entry biến thể (có `base`) bị LOẠI khỏi bộ chọn từ của vòng học
    (`gen-cefr-c1c2-vocab.ts` + `gen-a1b2-extra-vocab.ts` thêm filter `!e.base`) — biến thể để
    TRA CỨU, không thành thẻ học riêng (tránh trùng thẻ "played"/"goes" với thẻ play/go trong
    SRS; ~324 thẻ biến thể rút khỏi vòng A1-B2, 5 khỏi C1/C2). Tiến độ người học KHÔNG mất —
    lưu theo TỪ (`et_learned_`), vòng chỉ là suy diễn. Đã tái sinh chuỗi dữ liệu đủ thứ tự:
    dictionary → cefrC1C2Vocab → cefrA1B2ExtraVocab → curriculum.json → learn → form-examples.
  - Xác minh: quét script không còn chuỗi rác ở MỌI file data; Playwright sống trên
    `/dictionary` (5 kịch bản: "played" hiện nút Xem từ gốc, "books" gợi ý dạng của book,
    "playeds" hết gợi ý rác, "corps" hiện "corps (không đổi)", "axis"→axes + "sunglasses" không
    chip số nhiều). 9 unit test mới (`wordForms.test.ts`). ~~**Nợ nhỏ còn lại**: số nhiều kiểu
    "smokings/computings" của gerund không đếm được~~ **ĐÃ TRẢ (2026-07-17, xem mục ngay dưới)**.
- **Dọn nợ gerund plural (2026-07-17, tiếp nối mục "Dọn forms rác từ điển" ở trên)**: rà tay 206
  ứng viên danh từ đuôi "-ing" có `forms.plural` — LOẠI các từ không thật sự là gerund (king,
  ring, spring, thing, morning, darling, duckling, pudding… trùng đuôi ngẫu nhiên, không liên
  quan động từ, số nhiều vốn đúng) và các gerund CÓ số nhiều hợp lệ theo ngữ cảnh riêng
  (findings/warnings/meetings/buildings/trainings/hostings/mailings/sailings/bearings… — CỐ Ý
  không đụng, tiếng Anh thật sự dùng số nhiều những từ này). Chỉ chặn **62 từ có độ tin cậy
  cao**: thể thao/sở thích/lĩnh vực hoạt động thuần túy KHÔNG BAO GIỜ chia số nhiều trong tiếng
  Anh chuẩn (smoking, computing, swimming, boxing, camping, jogging, hiking, cycling, gambling,
  gardening, marketing, parking, shopping, wrestling… đủ 62 từ, xem `src/data/irregularForms.ts`
  → `UNCOUNTABLE_NOUNS`). Thêm vào set có sẵn (không tạo type mới) — tái sinh đủ chuỗi dữ liệu.
  Xác minh diff: ĐÚNG 62 entry đổi `forms` (plural→uncountable), không tác dụng phụ. 3 unit test
  mới (`wordForms.test.ts`) + Playwright sống trên `/dictionary` (smoking/computing/swimming
  hiện "không đếm được"; meeting/building VẪN giữ số nhiều — xác nhận không chặn oan). Build/
  typecheck/lint/format/size xanh, test 556/556, E2E 117/117.
- Gamification: **V-4 (mốc + huy hiệu) đã xong** (PR #8/#247, `src/data/achievements.ts`) và
  **V-5 (Home "Hôm nay") đã xong** (PR #11/#249, comeback + gợi ý luyện nói) — dòng cũ ghi
  "chưa làm" đã LỖI THỜI. **V-6 (âm UI) ĐÃ XONG (2026-07-16, người dùng chọn "thêm tất cả"
  3 việc còn lại):** `src/lib/sound.ts` (mới) — tổng hợp beep bằng Web Audio API (oscillator),
  KHÔNG tải file audio nào ($0 chi phí); `sound.correct()`/`sound.wrong()` (nốt cao/trầm ngắn)
  gọi cặp với `haptics.success()`/nhánh rung sai đã có sẵn ở mọi nơi chấm đúng/sai (quiz trắc
  nghiệm × 3 chỗ trong `StudyTabs.tsx`, dictation, đánh giá SRS, `Flashcard.tsx`, nộp
  `Challenge.tsx`); `sound.milestone()` (hợp âm 3 nốt tăng dần) gọi trong `Celebration.tsx`
  (dùng chung cho màn ăn mừng streak/mục tiêu tuần/huy hiệu/tuần trọn vẹn — không cần sửa
  từng nơi gọi `<Celebration>`). Toggle bật/tắt ở `/profile` (`isSoundEnabled`/
  `setSoundEnabled`, mặc định BẬT, tự phát thử 1 tiếng khi bật) — 5 test cho phần thuần
  (bật/tắt + xác nhận không bao giờ throw kể cả khi jsdom không có `AudioContext`, đúng nhánh
  "trình duyệt không hỗ trợ" thật). E2E a11y `/profile` + `/learning-path/a1` (nơi
  `StudyTabs`/`Flashcard` render) đều xanh ở cả 4 theme.
- Thanh toán Pro — **đóng, không làm** (xem "Quyết định quan trọng").

> ~~🔴 KHẨN CẤP — Auto deploy lỗi liên tục (thiếu `SUPABASE_DB_URL`, phát hiện 2026-07-15)~~
> **ĐÃ HẾT HIỆU LỰC (2026-07-20)** — production đã rời hẳn Supabase (Giai đoạn A→E), deploy
> giờ dùng `DATABASE_URL` (Postgres tự host) + `npm run migrate:pg`, không còn phụ thuộc
> `SUPABASE_DB_URL`. Xem `docs/migration-thoat-ly-supabase.md`.

## ⚠️ Cần làm tay (không cần PR)

- **Nâng cấp giọng TTS 14 giọng + gói VIP + admin cấu hình (nhánh
  `claude/chirp-3-hd-voice-upgrade-c06eds`, chưa merge — 2026-07-21):**
  1. `npm run migrate:pg` trên VPS để tạo bảng `app_settings`
     (`postgres/migrations/0001_app_settings.sql`).
  2. Thêm `ADMIN_EMAILS=donghanhcungban.org@gmail.com` vào `.env` VPS (xác thực trang
     `/admin-settings`, xem `api/_lib/adminAuth.ts`).
  3. **QUAN TRỌNG:** toàn bộ code nhánh này viết trong sandbox KHÔNG có `node_modules`
     cài sẵn nên CHƯA từng chạy `npm run build`/`typecheck`/`lint`/`test`/`test:e2e` thật —
     PHẢI chạy đủ cổng mục 8 CLAUDE.md trước khi merge/deploy, đừng tin chỉ vì đã review
     code bằng mắt.
- `SENTRY_DSN`/`VITE_SENTRY_DSN` — lấy miễn phí ở sentry.io, điền vào `.env` VPS, build lại +
  `pm2 restart` (code Sentry đã xong, hiện no-op).
- `GROQ_API_KEY` (hoặc `OPENAI_API_KEY`) trên VPS nếu chưa có — cần cho STT.
- `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` — TÙY CHỌN, chỉ cần khi muốn bật chấm phát âm chi
  tiết qua Azure (① Giai đoạn 2, PR #17). Tạo resource "Speech service" (free tier F0, 5h
  audio/tháng) ở Azure Portal → Keys and Endpoint, điền vào `.env` VPS. Thiếu 2 biến này thì
  `/api/pronounce-assess` tự trả lỗi "chưa cấu hình" (client rơi về Giai đoạn 1 miễn phí),
  KHÔNG làm vỡ app — không bắt buộc phải làm ngay.

## Quyết định quan trọng

- **Challenge 30 ngày → nhập vào Giải đấu tuần (2026-07-15, quyết định người dùng).** Khi làm
  M5/M5b của `docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md`: route `/challenge` thành
  trang Giải đấu tuần (redirect giữ link cũ), quay challenge = hoạt động ghi điểm (+15/ngày),
  bỏ khung 30 ngày chuyển chu kỳ tuần; dữ liệu `challenge_entries` + huy hiệu cũ giữ nguyên.
  **[Bổ sung 2026-07-15, làm cùng PR #7]** Người dùng yêu cầu "Challenge tính theo tuần luôn
  cho đồng bộ" (với mục tiêu tuần vừa làm) → phần "gọn challenge → chu kỳ tuần" (mục 16 bảng
  ưu tiên) ĐÃ LÀM NGAY, không đợi tới giải đấu (mục 14–15): bảng 7 ô Thứ 2→CN thay bảng 30 ô
  (dùng chung luật tuần `weekStartOf` của `lib/date.ts` với mục tiêu tuần), bỏ vé nghỉ/resume/
  restart/mốc 30 ngày, chủ đề xoay vòng theo tổng số bài đã nộp, tổng kết TUẦN vào Chủ nhật
  (so video đầu↔cuối tuần), ăn mừng "tuần trọn vẹn 7/7". Schema `challenge_entries` GIỮ NGUYÊN
  (cột `challenge_day`/`round` để nguyên — dữ liệu cũ không mất; prompt AI KHÔNG sửa để khỏi
  phải chạy lại eval). Phần bảng xếp hạng/điểm giải vẫn ở mục 14–15 như cũ.

- **Thanh toán Pro: KHÔNG làm (2026-07-11).** Dự án dùng miễn phí cho cộng đồng. Không tự đề
  xuất lại — chỉ mở khi người dùng chủ động báo.
- **Giữ nguyên phiên bản:** Tailwind 3, ESLint 8 (`.eslintrc.cjs`) — không nâng v4/flat config.
- **Bundle-size budget (`size-limit`) thay Lighthouse CI** — Lighthouse không đo được trong môi
  trường sandbox/CI hiện có (`NO_FCP` ở mọi cấu hình). Cân nhắc lại nếu có runner thật sau này.
- **Zod validate input** đã rollout xong toàn bộ `api/*.ts` (đợt cuối `ai.ts`, dùng Zod v4).
- **Nhiều phiên làm việc có thể chạy song song** trên cùng repo — kiểm tra PR đang mở trên
  GitHub trước khi bắt đầu 1 kế hoạch lớn đã có sẵn trong `docs/research/`, tránh trùng công sức.
- **Gộp mọi script audio cache về 1 file `scripts/seed-all.ts` (2026-07-20, theo yêu cầu người
  dùng).** Trước đó có 3 script rời: `seed-all.ts` (seed nội dung), `sync-storage-to-r2.ts`
  (đẩy audio local → R2), `verify-r2-sync.ts` (đối chiếu R2 thật + xoá local an toàn). Đã gộp
  2 script sau vào `seed-all.ts` dưới dạng menu "s"/"v" (tương tác) hoặc cờ
  `--sync-r2`/`--verify-r2` (CI/cron) — xóa hẳn 2 file cũ + 2 dòng `package.json`
  (`sync:r2`/`verify:r2`). Không đổi logic bên trong (copy nguyên hàm, chỉ đổi tên biến/hàm
  tránh trùng namespace) — chưa tự chạy được trong sandbox này (không cài `node_modules`) nên
  CHỈ xác nhận bằng: không trùng định danh (grep), ngoặc cân bằng toàn file, và `prettier
--write` parse thành công không lỗi cú pháp. Cập nhật `docs/seed-guide.md` mục 5+7 +
  `docs/migration-thoat-ly-supabase.md` bước 7 theo lệnh mới. **Việc người dùng cần làm:** SSH
  VPS, `git pull`, thử `STORAGE_DRIVER=r2 npm run seed:all -- --sync-r2 --dry-run` xác nhận
  chạy đúng trước khi tin tưởng hoàn toàn (chưa test bằng máy thật).

## Nợ kỹ thuật còn mở

- **PM2 cluster mode ĐÃ ROLLBACK về fork mode (2026-07-20, PR #285).** PR #283/#284 từng
  chuyển sang cluster mode (1 instance) + `wait_ready` để reload zero-downtime, nhưng khi
  chạy thật trên VPS, worker crash ngay khi khởi động MÀ KHÔNG in được log gì (lỗi tương
  thích giữa Node `cluster` module và cách nạp `server.ts` qua loader ESM `--import tsx`) →
  app down hẳn, phải rollback khẩn cấp. `ecosystem.config.cjs` đã về đúng cấu hình fork mode
  cũ (`script: './node_modules/.bin/tsx'`, không có `exec_mode`). **KHÔNG thử lại cluster
  mode nếu chưa tìm ra cách nạp TypeScript tương thích với Node cluster** (ví dụ: build sẵn
  ra JS thay vì chạy `.ts` trực tiếp, hoặc dùng `interpreter` trỏ thẳng vào binary tsx thay
  vì `node_args`). Đổi lại: reload có vài giây downtime như trước PR #283 (chấp nhận được).
- ~~**E2E `mockLogin` không còn khớp luồng đăng nhập thật**~~ **ĐÃ TRẢ XONG (PR #282,
  2026-07-20)** — `e2e/helpers/auth.ts` nay gieo đúng key Bearer token
  (`gsa_session_token_v1`) VÀ dùng `page.route()` chặn `GET /api/auth?action=me` trả profile
  giả. Dòng cũ ghi "chưa làm" đã lỗi thời (viết trước PR #282, xác nhận lại 2026-07-20 khi
  quét toàn diện nợ kỹ thuật).
- ~~**2 script deploy trùng lặp**~~ **ĐÃ GỘP (2026-07-20, người dùng xác nhận giữ
  `scripts/deploy.sh`)** — xóa hẳn `deploy.sh` gốc repo (kém đầy đủ hơn); `.github/workflows/
deploy.yml` không còn tự inline các bước, nay gọi thẳng `bash scripts/deploy.sh` (1 nguồn
  chân lý duy nhất cho cả thủ công lẫn tự động). Đã cập nhật mọi doc còn nhắc `deploy.sh` gốc
  (`docs/DEPLOY.md`, `docs/deploy-vps-ubuntu.md`, `DEPLOY_STEPS.md`, `CLAUDE.md`).
- Không còn hạng mục a11y/kiểm thử lớn nào mở. Xem "Tiếp theo" ở trên cho việc sản phẩm còn dở.
- `docs/research/thu-thach-vlog-30-ngay.md` dùng tên cũ "Vlog" (tính năng đã đổi tên thành
  "Challenge" — route `/challenge`, bảng `challenge_entries`) — tài liệu đó là ghi chép lịch sử
  tại thời điểm merge, cố ý giữ nguyên tên cũ, không phải lỗi.
