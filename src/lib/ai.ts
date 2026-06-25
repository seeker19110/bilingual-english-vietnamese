// Gọi AI qua /api/claude — KHÔNG gửi API key từ browser.
// API key được giữ ở server: vite.config.ts (lúc dev) hoặc api/ai.ts (lúc deploy lên VPS).
// Handler hỗ trợ Gemini (ưu tiên) / Groq / Anthropic — chọn dựa trên biến môi trường.

import { supabase } from './supabase'

const MODEL = 'claude-haiku-4-5-20251001'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

// Lấy Supabase JWT để gửi kèm request — server dùng để xác thực người dùng
async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

// mode: cho server biết đây là lượt chat / viết / nói để đếm đúng cột giới hạn.
export type CallMode = 'chat' | 'writing' | 'speaking'

export async function callClaude(
  messages: ClaudeMessage[],
  system: string,
  maxTokens = 1024,
  mode: CallMode = 'chat',
): Promise<string> {
  // /api/claude: lúc "npm run dev" được vite.config.ts proxy thẳng tới Anthropic (key đọc từ .env phía server);
  // lúc deploy lên Vercel, route này do api/claude.ts (serverless function) xử lý.
  const authHeader = await getAuthHeader()
  const resp = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...authHeader },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages, mode }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Lỗi API: ${resp.status}`)
  }

  const data = await resp.json() as unknown
  if (!data || typeof data !== 'object' || !('content' in data)) {
    throw new Error('Invalid API response: missing content')
  }
  const content = (data as { content?: unknown }).content
  if (!Array.isArray(content) || content.length === 0) {
    throw new Error('API returned empty content array')
  }
  const text = (content[0] as { text?: unknown }).text
  if (typeof text !== 'string') {
    throw new Error('API returned non-string text')
  }
  return text
}

// Trích xuất JSON từ câu trả lời (AI đôi khi bọc thêm markdown ```)
export function parseJson<T>(text: string): T | null {
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    return JSON.parse(cleaned) as T
  } catch { return null }
}
