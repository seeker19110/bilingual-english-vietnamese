// api/_lib/aiConfig.ts — hằng số dùng chung cho lời gọi AI hội thoại.
//
// Tách khỏi api/ai.ts để cả handler production LẪN script đánh giá offline
// (scripts/eval-tutor.ts) dùng ĐÚNG một nguồn: cùng model, cùng guardrail.
// Nếu để mỗi nơi khai báo riêng, đổi model ở handler mà quên sửa script → eval
// đo nhầm model, số liệu vô nghĩa (đúng vấn đề ⑤ T1 muốn tránh: "đổi mù").

// Model Anthropic được SERVER quyết định, không tin client (tránh gọi model đắt).
export const ALLOWED_MODEL = 'claude-haiku-4-5-20251001'

// Model chat của Gemini (ưu tiên nếu có GEMINI_API_KEY). Đổi qua biến môi trường.
export const GEMINI_CHAT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

// Model chat của Groq (FREE, nếu có GROQ_API_KEY). Đổi qua biến môi trường.
export const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile'

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
