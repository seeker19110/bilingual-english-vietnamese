# fix+feat: bổ sung tiêu chuẩn còn thiếu — vá tiền/bảo mật N1 + nền persistence + gate CI (2026-08-23)

**Bối cảnh:** người dùng yêu cầu "bổ sung các tiêu chuẩn còn thiếu chưa đạt" (mục 5 đặc tả
platform) rồi tạo PR merge. Làm trong PR này:

**B — Vá tiền & bảo mật (đề xuất N1, toàn bộ B1→B6):**

1. **B3 — 5 đường AI trả tiền giờ ĐẾM LƯỢT + rate-limit đủ**: `/api/companion` trừ mode
   `chat` (+refund khi provider lỗi, cả nhánh stream lẫn thường); `/api/vision-solve` +
   `/api/ambient-vision` trừ `chat` + refund; `/api/gemini-live` thêm rate-limit 10/phút +
   trừ 1 lượt `speaking` mỗi phiên (đường AI đắt nhất, trước đây không hàng rào nào);
   `/api/co-learning-audio` thêm rate-limit 30/phút.
2. **B1 — bỏ fallback `'u-default'`/`'guest-learner'`** ở daily-quests/pvp-arena/referral-vip
   → 401 thật (trước: mọi khách vãng lai đọc/ghi chung một bucket dữ liệu).
3. **B2 — `/api/health/deep`**: công khai chỉ còn `{status, timestamp}` + đúng mã 200/503
   (uptime monitor vẫn dùng được); chi tiết nội bộ (pool stats, RSS/heap, driver, lỗi DB)
   CHỈ trả cho admin; thêm rate-limit 30/phút.
4. **B5 — scheduler chỉ chạy ở instance 0** (`NODE_APP_INSTANCE`): hết cảnh push/email nhắc
   học gửi 3 lần/người và `downgradeExpiredPlans()` chạy 3 lần trong PM2 cluster.
5. **B6 — server.ts**: bỏ đăng ký trùng `/api/vision-solve`; `/api/*` không khớp trả JSON
   404 thay vì rơi vào catch-all SPA trả HTML 200.

**Nền persistence (mở màn N3 — 33 API in-memory, 12-factor stateless):**

6. Migration **`0058_platform_feature_state.sql`**: bảng `platform.feature_state`
   (user_id, feature, state JSONB, PK (user_id, feature)) + helper
   `packages/core-db/featureState.ts` (get/set upsert, có test). Là backing service chung
   thay các `Map` in-memory.
7. **Chuyển lô đầu 5 handler nhóm B** (state theo user, giữ lâu dài) sang `feature_state`:
   memory-palace, metacognitive-reflection, neural-curriculum, action-canvas,
   avatar-embodiment — hết mất dữ liệu khi restart, hết vỡ PM2 cluster.
   **Phân loại phần còn lại** (ghi để lô sau): nhóm A (trùng hệ thật → GỘP/XOÁ, không
   persist: daily-quests, referral-vip, leaderboard giả PvP — việc quyết định #1); nhóm C
   (state phiên tạm: trận PvP, phòng audio, debate, realtime session, telemetry cache →
   chuyển shared store khi tính năng làm thật, hoặc ẩn theo Q1 từng tính năng).

**Gate CI mới (N5):** `npm audit --omit=dev` (0 lỗ hổng production deps) + `codemap cycles`
= 0 — thêm vào job `quality`.

**Chốt Q2 — MỘT lộ trình duy nhất:** nguồn thi hành = `PROGRESS.md` + đặc tả platform;
`docs/MASTER_SPEC.md` giữ vai trò tầm nhìn; `docs/phases/00..45` + `docs/architecture-v2/`
gắn banner THAM KHẢO (không phải backlog đang chạy). CLAUDE.md mục 2 cập nhật theo.

**Việc tay còn lại cho người dùng (ngoài khả năng AI):** bật `quality` + `e2e` làm
**required status check** trên GitHub Settings → Branches (hiện coverage đỏ vẫn merge được);
chạy `npm run migrate:pg` sẽ tự chạy trong deploy.sh.
