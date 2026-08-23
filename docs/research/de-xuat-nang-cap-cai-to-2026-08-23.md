# Đề xuất nâng cấp & cải tổ toàn diện — 2026-08-23

> Kết quả quét toàn dự án (4 lượt khảo sát song song: backend API, frontend, kiến trúc
> monorepo, nợ kỹ thuật/tài liệu). Đây là **bản đề xuất** — mọi cổng chuyển giai đoạn và quyết
> định chiến lược vẫn cần người dùng duyệt theo CLAUDE.md mục 3.

## 0. Số liệu nền (đo thật ngày 2026-08-23)

- ~1.171 file TS/TSX · ~200.000 dòng. `apps/english/src` 482 file / ~113k dòng · `packages/`
  (17 gói) 389 file / ~54k dòng · `api/` 240 file / ~32k dòng.
- 99 đường dẫn API được gắn trong `server.ts` (gắn thủ công 100%, 562 dòng).
- 79 route frontend (48 page thật), 83 bảng Postgres trên 7 schema, 59 file migration.
- CI: coverage sàn 90/90/90/90, e2e a11y 15 trang × 5 theme, size-limit 123 kB JS.
- Người dùng thật trong DB production: **18**. Hạ tầng: 1 VPS 3 vCPU / 3 GB RAM.

## 1. Chẩn đoán tổng quát

**Phần lõi (gia sư Anh ⇄ Việt 3 chế độ + CEFR/SRS + thanh toán + admin) là phần chín nhất và
có chất lượng kỹ thuật tốt**: coverage cao, cổng a11y nghiêm, đếm lượt AI có refund, cache TTS
có leader-lock, backup R2 hai chiều đã kiểm chứng. Loạt PR A→C vừa qua đang sửa đúng chỗ.

**Vấn đề lớn nhất không phải lỗi lẻ, mà là PHẠM VI**: tầng "Platform Vx / Companion / OS" đã
phình vượt xa MVP và phần lớn chưa "thật":

1. **33/48 API mở rộng không có persistence** — state nằm trong `Map` cấp module (mất khi
   restart, vỡ hoàn toàn trong PM2 cluster 3 instance vì mỗi process một bản copy). Ví dụ:
   `pvp-arena` (Elo hardcode 1250, trận tạo ở instance 1 thì instance 2 trả 404),
   `daily-quests`, `referral-vip`, `memory-palace`, `debate-arena`, `stem-scratchpad`…
2. **Dữ liệu giả hiển thị ngay trang chủ**: `ReferralVipBanner` ("bạn mời" cứng Huyền
   Trang/Quốc Bảo cho mọi user) và `DailyQuestsCard` (quest in-memory reset mỗi restart) render
   ở `Home.tsx`/`EnglishHome.tsx`/`Practice.tsx`, mâu thuẫn với hệ referral/quest THẬT đang chạy
   ở `/profile` và `/nhiem-vu`.
3. **5 đường gọi AI trả tiền KHÔNG đếm lượt, phần lớn không rate-limit**: `/api/gemini-live`
   (WS realtime, tốn nhất), `/api/companion` (dùng đúng model trả phí của `/api/agent` nhưng
   né toàn bộ hạn mức — user free chat vô hạn), `/api/vision-solve`, `/api/ambient-vision`,
   `/api/co-learning-audio`. Dashboard chi phí admin vì thế **thấp hơn chi phí thật**.
4. **Hai lộ trình kiến trúc chạy song song** (45-phase "English Tutor OS" và V2 Wave A→F),
   không rõ nguồn chân lý; 993 dòng tài liệu scale 50k–1 triệu user chưa có số đo thật nào
   (k6 chưa từng chạy). Bằng chứng hệ quả: 8 service "Platform Vx" chết hoàn toàn vừa bị xoá
   (PR #621, 2.115 dòng) dù coverage 90–100%.
5. **Workspace monorepo là "giả"**: khai `workspaces` nhưng 17 gói `packages/*` và
   `apps/english` đều KHÔNG có `package.json`; import bằng đường dẫn tương đối sâu 5 cấp;
   `index.html`/`vite.config.ts`/`tsconfig.json` gốc vẫn đóng vai app english ngầm.

## 2. Phát hiện chi tiết theo mảng

### 2.1. Bảo mật & tiền bạc (nghiêm trọng nhất)

| #   | Phát hiện                                                                                                                                                | Vị trí                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| B1  | 3 handler gọi `validateAuth()` rồi bỏ qua kết quả null → mọi khách vãng lai dùng chung khoá `'u-default'`/`'guest-learner'`, đọc/ghi đè dữ liệu của nhau | `api/daily-quests.ts:23`, `api/pvp-arena.ts:28`, `api/referral-vip.ts:20`                                            |
| B2  | `/api/health/deep` không auth, không rate-limit, lộ pool stats, RSS/heap, `STORAGE_DRIVER`, thông báo lỗi DB                                             | `api/healthDeep.ts`                                                                                                  |
| B3  | 5 đường AI không đếm lượt (mục 1.3); 21 handler không rate-limit                                                                                         | `api/gemini-live.ts`, `api/companion.ts`, `api/vision-solve.ts`, `api/ambient-vision.ts`, `api/co-learning-audio.ts` |
| B4  | `ecosystem.config.cjs` **không có `REDIS_URL`** → rate-limit rơi về `Map` in-memory, hạn mức lỏng ×3 trong cluster (kể cả 5 req/phút của `/api/agent`)   | `ecosystem.config.cjs`                                                                                               |
| B5  | Scheduler chạy ở CẢ 3 instance, không guard `NODE_APP_INSTANCE === '0'` → push/email nhắc học gửi 3 lần/người, `downgradeExpiredPlans()` chạy 3 lần      | `server.ts` (`startReminderScheduler`, `startPlanExpiryScheduler`)                                                   |
| B6  | Trùng route `/api/vision-solve` đăng ký 2 lần (body limit khác nhau); `app.get('*')` trả HTML 200 cho `/api/xxx` gõ sai thay vì JSON 404                 | `server.ts:171,330,447`                                                                                              |

### 2.2. Hệ thống song song / trùng lặp

| Cặp          | Bản THẬT (giữ)                                                  | Bản VỎ (gộp/xoá)                                             |
| ------------ | --------------------------------------------------------------- | ------------------------------------------------------------ |
| Referral     | `api/referral.ts` + bảng `public.referrals` + `ReferralSection` | `api/referral-vip.ts` (Map) + `ReferralVip/*`                |
| Quest        | `api/quests.ts` + bảng `public.quest_claims` + `QuestsPanel`    | `api/daily-quests.ts` (Map) + `DailyQuestsCard`              |
| Leaderboard  | `api/leaderboard.ts` + `LeagueSection`                          | `getWeeklyLeaderboard()` hardcode trong `pvpArenaService.ts` |
| Streak       | `lib/storage.ts getStreak()` (từ `daily_usage`)                 | 4 bộ streak in-memory riêng ở pvp/quests/proactive/life      |
| Sync tiến độ | `progressSync.ts` (merge union)                                 | chồng lấn với `cloud.ts`, 2 hàng đợi offline riêng           |

### 2.3. Code chết / rác

- 49 shim `apps/english/src/pages/*.tsx` (re-export 2 dòng, không ai gọi) + 3 barrel `index.ts`
  mồ côi (hại tree-shaking).
- `packages/core-grading/` **1.355 dòng, 0 nơi import** (engine chấm STEM viết trước).
- 11/72 file `core-contracts` chỉ có test, chưa implementation nào tiêu thụ.
- 2 test không có file nguồn: `packages/core-personal/companionStream.test.ts`,
  `api/_lib/voiceTierParity.test.ts` (file sau còn import ngược `apps/english` — vi phạm boundary).
- 3 bảng DB chết: `public.entitlements`, `public.weekly_ai_credit`, `english.user_profile`.
- 2 cặp migration TRÙNG SỐ: `0026_achievement_rewards` / `0026_price_promo` và
  `0027_payments_years` / `0027_reserved_names`.
- 3 vòng import trong cụm SRS frontend (gốc: `srsTypes.ts` import ngược `srs.ts`).
- `apps/hub` (1.646 dòng) được build trong CI nhưng Nginx trỏ mọi domain vào `dist/` của app
  english — artifact không có đường vào.
- ~21 script one-off trong `scripts/` không còn tham chiếu.
- Dead code: `AudioCoLearningRoomModal.tsx` (350 dòng), `core-config/env.ts`.

### 2.4. Dữ liệu người dùng có rủi ro

- **Sổ tay lỗi sai `et_mistakes_${uid}` CHỈ nằm localStorage** — không bảng DB, không endpoint,
  dù là "tài liệu ôn giá trị nhất và độc nhất của từng người" (comment trong `lib/mistakes.ts`).
  Đổi máy/xoá cache là mất sạch. Là dữ liệu học duy nhất còn 100% localStorage.
- `LifeWheel.tsx` nút "Lưu" chỉ hiện toast, không ghi đi đâu.

### 2.5. Quy trình / tài liệu

- Gate coverage `quality` **không phải required status check** → từng fail liên tục trên `main`
  (branches 89.23%) mà vẫn merge được — mâu thuẫn CLAUDE.md mục 13.
- 2 việc treo bắt buộc theo CLAUDE.md mục 8: chưa chạy `eval:tutor` sau khi đổi model Groq mặc
  định và sau khi sửa prompt Speaking chiều B (cần máy có AI key).
- AUDIT.md lệch số thật (ghi coverage 93/89/96/93 — thật 90/90/90/90; CSS 11 kB — thật 16 kB);
  CHANGELOG.md là tài liệu chết; PROGRESS.md phình 4.607 dòng; tên "việc quyết định lớn #4"
  không được ghi tường minh ở đâu.
- CI thiếu gate: `npm audit`, `codemap -- cycles`.
- Nợ treo khác: Gemini Live chưa chạy phiên thật nào; chưa audit các file V6.x/V7.0 còn lại
  cùng commit `cf44362` (cùng loại lỗi sinh ra 8 service chết); Redis rate-limit chưa kiểm
  chứng đa tiến trình trên VPS; giá `openai/gpt-oss-120b` chưa điền vào registry → mọi số USD
  telemetry đang sai.

## 3. Đề xuất cải tổ — theo thứ tự ưu tiên

### N0 — Hai quyết định chiến lược (CẦN NGƯỜI DÙNG CHỐT trước khi làm tiếp)

**Q1. Chốt phạm vi sản phẩm.** Khuyến nghị: **quay về lõi gia sư ngôn ngữ**, đóng băng tầng
Platform Vx chưa có persistence. Cụ thể cho từng tính năng nhóm (c) chọn 1 trong 3:

- **Giữ & làm thật** (cần bảng Postgres + đếm lượt + test): chỉ nên chọn cho thứ người dùng
  thật đang dùng.
- **Ẩn khỏi UI, giữ code** (feature flag tắt): chi phí thấp, tránh dữ liệu giả lộ ra.
- **Xoá hẳn** (như đã làm với 8 service PR #621): cho phần chắc chắn không dùng.

Bằng chứng ủng hộ: 8 service chết vừa xoá; 33 API in-memory sẽ VỠ ngay khi có 2 user thật dùng
cùng lúc qua 2 instance; mỗi dòng code "vỏ" đều đang trả phí bảo trì (coverage, a11y, review).

**Q2. Chốt MỘT lộ trình kiến trúc.** Khuyến nghị: đóng băng cả `docs/MASTER_SPEC.md` (45
phase) lẫn V2 Wave thành tài liệu tham khảo (như đã làm `ENGLISH_TUTOR_OS_V1_FROZEN.md`);
nguồn chân lý duy nhất là `PROGRESS.md` + backlog ngắn 1–2 quý. Tài liệu scale 50k–1M giữ
nguyên nhưng gắn nhãn "chưa kích hoạt — cần số đo k6 thật trước".

### N1 — Vá an toàn & tiền bạc (làm NGAY, trước cả PR D; 2 PR nhỏ)

1. Thêm `checkAndConsumeUsage` + rate-limit cho 5 đường AI chưa đếm lượt (hoặc tắt endpoint
   nếu Q1 quyết định ẩn tính năng đó — rẻ hơn).
2. `api/healthDeep.ts`: gate admin (hoặc chặn ở Nginx, chỉ cho localhost).
3. B1: 3 handler `'u-default'` → trả 401 khi không có auth thật.
4. Thêm `REDIS_URL` vào `ecosystem.config.cjs`; guard scheduler bằng
   `NODE_APP_INSTANCE === '0'` (hết push ×3).
5. Gỡ `ReferralVipBanner` + `DailyQuestsCard` khỏi `Home`/`EnglishHome`/`Practice` (hết dữ
   liệu giả trang chủ) — độc lập với Q1, làm được ngay.
6. Sửa trùng route `/api/vision-solve`; `/api/*` không khớp trả JSON 404.

### N2 — Dọn rác cơ học (1 PR lớn hoặc 2–3 PR nhỏ, rủi ro thấp)

- Xoá 49 shim + 3 barrel + `AudioCoLearningRoomModal` + `core-config/env.ts` + 2 test mồ côi.
- Sửa 2 cặp migration trùng số (đổi thành 0058/0059, giữ nội dung).
- Cắt vòng `srsTypes.ts → srs.ts` (tách type thuần ra).
- Drop 3 bảng chết (migration riêng, có rollback).
- Archive ~21 script one-off vào `scripts/archive/`; thêm `scripts/*.ts` vào `ENTRY_POINTS`
  của codemap (hết false-positive orphan).
- `core-grading`: xoá khỏi nhánh chính (giữ trong lịch sử git, khôi phục khi làm STEM thật).
- `apps/hub`: bỏ khỏi `npm run build` cho tới khi có cấu hình Nginx thật (hoặc cấu hình luôn
  nếu muốn dùng — việc tay trên VPS).

### N3 — Hợp nhất hệ song song (sau khi Q1 chốt)

- Referral: giữ hệ thật, xoá `referral-vip` (đúng "việc quyết định lớn #1" đã duyệt).
- Quest: giữ `quests` thật; nếu muốn giữ UX "nhiệm vụ ngày" của DailyQuests thì nối vào
  `quest_claims`, không giữ 2 hệ.
- Leaderboard/streak: một nguồn số duy nhất từ Postgres.
- **Sync Sổ tay lỗi sai lên server**: thêm cột vào `learning_progress`, tái dùng cơ chế merge
  sẵn có của `progressSync.ts`. (Ưu tiên cao — dữ liệu người dùng thật.)
- Elo + Memory Palace ra Postgres nếu Q1 giữ PvP/Palace ("việc quyết định lớn #2");
  ẩn telemetry USD + điền giá model thật ("việc #3").

### N4 — Củng cố nền kiến trúc (làm dần, mỗi bước 1 PR)

1. `package.json` thật cho 17 gói + `apps/english` (tên `@dhcb/*`, `exports`), đổi import sâu
   sang tên gói; chuyển `index.html`/`vite.config.ts`/`tailwind.config.js` từ gốc vào
   `apps/english/` (đối xứng với hub). ~2–3 ngày, trả dứt di sản tiền-monorepo.
2. Tách `api/` phẳng 87 file thành `api/{admin,english,personal,domains}/`; tách logic English
   trong `api/_lib/` (cefr\*, dictionary, wordFreq, viseme…) ra `packages/core-english/`.
3. Gỡ 3 chỗ frontend import type thẳng từ handler + import `core-ai`/`core-billing` — chuyển
   type về `core-contracts`; thêm lint rule chặn boundary.
4. Đo token thật thay `aiCost.ts` ước lượng/lượt; đưa TTS/companion/vision vào dashboard chi
   phí admin.

### N5 — Quy trình & tài liệu

- Bật `quality` + `e2e` làm **required status check** (việc tay trên GitHub Settings).
- Thêm gate CI: `npm audit --omit=dev` và `codemap -- cycles` (ngưỡng 0).
- Chạy tay `npm run eval:tutor` (máy có key) đóng 2 món treo; dán bảng so baseline.
- Đồng bộ AUDIT.md về số thật + thêm tầng audit mới "đối chiếu đồ thị import thật" (bài học
  8 service chết); khai tử hoặc tự động hoá CHANGELOG.md; nén PROGRESS.md (chuyển mục đã đóng
  sang `docs/archive/progress-2026H1.md`); ghi tên chính thức "việc quyết định lớn #4".
- Audit các file V6.x/V7.0 còn lại cùng commit `cf44362` tìm scaffolding giả.

## 4. Trình tự đề xuất (ghép với loạt PR A→G đang dở)

| Bước | Nội dung                                                  | Ghi chú                             |
| ---- | --------------------------------------------------------- | ----------------------------------- |
| 1    | **N0**: người dùng chốt Q1 + Q2                           | quyết định, không cần code          |
| 2    | **N1** (2 PR): vá tiền/bảo mật + gỡ dữ liệu giả trang chủ | chèn TRƯỚC PR D vì rủi ro tiền thật |
| 3    | **N2** (1–3 PR): dọn rác cơ học                           | giảm ~55 file + 1.355 dòng chết     |
| 4    | PR D → E (Speaking/Writing UX) như kế hoạch cũ            | lõi sản phẩm                        |
| 5    | **N3** (2–3 PR): hợp nhất referral/quest, sync mistakes   | gồm 3 "việc quyết định lớn" còn lại |
| 6    | PR F → G (hiệu năng CEFR, đánh bóng UX)                   | lõi sản phẩm                        |
| 7    | **N4** (3–4 PR): workspace thật, tách api/, core-english  | nền cho môn học thứ 2               |
| 8    | **N5**: gate CI + đồng bộ tài liệu                        | rải kèm các bước trên               |

Nguyên tắc xuyên suốt: **không thêm tính năng "Platform" mới cho tới khi mọi tính năng đang
hiển thị đều chạy thật** (persistence + đếm lượt + đúng trong cluster).

## 5. Việc KHÔNG đề xuất làm

- KHÔNG nâng React 18 / TS 5.2 / Tailwind 3 / ESLint 8 (chủ đích giữ, CLAUDE.md mục 6). Nâng
  `eslint-plugin-react-hooks` v7 + vitest 4 để riêng, chỉ làm khi rảnh tay (đã có ghi chú nợ).
- KHÔNG đầu tư thêm hạ tầng scale (PgBouncer, Redis cluster, multi-VPS) khi chưa có số đo k6
  thật và chưa vượt ~1.000 concurrent.
- KHÔNG viết thêm contract/spec "viết trước chờ dùng" — 11 contract mồ côi hiện có là đủ
  bài học.
