# feat: N4 — đo chi phí AI theo TOKEN THẬT + cảnh báo ngân sách (2026-08-23)

**Bối cảnh:** mục còn lại cuối cùng thuộc phần AI làm được của đặc tả platform mục 5.5
("Sentry đã có; thiếu uptime monitor + alert chi phí AI theo token thật"), sau khi N3 (PR #629)
merge và lộ trình S1→S6 hoàn tất.

**Vấn đề đã xác minh trong code trước khi làm:**

- `packages/core-ai/aiCost.ts` chỉ ƯỚC TÍNH `số lượt × đơn giá cố định` — chính chú thích đầu
  file thừa nhận "KHÔNG đo token thật". Sai lệch khi prompt dài/ngắn, không biết
  provider/model nào ngốn tiền.
- `packages/core-ai/capabilityCostTracker.ts` (231 dòng, có bảng giá thật + chiết khấu cache)
  MỒ CÔI — 0 nơi import.
- Cả 3 provider đều ĐÃ trả token thật trong response mà ta đang vứt đi: Groq `usage`,
  Anthropic `usage` (kèm cache read/write), Gemini `usageMetadata`.

**Đã làm:**

1. **Migration `0059_ai_token_usage_daily.sql`** — bảng `platform.ai_token_usage_daily` cộng
   dồn theo khoá (ngày giờ VN, provider, model, mode). CỐ Ý không log per-call: quy mô hiện
   tại chỉ cần trả lời "ngày X, model Y, chế độ M tốn bao nhiêu"; bảng cũng KHÔNG có
   `user_id` (số liệu vận hành gộp, không phải nhật ký hành vi cá nhân).
2. **`packages/core-ai/aiTokenUsage.ts`** — parser usage cho 3 provider + `recordAiTokenUsage()`
   upsert cộng dồn, quy USD bằng `calculateCostUsd()` của `capabilityCostTracker` (gói mồ côi
   nay có người dùng thật). **Bất biến: đo đạc KHÔNG được làm hỏng lượt trả lời** — hàm ghi
   nuốt mọi lỗi (DB sập/chưa migrate → chỉ log cảnh báo), caller gọi `void` không await.
   Anthropic báo `cache_read/creation_input_tokens` TÁCH KHỎI `input_tokens` → parser cộng lại
   để `promptTokens` là tổng đầu vào thật, đúng như `calculateCostUsd()` mong đợi.
3. **Provider trả kèm token:** `chatProviders.ts` thêm `usage` + `model` vào kết quả
   `success` của Groq (`model` là model THỰC SỰ dùng — bể model có thể xoay vòng, lấy
   `GROQ_CHAT_MODEL` sẽ tính nhầm bảng giá); `geminiApi.ts` thêm tham số tuỳ chọn `onUsage`
   (callback thay vì đổi kiểu trả về → 3 nơi gọi `callGemini()` giữ nguyên không sửa).
4. **Ghi nhận ở 2 đường AI trả tiền:** `/api/agent` (`ai.ts` — cả 3 nhánh Groq/Anthropic/
   Gemini, Anthropic chỉ ghi khi status 2xx, Gemini ghi cả nhánh lỗi vì đã bị tính tiền
   token) và `companionRuntime.ts` (mode `companion`, tách khỏi lượt gia sư trong dashboard).
5. **Cảnh báo ngân sách:** `AI_DAILY_BUDGET_USD` (bỏ trống = không cảnh báo) — vượt ngưỡng
   ghi log `error` MỘT lần/ngày/tiến trình, không spam mỗi lượt.
6. **Dashboard admin:** `/api/admin-usage-stats` thêm khối `tokenCost` (tổng + chia theo
   provider/model/mode + ngưỡng ngân sách); `AdminUsagePanel` thêm thẻ "Chi phí AI đo THẬT
   theo token" đặt CẠNH số ước tính cũ kèm tỉ lệ lệch — để biết có nên chỉnh `AI_COST_*_USD`.

**Giới hạn đã biết (ghi để không hiểu nhầm số liệu):** chỉ đo đường CHAT (gia sư + Bạn Đồng
Hành). TTS/STT/chấm phát âm tính theo ký tự/giờ audio chứ không theo token — vẫn dùng ước
tính cũ; thẻ admin ghi rõ điều này. Uptime monitor (nửa còn lại của mục 5.5) chưa làm — cần
dịch vụ ngoài (UptimeRobot…), là việc tay của người dùng.

**Nợ phát hiện lúc làm (không sửa trong PR này — ngoài phạm vi, ghi lại để không quên):**

- ~~Bảng liệt kê migration trong `postgres/migrations/README.md` dừng ở `0043`~~ **ĐÃ XỬ LÝ** —
  xem mục "docs(migrations): bổ sung 19 dòng thiếu" ngay dưới.
- ~~`npm run build` sinh lại 131 file `apps/dhcb/public/data/stories/*.json` làm bẩn cây git~~
  **ĐÃ XỬ LÝ** — xem mục "fix(build): build/format không còn làm bẩn cây git" ngay dưới.

**Spec:** `docs/specs/2026-08-23-ai-token-cost-observability.md` (viết BÙ sau khi code, do cổng
CI `metadata` chặn PR `feat:` không có liên kết `docs/specs/` — bài học quy trình ghi ở mục 9
của spec: lộ trình lớn nằm ở `docs/research/` nhưng cổng chỉ nhận `docs/specs/`, hai thư mục
chưa nối với nhau).

**Cổng đã chạy:** `npm ci` (node_modules đang lệch lockfile — TS 6.0.2 vs `^5.2.2`, đúng dấu
hiệu CLAUDE.md mục 8 cảnh báo) · typecheck ✅ · lint ✅ · test ✅ (số ở commit/PR).
