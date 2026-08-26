# feat: Groq Model Pool Fallback — hỗ trợ danh sách nhiều model dự phòng (2026-08-22)

Hỗ trợ khai báo danh sách nhiều model trong `GROQ_CHAT_MODEL` phân cách bằng dấu phẩy (vd `GROQ_CHAT_MODEL=llama-3.3-70b-versatile,openai/gpt-oss-120b,qwen/qwen3.6-27b`).

- `packages/core-ai/groqKeyPool.ts`: Bổ sung hàm `groqModelPool(customModelString?: string): string[]`.
- `packages/core-ai/chatProviders.ts`: Nâng cấp `callGroqChatWithKeyPool` tự động duyệt qua từng model trong danh sách khi gặp lỗi `model_not_found` (400/404), quá tải (503) hoặc cạn kiệt key của model hiện tại.
- `packages/core-personal/companionRuntime.ts`: Chuyển Bạn Đồng Hành sang dùng `callGroqChatWithKeyPool` đồng bộ cơ chế Key Pool và Model Pool.
- Bổ sung unit tests cho `groqModelPool` và kịch bản model fallback trong `chatProviders.test.ts` & `companionRuntime.test.ts`.
