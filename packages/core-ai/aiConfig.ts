// api/_lib/aiConfig.ts — hằng số dùng chung cho lời gọi AI hội thoại.
//
// Tách khỏi api/ai.ts để cả handler production LẪN script đánh giá offline
// (scripts/eval-tutor.ts) dùng ĐÚNG một nguồn: cùng model, cùng guardrail.
// Nếu để mỗi nơi khai báo riêng, đổi model ở handler mà quên sửa script → eval
// đo nhầm model, số liệu vô nghĩa (đúng vấn đề ⑤ T1 muốn tránh: "đổi mù").

// Model Anthropic được SERVER quyết định, không tin client (tránh gọi model đắt).
export const ALLOWED_MODEL = 'claude-haiku-4-5-20251001'

// Model chat của Gemini (fallback thứ 3 sau Groq/Anthropic — xem thứ tự thật trong ai.ts).
// Đổi qua biến môi trường GEMINI_MODEL.
// [2026-08-24] Đổi mặc định từ 'gemini-2.0-flash' — Google đã gỡ hẳn model này (xác nhận qua lỗi
// 404 THẬT khi chạy `npm run eval:tutor` trên VPS production: "This model models/gemini-2.0-flash
// is no longer available. Please update your code to use models/gemini-3.6-flash"). Cùng dòng
// deprecation ghi ở packages/core-contracts/geminiLive.ts (2026-08-23: "Gemini 2.0 Flash NGỪNG
// PHỤC VỤ 31/03/2026") nhưng bản vá đó chỉ sửa Gemini Live, BỎ SÓT model chat text này.
// Đây là vá khẩn cấp do NHÀ CUNG CẤP gỡ model (không phải đổi ý thích chủ quan) — CHƯA chạy lại
// được `npm run eval:tutor` để so baseline sau khi đổi (môi trường sửa lỗi không có key AI thật,
// đúng tình huống ghi ở GROQ_CHAT_MODEL bên dưới). Cần người có key thật chạy
// `npm run eval:tutor -- --write-baseline` để xác nhận chất lượng + cập nhật
// docs/research/eval-tutor-baseline.md.
export const GEMINI_CHAT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

// Model chat của Groq (FREE, nếu có GROQ_API_KEY). Đổi qua biến môi trường.
// [2026-08-22] Đổi mặc định từ llama-3.3-70b-versatile — Groq đã gỡ model này khỏi danh
// sách được phép (API trả "model_not_found"), xác nhận qua curl trực tiếp trên production.
// KHÔNG chạy được npm run eval:tutor để so baseline trước khi đổi (môi trường sửa lỗi không
// có key AI thật) — đây là vá khẩn cấp do NHÀ CUNG CẤP gỡ model (không phải đổi ý thích chủ
// quan), xem PROGRESS.md. Cần chạy eval:tutor xác nhận chất lượng sau khi có key thật.
export const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-120b'

// Guardrail cố định do SERVER chèn vào ĐẦU system prompt. Prompt nền dựng ở client
// (src/prompts) nên người đã đăng nhập về lý thuyết có thể gửi prompt tuỳ ý để biến API
// thành chatbot chung (tốn quota, lệch mục đích). Khung này ràng AI luôn đóng vai gia sư
// ngôn ngữ. Giữ NGẮN + chỉ nói phạm vi/vai trò, KHÔNG ép định dạng output (để prompt theo
// mode chat/writing/speaking tự quyết format — câu cuối nhắc AI tuân theo hướng dẫn bên dưới).
export const SYSTEM_GUARDRAIL =
  'Bạn là trợ lý GIA SƯ NGÔN NGỮ (Anh–Việt) trong một ứng dụng học tiếng. ' +
  'Chỉ hỗ trợ việc học ngôn ngữ: luyện hội thoại, sửa lỗi, giải thích, chấm bài, từ vựng và ngữ pháp. ' +
  'Nếu được yêu cầu làm việc ngoài phạm vi học ngôn ngữ, hãy lịch sự từ chối và mời người dùng quay lại bài học. ' +
  'Luôn tuân thủ hướng dẫn vai trò và định dạng trả lời bên dưới.\n\n'
