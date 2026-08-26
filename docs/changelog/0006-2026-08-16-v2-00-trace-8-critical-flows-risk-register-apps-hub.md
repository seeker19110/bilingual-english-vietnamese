# V2-00 — Trace 8 critical flows + risk register + apps/hub (2026-08-16, lượt 2)

Owner chọn hướng (a) đóng nốt V2-00 trước khi sang V2-01. Đã làm M1/S2 (trace 8 luồng end-to-end:
auth, chat, speaking, learning progress, SRS, payment/entitlement, admin mutation, notification —
mỗi luồng vẽ `client → route → handler → service/DB → response` bằng cách đọc trực tiếp
`server.ts` + handler liên quan) + M1/S3 (risk register 7 mục, mỗi mục có owner/state) + đọc kỹ
`apps/hub/` (kết luận: UI khung cho Wave D multi-subject, chưa có logic Wave A/B/C, không cần đụng
trong Wave A). M1/S4 (latency/cost production thật) còn mở — AI không có quyền SSH VPS, không tự
bịa số. Tài liệu: `docs/architecture-v2/V2-00-CRITICAL-FLOWS.md`; goal file cập nhật:
`docs/goals/v2-wave-a-architecture-boundaries.md` (M1/S2, M1/S3 → DONE; M1/S4 → WAITING).

**Phát hiện phụ, ĐÃ FIX ngay trong cùng PR (owner duyệt fix + chuyển M2 cùng lúc, 2026-08-16):**
`packages/core-billing/payment-webhook.ts` trước đó KHÔNG bọc `UPDATE payments SET status='paid'`

- `grantPlanDays()` trong 1 transaction Postgres — nếu `grantPlanDays()` lỗi sau khi đã set
  `status='paid'`, user mất tiền nhưng chưa được cấp gói, và SePay retry sau đó bị chặn bởi nhánh
  idempotent `status==='paid'` nên KHÔNG tự phục hồi được. Đã sửa: bọc `UPDATE payments` +
  `grantPlanDays()` + `UPDATE users.email_verified` trong 1 `withTransaction()`
  (`packages/core-db/transaction.ts`, có sẵn từ Phase 01); `grantPlanDays()`
  (`api/_lib/planGrant.ts`) nhận thêm tham số tuỳ chọn `runner: Pool | PoolClient` để chạy trong
  transaction của caller, mặc định vẫn dùng pool chung nên 6 nơi gọi khác (referral,
  admin-grant-plan, quests, trial, achievement rewards) giữ nguyên hành vi. Cập nhật
  `payment-webhook.test.ts` (mock `pool.connect()` trả về client giả); build ✅ typecheck ✅ lint 0
  cảnh báo ✅ test 3339/3339 ✅. Chi tiết: `docs/architecture-v2/V2-00-CRITICAL-FLOWS.md` mục "Risk
  register" #1 (đánh dấu FIXED).
