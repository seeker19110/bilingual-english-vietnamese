# fix: GROQ_API_KEY nhiều key cách nhau dấu phẩy gửi sai làm Bearer token (2026-08-22)

Phát hiện qua chính tính năng "Trạng thái tính năng" (mục dưới) ngay sau khi deploy: production
đang có `GROQ_API_KEY=gsk_key1,gsk_key2` (2 key, ý định dùng dự phòng), nhưng TOÀN BỘ code thật
gọi Groq (`packages/core-ai/chatProviders.ts#callGroqChat`, `packages/core-ai/openaiStt.ts`) lấy
nguyên `process.env.GROQ_API_KEY` làm Bearer token — gửi cả dấu phẩy đi nên Groq trả 401 "Invalid
API Key" thật, nghĩa là **chat AI lẫn STT dùng Groq đã lỗi 100% trên production từ trước khi phát
hiện**, im lặng fallback sang Anthropic/OpenAI (nếu có cấu hình) hoặc lỗi hẳn nếu không.

Sửa: `packages/core-ai/groqKeyPool.ts` (mới) — tách `GROQ_API_KEY` thành bể nhiều key (dấu phẩy/
xuống dòng, giống cách `GOOGLE_TTS_API_KEYS` đã làm cho Google TTS), xoay vòng round-robin, tự
chuyển key kế tiếp khi lỗi DO CHÍNH key đó (401/429), lỗi khác (5xx, mạng...) trả ngay. Áp dụng ở
3 nơi:

- `chatProviders.ts`: thêm `callGroqChatWithKeyPool()` bọc ngoài `callGroqChat()` gốc (giữ
  nguyên `callGroqChat()` đơn key — không phá 34 test ghim hành vi fallback Groq→Anthropic→Gemini
  của `ai.ts`); `ai.ts` gọi hàm bọc thay vì hàm gốc.
- `openaiStt.ts`: `resolveProvider()` trả `apiKeys: string[]` (Groq nhiều key, OpenAI luôn 1),
  `transcribeAudio()` thử lần lượt.
- `api/_lib/featureStatusChecks.ts#checkGroq()`: thử lần lượt cả bể, chỉ báo `down` khi KHÔNG
  key nào dùng được (khớp hành vi thật, tránh báo lỗi giả khi còn key dự phòng sống).

Test mới: `groqKeyPool.test.ts` (9 ca) + bổ sung ca đa-key cho `chatProviders.test.ts`,
`openaiStt.test.ts`, `featureStatusChecks.test.ts`. Toàn bộ 5081 test (420 file) + typecheck +
lint + build đều xanh; coverage branches 90.02%.

**Việc tay còn lại**: `.env` trên VPS đã có 2 key Groq sẵn — không cần đổi gì thêm sau khi PR
này deploy (code giờ tự dùng đúng cả 2 key). Có thể xác nhận qua `/admin` tab "Sử dụng, chi phí &
Vận hành" → "Trạng thái tính năng" sau khi deploy: `groq` nên chuyển từ `down` → `up`.
