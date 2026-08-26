# chore(audit): audit toàn diện 2026-08-25 + vá 6/7 phát hiện

**Yêu cầu người dùng:** "audit toàn diện" → sau đó "vá toàn bộ".

**Audit** chạy đủ theo `docs/framework/QUY-TRINH-AUDIT.md` (thứ tự 1 → 1b → 2 → 2b → 3 → 4 → 5 →
6 → 6b → 8 → 9 → 10 → 11 → bổ sung → 7). Số đo thật:

- Tầng 1: build/typecheck/lint/format xanh · test **5359/5359** (434 file) · bundle JS
  **122,65/123 kB (99,7%)** · CSS 15,64/16 kB (97,8%).
- Tầng 1b: **3/3 lượt** `npm test` xanh, cùng số test → không có flaky.
- Tầng 2/2b: 0 secret hardcode · `npm audit --omit=dev` **0 lỗ hổng** · OWASP 12/14 (2 mục
  thiếu = F4). Mọi endpoint không `validateAuth` đều là GET công khai hoặc webhook có HMAC.
- Tầng 3: 0 `any` · 0 chu trình import · 0 file mồ côi THẬT · 3 cặp migration trùng số
  (`0026`/`0027`/`0059`) nhưng **không cặp nào chạm cùng bảng** → nợ quy ước, không chặn.
- Tầng 5: coverage 93,36 / **90,13** / 96,50 / 93,36 (sàn 90) · E2E **424/424 xanh**, 17 spec
  (gồm đủ 5 spec a11y A/AA + AAA).
- Tầng 10: đo 400.000 lượt phép trộn → `25,04 | 24,90 | 24,96 | 25,10%` (lệch ≤ 0,10 điểm).
- Tầng 11: DB rỗng → **68/68** migration exit 0 → 104 bảng / 10 schema; lượt 2 lũy đẳng;
  `/api/health` 200 và `/api/health/deep` "healthy".
- **Tầng 8 + 9 KHÔNG kiểm được** (ghi trống, không chấm đạt): proxy container chặn
  `en-vi.donghanhcungban.org` (403 CONNECT). Cần chạy Lighthouse + đọc Sentry/PM2 từ máy thật.

**Đã vá 6/7 phát hiện** (F1 cần key AI thật nên còn mở):

| #   | Việc                                                                                                        | Cách vá                                                                                                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F2  | Dấu xung đột merge sót ở `PROGRESS.md` (từ commit `cf44362`, 2026-08-21)                                    | Xoá dòng mồ côi (đã kiểm: chỉ dòng đóng bị sót, `<<<<<<<`/`=======` đã giải đúng → KHÔNG mất nội dung). Thêm cổng `scripts/check-conflict-markers.sh` vào `.husky/pre-commit`                  |
| F3  | Ngân sách bundle + coverage gần cạn mà cổng chỉ báo pass/fail                                               | Thêm `npm run budget` (`scripts/check-budget-margin.ts`): in biên độ còn lại, cảnh báo khi bundle ≥95% ngân sách hoặc coverage dư <1 điểm. Thêm reporter `json-summary` vào `vitest.config.ts` |
| F4  | `Permissions-Policy` vắng mặt hoàn toàn; HSTS chỉ có ở response API                                         | `PERMISSIONS_POLICY` + `HSTS_VALUE` khai báo MỘT chỗ (`packages/core-auth/security.ts`), dùng qua `applyCommonSecurityHeaders()` cho cả API/static/health. Thêm 3 test bất biến                |
| F5  | `nginx/en-vi.conf` CSP-Report-Only còn whitelist `*.supabase.co`                                            | Xoá hẳn — CSP nay chỉ có MỘT nguồn là Express                                                                                                                                                  |
| F6  | CLAUDE.md ghi "15 gói" (thật: 16), thiếu `subject-programming`, trỏ `scripts/gen-cefr-c1c2-vocab.ts` đã dời | Sửa đúng thực tế                                                                                                                                                                               |
| F7  | `referral.ts` sinh mã mời bằng `Math.random`                                                                | Đổi sang `crypto.randomInt` (thống nhất với `emailVerification.ts`/`sepay.ts`)                                                                                                                 |

**Phát hiện thêm khi vá:** `.size-limit.json` và `vite.config.ts` còn quy tắc chunk
`vendor-supabase` — chunk chết từ khi rời Supabase (glob không khớp file nào). Đã dọn cả hai.

**CÒN MỞ — F1 (chặn, cần bạn làm tay):** baseline `eval:tutor` đã cũ. Prompt/model sửa
**2026-08-24** (`gemini-2.0-flash` → `gemini-3.6-flash`, PR #647 — Google gỡ model cũ), baseline
**2026-08-21**, và model mới **chưa từng được xác nhận hoạt động**. Container audit không có
`.env` nên không chạy được. Chạy trên VPS: `npm run eval:tutor -- --write-baseline`.

**Vùng thiếu test đề xuất bổ sung** (nhánh chưa phủ nhiều nhất, đều là nhánh lỗi mạng/AI/DB):
`geminiLiveService.ts` (14) · `co-learning-audio.ts` (12) · `neuroAffectiveService.ts` (8) ·
`redisChat.ts` (8) · `socratic-diagnostics.ts` (7) · `socraticDiagnosticsService.ts` (7). Ưu tiên
`redisChat.ts` — nó chính là nợ kỹ thuật "smoke test chat real-time qua Redis đa tiến trình" đang
mở, nay có thêm bằng chứng định lượng.

**Cần bạn áp lên VPS:** `nginx/en-vi.conf` đã đổi trong repo nhưng chưa áp lên server thật
(`sudo nginx -t && sudo systemctl reload nginx` sau khi copy).
