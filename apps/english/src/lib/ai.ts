// Gọi AI qua /api/agent — KHÔNG gửi API key từ browser.
// API key được giữ ở server: vite.config.ts (lúc dev) hoặc api/ai.ts (lúc deploy lên VPS).
// Handler hỗ trợ Gemini (ưu tiên) / Groq / Anthropic — chọn dựa trên biến môi trường.

import { getAuthHeader } from '@core/authHeader'
import { captureException } from './errorTracking'

const MODEL = 'claude-haiku-4-5-20251001'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

// mode: cho server biết đây là lượt chat / viết / nói để đếm đúng cột giới hạn.
export type CallMode = 'chat' | 'writing' | 'speaking'

// Thông điệp chung khi phản hồi AI sai định dạng hoặc mạng lỗi — song ngữ (không cần biết
// `dir` ở tầng này) để người học A1 vẫn hiểu cần làm gì tiếp, thay vì lỗi kỹ thuật tiếng Anh
// thuần ("Invalid API response: missing content") không có hành động rõ ràng đi kèm.
// Chi tiết kỹ thuật vẫn console.warn + gửi Sentry (nếu đã bật DSN) để debug được.
const FRIENDLY_INVALID_RESPONSE =
  'Phản hồi từ AI bị lỗi định dạng, vui lòng thử lại. / Invalid AI response, please try again.'
const FRIENDLY_NETWORK_ERROR =
  'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại. / Network error — check your connection and try again.'

function reportAndThrow(friendlyMessage: string, technicalDetail: unknown): never {
  console.warn('callClaude:', technicalDetail)
  void captureException(technicalDetail, { where: 'callClaude' })
  throw new Error(friendlyMessage)
}

export async function callClaude(
  messages: ClaudeMessage[],
  system: string,
  maxTokens = 1024,
  mode: CallMode = 'chat',
): Promise<string> {
  // /api/agent: lúc "npm run dev" được vite.config.ts proxy thẳng tới Anthropic (key đọc từ .env phía server);
  // lúc deploy lên Vercel, route này do api/claude.ts (serverless function) xử lý.
  const authHeader = await getAuthHeader()
  let resp: Response
  try {
    resp = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages, mode }),
    })
  } catch (e) {
    return reportAndThrow(FRIENDLY_NETWORK_ERROR, e)
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    // Server (api/ai.ts) đã trả message song ngữ/thân thiện cho các lỗi thường gặp (hết lượt,
    // quá tải, chưa đăng nhập...) — giữ nguyên nếu có; chỉ dùng thông điệp chung khi server
    // không trả được message nào (vd lỗi hạ tầng ngoài dự kiến).
    const serverMsg = (err as { error?: { message?: string } }).error?.message
    if (serverMsg) throw new Error(serverMsg)
    return reportAndThrow(FRIENDLY_NETWORK_ERROR, { status: resp.status })
  }

  const data = (await resp.json()) as unknown
  if (!data || typeof data !== 'object' || !('content' in data)) {
    return reportAndThrow(FRIENDLY_INVALID_RESPONSE, { reason: 'missing content', data })
  }
  const content = (data as { content?: unknown }).content
  if (!Array.isArray(content) || content.length === 0) {
    return reportAndThrow(FRIENDLY_INVALID_RESPONSE, { reason: 'empty content array', data })
  }
  const text = (content[0] as { text?: unknown }).text
  if (typeof text !== 'string') {
    return reportAndThrow(FRIENDLY_INVALID_RESPONSE, { reason: 'non-string text', data })
  }
  return text
}

// Trích xuất JSON từ câu trả lời (AI đôi khi bọc thêm markdown ``` hoặc lỡ thêm
// câu chữ thừa trước/sau khối JSON, vd "Ok! { ... }") — thử parse thẳng trước,
// nếu lỗi thì thử cắt lấy phần từ dấu "{" đầu tiên tới dấu "}" cuối cùng.
export function parseJson<T>(text: string): T | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) return null
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T
    } catch {
      return null
    }
  }
}
