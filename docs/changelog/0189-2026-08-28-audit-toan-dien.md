# 0189 — Audit toàn diện (2026-08-28)

- **PR:** (điền khi tạo)
- **Ngày:** 2026-08-28
- **Loại:** audit định kỳ theo `docs/framework/QUY-TRINH-AUDIT.md` (11 tầng)
- **Nguyên tắc đã giữ:** audit là ĐỌC + BÁO CÁO — không sửa code trong lượt này.

## Báo cáo

```
=== BÁO CÁO AUDIT TOÀN DIỆN — 2026-08-28 (UTC) · nhánh claude/project-audit-ayvgom ===

TẦNG 1 — Cổng tự động
Build ✅ | Type ✅ (0 lỗi) | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (7580/7580, 499 file)
Size ✅ — Initial JS 124,83/140 kB (89,2% — dư 15,17 kB) · CSS 16,26/18 kB (90,3% — dư 1,74 kB)
Ghi chú: cả hai dưới mốc cảnh báo 95%. CSS mỏng hơn JS.
(Đã chạy `npm ci` trước — container mới, `node_modules` chưa có.)

TẦNG 1b — Test không ổn định (flaky)
Số lượt chạy: 3 | Xanh: 3/3 | Cùng số test cả 3 lượt (499 file / 7580 test) | 0 test đỏ ngẫu nhiên

TẦNG 2 — Bảo mật
Secret hardcode ✅ (0) | .env sạch ✅ (chỉ `.env.example`) | npm audit --omit=dev: 0 lỗ hổng
Kiểm quyền handler ✅ — 99/105 handler gọi `validateAuth`; 6 handler công khai:
  app-settings · plan-marketing · plan-features · plan-prices (đều có comment giải thích công khai
  CÓ CHỦ ĐÍCH), payment-webhook (xác thực bằng API key + `timingSafeEqual`), và
  learning/subjects.ts — ⚠️ handler duy nhất KHÔNG có comment giải thích vì sao công khai (F3).

TẦNG 2b — Checklist OWASP mở rộng
Dòng ❌: 0 — cả 14 mục đạt, có bằng chứng:
  1 SQLi: 1 query nối chuỗi duy nhất (`personErasureService.ts:347`) nhưng đã chặn bằng regex
    định danh `^[a-z_][a-z0-9_]*$` trước khi nối; `personId` vẫn qua `$1`.
  2 Command/Path: 0 (mọi `exec(` tìm được là `RegExp.exec`, không phải child_process)
  3 XSS: 0 `dangerouslySetInnerHTML` | 6 Token: 0 chỗ log token/password
  10 CORS: whitelist rõ trong production, `*` chỉ ở dev | 13 stack leak: 0
  14 Secret ở client: 0 (`process.env.` ngoài `VITE_*` trong apps/dhcb+hub = 0)
  9 Headers: CSP + frame-ancestors + X-Frame + X-Content-Type-Options + Referrer-Policy +
    Strict-Transport-Security + Permissions-Policy — đủ 7, đều ở `apps/server/src/routes.ts`

TẦNG 3 — Vệ sinh code
console.log rác ✅ | TODO/FIXME ✅ | any lọt lưới ✅ — cả 3 con số thô đều cao (289/35/3) nhưng
  100% nằm trong NỘI DUNG BÀI HỌC `packages/subject-programming/lessons/*` (code mẫu và starter
  code cho học viên) + log khởi động có chủ đích ở `server.ts`. Không có rác thật.
Chu trình import ✅ ("Không có chu trình import") | Code chết: 0 — 5 file `workers/*.ts` bị
  `orphans` báo là do nạp qua `new Worker(new URL(...))`; `scripts/red-team/eval-red-team.ts` có
  trong package.json (`eval:v2:red-team`). Script mồ côi: 0/… (mọi `scripts/*.ts` đều có trong
  package.json).
Đánh số migration: ⚠️ 3 số TRÙNG — 0026 (achievement_rewards / price_promo), 0027
  (payments_years / reserved_names), 0059 (ai_token_usage_daily / platform_vs_subject_profile).
  Đã kiểm từng cặp: KHÔNG cặp nào chạm chung bảng → nợ quy ước, không phải fail chặn (F4).

TẦNG 4 — Chất lượng AI
N/A — không cần chạy. Baseline `eval-tutor-baseline.md` ngày chạy **2026-08-26**, mới hơn lần đổi
nội dung prompt/model gần nhất (**2026-08-25**). Nợ #5 trong hook đầu phiên nói ngược lại → xem F1.

TẦNG 5 — Độ phủ test
5a Coverage ✅ — statements 95,28% · branches 90,56% · functions 95,34% · lines 95,28%
   (sàn cấu hình 90 cả 4). Biên độ mỏng nhất: **branches dư 0,56 điểm**. Không có ratchet ngược.
5b Vùng thiếu test (đề xuất, KHÔNG tự viết trong lượt audit): 9/105 handler API không có file
   test nào — `platform/a2a` · `personal/{intake,ambient-vision,neuro-affective,subconscious}` ·
   `learning/{memory-palace,metacognitive-reflection}` · `subjects/programming/ts-check` ·
   `admin/admin-intake-stats`. Sáu trong số đó đo được 0% coverage.
5c E2E + a11y: ❌ **3 đỏ / 634** (631 xanh, 16,7 phút) — cả 3 ở `e2e/programming-lesson.spec.ts`
   (bộ chạy JS / SQL / DOM chạy trong Web Worker), đều hết trọn 60s timeout chứ không sai nội dung.
   Phân loại: **flaky do tải, không phải lỗi sản phẩm** — chạy RIÊNG file đó: **29/29 xanh** trên
   cùng máy, cùng timeout. Cơ chế: 4 vCPU chia cho Vite + 2 worker Playwright song song + Web
   Worker tính toán nặng của chính bài học. CI đang che bằng `retries: 1` (F2).
   a11y: 0 vi phạm mới (A/AA và AAA đều xanh trong lượt này).

TẦNG 6 — Đối chiếu tài liệu & hạ tầng
Git: ahead 0 / behind 0 so với origin/main | Working tree ✅ sạch
Migration chưa áp: 0 (75 file, chuỗi chạy sạch — xem Tầng 11)
PROGRESS khớp thực tế ✅ (bản thân PROGRESS.md đã tự đính chính nợ #5 và nợ #6)

TẦNG 6b — Tài liệu ĐIỀU HÀNH có nói đúng thực tế
Hook `.claude/report-status.sh` ❌ — 3 khẳng định lạc hậu (F1)
Đường dẫn trong CLAUDE.md ❌ — 32 đường dẫn chết (F5)
CLAUDE.md nhắc đủ app/gói ✅ — 3 app (dhcb/hub/server) + 18 gói đều được nhắc

TẦNG 8 — Hiệu năng thực đo
N/A — proxy của container chặn `en-vi.donghanhcungban.org` (CONNECT tunnel 403), không đo
Lighthouse trên production được. Cần chạy tay.

TẦNG 9 — Vận hành production
N/A — cùng lý do trên, không truy cập được VPS/Sentry từ môi trường audit.

TẦNG 10 — Logic ngẫu nhiên & thống kê
Phép trộn Fisher–Yates ✅ — 0 chỗ dùng `sort(() => Math.random() - 0.5)`; nguồn duy nhất là
`packages/core-contracts/shuffle.ts`, được 7 chỗ dùng chung (StudyTabs, CefrLessonViews,
cefrExam, listening, Practice, pvpArenaService, neuralCurriculumService).
Bản trộn song song: 1 — `dictionaryApi.fetchRandomEntries` tự cài lấy mẫu không hoàn lại; đã đọc
kỹ, thuật toán ĐÚNG (đều), chỉ là trùng lặp nhẹ theo cờ đỏ R3.
Ngẫu nhiên bảo mật: ⚠️ 2 chỗ dùng `Math.random()` cho giá trị mang tính bảo mật (F6, F7).

TẦNG 11 — Đường CÀI MỚI & lũy đẳng migration
`schema.sql` + **75/75** migration trên DB rỗng ✅ (exit 0)
Lũy đẳng lần 2 ✅ ("Đã áp dụng đủ 75 migration lẻ — không có gì mới")
Boot `dist-server/server.js` + `/api/health` ✅ 200 · `/api/health/deep` ✅ "healthy"

--- ĐÃ RÀ VÀ KHÔNG CÓ LỖI (bằng chứng, không phải chỗ bỏ trống) ---
Secret hardcode · .env bị track · npm audit prod · SQLi · command/path injection · XSS ·
log token · CORS · stack leak · secret ở bundle client · security headers · CSRF (Bearer, không
cookie) · webhook idempotent + timingSafeEqual · chu trình import · code chết · script mồ côi ·
phép trộn lệch phân bố · đường cài mới từ DB rỗng · lũy đẳng migration.
```

## Phát hiện (7)

| #      | Mức           | Nội dung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F1** | 🔴 Cao        | `.claude/report-status.sh` ghi 3 điều SAI mà chính PROGRESS.md đã đính chính: (a) nợ #5 "baseline eval:tutor vẫn là bản 2026-08-21" — thật ra baseline chạy 2026-08-26, MỚI HƠN lần đổi prompt 2026-08-25; (b) nợ #6 "nginx/en-vi.conf CHƯA áp lên VPS" — PROGRESS.md:2818 ghi ĐÃ áp 2026-08-26; (c) số đo nợ #7 lệch (coverage branches 90,17% → thực đo 90,56%; JS 124,03 → 124,83; CSS 15,87 → 16,26). Đây là dòng chữ MỌI phiên đọc đầu tiên.                                                                                                                                |
| **F2** | 🟠 Trung bình | 3 test E2E của bộ chạy code trong Web Worker đỏ khi chạy full suite, xanh 29/29 khi chạy riêng. CI che bằng `retries: 1` nên không ai thấy. Vá đúng: nới timeout cho riêng 3 test đó hoặc `test.describe.configure({ mode: 'serial' })`, KHÔNG sửa code sản phẩm.                                                                                                                                                                                                                                                                                                                |
| **F3** | 🟡 Thấp       | `apps/server/src/api/learning/subjects.ts` là handler công khai duy nhất KHÔNG có comment giải thích vì sao không cần `validateAuth` (5 handler công khai còn lại đều có). Tầng 2 đòi hỏi comment này.                                                                                                                                                                                                                                                                                                                                                                           |
| **F4** | 🟡 Thấp       | 3 cặp migration trùng số (0026, 0027, 0059). Không cặp nào chạm chung bảng nên thứ tự không rủi ro — nợ quy ước, ghi nhận chứ chưa cần đổi số.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **F5** | 🟠 Trung bình | **32 đường dẫn chết trong CLAUDE.md** (`api/stt.ts`, `api/_lib/*`, `lib/auth.ts`, `src/lib/*`, `src/pages/*`, `src/server.ts`…) — di tích trước đợt cải tổ sang `apps/dhcb/` + `apps/server/`. Kèm 2 mô tả lạc hậu ở mục 13: "Supabase Auth đã chạy thật" và "cache … trên Supabase Storage" (thật ra Postgres tự host + Cloudflare R2, đúng như chính mục 6 của file mô tả).                                                                                                                                                                                                    |
| **F6** | 🟠 Trung bình | `packages/core-personal/companionLinkService.ts:47` sinh **mã mời "Người thân theo dõi"** bằng `Math.random()`. Comment ngay trên đó lập luận "12 ký tự trên bộ 31 ≈ 59 bit, đoán mò không tới được" — lập luận entropy đó KHÔNG áp dụng cho `Math.random()` (xorshift128+ của V8 suy được trạng thái, không phải nguồn mật mã). Mã này mở quyền XEM tiến độ học của người khác. Ba nơi cùng loại trong repo (`emailVerification.ts`, `sepay.ts`, `referral.ts`) đều đã dùng `crypto.randomInt` và có comment nói rõ "KHÔNG dùng Math.random cho mã bảo mật" — chỗ này lọt lưới. |
| **F7** | 🟡 Thấp       | `packages/core-ui/clientAuth.ts:236` sinh tham số `state` của OAuth Google bằng `Math.random().toString(36)`. `state` là chống CSRF cho luồng đăng nhập — nên dùng `crypto.getRandomValues`.                                                                                                                                                                                                                                                                                                                                                                                     |

## Phân loại việc

- **AI tự làm được:** F1 (sửa hook), F2 (nới timeout/serial cho 3 test), F3 (thêm comment), F5 (sửa 32 đường dẫn + 2 mô tả Supabase lạc hậu), F6 + F7 (đổi sang `crypto`).
- **Cần người dùng:** Tầng 8 (Lighthouse trên production) và Tầng 9 (Sentry/PM2/ổ đĩa trên VPS) — proxy container chặn domain production, không đo được từ đây.

## Kết luận

**Cần xử lý** — không có fail chặn ở Tầng 1–2 (mọi cổng xanh, 0 lỗ hổng, kiểm quyền đủ), nhưng 7
phát hiện trên nên vá, ưu tiên F1 (tài liệu điều hành sai làm lệch mọi phiên sau) và F6 (mã mở
quyền xem dữ liệu người khác sinh bằng nguồn ngẫu nhiên không an toàn).
