# fix(ai): Google gỡ hẳn gemini-2.0-flash — vá 4 chỗ, phát hiện khi chạy eval:tutor (2026-08-24)

**Bối cảnh:** người dùng chạy `npm run eval:tutor` trên VPS (theo yêu cầu F3 của audit) để cập
nhật baseline. Toàn bộ 62/62 câu lỗi `404`: _"This model models/gemini-2.0-flash is no longer
available. Please update your code to use models/gemini-3.6-flash"_. **0 câu được chấm — không
có baseline nào sinh ra**, và (đã xác nhận) `writeFileSync` chỉ chạy khi có cờ `--write-baseline`
nên `docs/research/eval-tutor-baseline.md` KHÔNG bị ghi đè bởi dữ liệu rác này.

**Không phải lỗi cô lập trong 1 script — cùng model chết được gọi ở 4 chỗ:**

1. `packages/core-ai/aiConfig.ts` — `GEMINI_CHAT_MODEL` (fallback thứ 3 trong chat production
   thật sau Groq/Anthropic, xem `ai.ts`). Đây là rủi ro production thật: nếu Groq VÀ Anthropic
   cùng lúc rate-limit hoặc lỗi, chat rơi xuống Gemini và **cũng 404**.
2. `packages/core-ai/visionSolverService.ts` — tham số mặc định `model` cho tính năng giải bài
   tập bằng ảnh (STEM Vision Solver).
3. `packages/core-ai/ambientVisionService.ts` — model ghim cứng trong URL gọi API.
4. `scripts/eval-tutor.ts` — lỗi RIÊNG, không liên quan model chết: comment ghi thứ tự ưu tiên
   "Gemini → Groq → Anthropic" nhưng `ai.ts` đã đổi thành **"Groq → Anthropic → Gemini"** từ
   2026-08-06 (đúng đợt hạ Gemini xuống cuối). Script eval LỆCH khỏi production suốt từ đó — mọi
   lần chạy trước (nếu có) đo NHẦM provider so với cái người dùng thật gặp. Sửa cả comment lẫn
   thứ tự thật trong `providerLabel()`/`callProvider()`.

**Điều thú vị:** dự án ĐÃ BIẾT Gemini 2.0 Flash chết từ 2026-08-23 — comment trong
`packages/core-contracts/geminiLive.ts` ghi rõ _"dòng Gemini 2.0 Flash NGỪNG PHỤC VỤ 31/03/2026"_
và đã vá cho tính năng **Gemini Live** (đổi sang `gemini-3.1-flash-live-preview`). Nhưng bản vá
đó BỎ SÓT model **chat text** — đúng kiểu "sửa một nhánh, quên nhánh song song" mà audit hay bắt.

**Đã sửa theo đúng khuôn "vá khẩn cấp do nhà cung cấp gỡ model"** (tiền lệ đã có sẵn trong chính
`aiConfig.ts` khi Groq gỡ `llama-3.3-70b-versatile`, 2026-08-22): đổi mặc định sang
`gemini-3.6-flash` — tên model DUY NHẤT có bằng chứng, lấy trực tiếp từ thông báo lỗi thật của
Google trên tài khoản người dùng. **CHƯA verify được bằng key thật** (môi trường sửa lỗi không
có `GEMINI_API_KEY`) — cần người có key chạy `npm run eval:tutor -- --write-baseline` để xác
nhận chất lượng + ghi baseline thật, và thử tính năng Vision Solver/Ambient Vision một lượt tay.

**Không đụng:** `capabilityCostTracker.ts` (chỉ là bảng giá tra cứu theo tên model, không gọi
API — không hỏng) và 2 script chạy tay một lần (`eval-v2-final-audit.ts`, `tag-cefr-levels.ts`,
không phải đường production).

**Cổng:** build/typecheck/lint/format xanh · test 5120/5120 · `codemap impact` cho cả 4 file sửa:
mọi file bị ảnh hưởng đều nằm trong bộ test đang xanh.
