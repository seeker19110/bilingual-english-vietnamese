# refactor: PR-S4 — chia api/ theo trụ + gói subject-english + core-domains (2026-08-23)

**Bối cảnh:** bước S4 (đặc tả platform mục 3, platform-first), sau khi PR #626 (S3) merge.

**Đã làm:**

1. **Chia 91 handler (182 file kèm test) từ `api/` phẳng vào 8 nhóm theo trụ**: `core/`
   (profile, progress, history, usage-summary, push, chat, feedback) · `billing/` (checkout,
   payment-_, plan-_) · `admin/` (15 admin-* + analytics-summary) · `subjects/english/`
   (dictionary, pronunciation, pronounce-assess, tutor-feedback, challenge, echo-shadowing,
   acoustic/articulatory-phonetics, avatar-visemes) · `domains/` (career, work, startup,
   life) · `personal/` (18 handler Personal OS/companion) · `learning/` (12 handler công nghệ
   học đa môn) · `platform/` (21 còn lại: health, app-settings, gamification, realtime, tích
   hợp ngoài). \_*URL /api/\_ GIỮ NGUYÊN 100%\_\_ — routes.ts + API_ROUTES dev middleware + test
   gác route (quét đệ quy) cập nhật theo.
2. **Gói MỚI `@dhcb/subject-english`** (mảnh "logic môn" của khuôn môn học): cefrTagging,
   cefrjLookup, wordsCefrDataset, wordFreq, dictionaryData (+test) tách từ `api/_lib`.
3. **Gộp `core-domains`** (4 gói 1-file career/work/startup/life → 1 gói); **xoá
   `core-grading`** (1.355 dòng, 0 nơi dùng) + `core-config/env.ts`. Workspace 18 → 15 gói.
4. **3 type row admin về `core-contracts/adminViews.ts`** — hết frontend import xuyên tầng
   vào apps/server (handler re-export giữ tương thích).

**Cổng đã chạy:** typecheck ✅ · lint ✅ · build + size ✅ (JS 120.71/123 · CSS 15.75/16) ·
boot check ✅ · dev middleware ✅ · codemap cycles = 0 ✅ · test+coverage ✅.
