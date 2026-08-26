# feat+refactor: N3 — hợp nhất hệ trùng + PvP hết hardcode + ẩn telemetry USD (2026-08-23)

**Bối cảnh:** 3 "việc quyết định lớn" còn lại (đã người dùng duyệt từ kế hoạch 7 PR A→G) +
nhóm N3 của đề xuất nâng cấp, làm sau khi lộ trình cải tổ S1→S6 merge xong (PR #628).

**Đã làm:**

1. **Hợp nhất referral (việc #1):** XOÁ hẳn hệ vỏ `referral-vip` (API + service + contract +
   `components/ReferralVip/` + lib; 10 file) — hệ THẬT `referral.ts` + `ReferralSection`
   (bảng `public.referrals`) giữ nguyên. Gỡ banner dữ liệu giả ("Huyền Trang/Quốc Bảo") khỏi
   Home/EnglishHome/Practice.
2. **Hợp nhất quest:** XOÁ hệ vỏ `daily-quests` (API + service + contract + `DailyQuests/` +
   lib; 10 file) — hệ THẬT `quests.ts` + `QuestsPanel` (bảng `quest_claims`) giữ nguyên. Gỡ
   4 điểm gọi `updateQuestProgress` (StudyTabs, CefrLessonViews, PvPBattlefieldModal,
   Companion).
3. **PvP hết hardcode (việc #2):** hồ sơ Elo/thắng-thua + trận đấu (vs Ghost bot) lưu
   `platform.feature_state` (`pvp_profile`/`pvp_match`) — Elo cập nhật THẬT K=32 sau mỗi
   trận, server-authoritative (bỏ tin `body.playerProfile` từ client); **leaderboard giả
   "Nguyen Hoang Long/Elena Vu" XOÁ khỏi service** — thay bằng truy vấn thật top 10 Elo từ
   feature_state + tên từ `profiles.nickname`/`users.name`. Trận sống qua restart + đúng
   trong PM2 cluster. (Memory Palace đã ra Postgres từ PR #625.)
4. **Ẩn telemetry USD (việc #3):** gỡ `RealtimeCostTelemetryBadge` khỏi thanh telemetry
   Companion; MeshHealthMonitorModal + AgentOrchestrator hiển thị tokens thay vì số USD
   (số USD là ước tính nội bộ sai lệch — chỉ admin xem qua admin-usage-stats).

**Còn lại của nhóm C (ghi cho lô sau, không quên):** state phiên multi-user realtime
(phòng co-learning-audio, WS gemini-live/chat khi thiếu REDIS_URL, mesh-telemetry session,
debate/stem/agent-orchestrator session) — cần shared store (Redis/bảng riêng) khi các tính
năng này được dùng thật; WS connection-scoped state là chấp nhận được về kỹ thuật.

**Cổng đã chạy:** typecheck ✅ · lint ✅ · build + size ✅ (JS 120.62/123 · CSS 15.7/16 —
nhẹ đi nhờ xoá 2 hệ vỏ) · boot check + xác nhận `/api/daily-quests` trả 404 ✅ ·
test+coverage ✅ (số ở commit/PR).
