// Gọi Anthropic API trực tiếp từ browser (chỉ dùng cho prototype)
// Khi production: chuyển sang backend proxy để bảo vệ API key

const MODEL = 'claude-haiku-4-5-20251001'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function callClaude(
  messages: ClaudeMessage[],
  system: string,
  maxTokens = 1024,
): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Chưa có API key. Tạo file .env và thêm VITE_ANTHROPIC_API_KEY.')

  // Gọi qua proxy /api/claude để tránh CORS (Vite proxy → api.anthropic.com)
  const resp = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Lỗi API: ${resp.status}`)
  }

  const data = await resp.json() as { content: { type: string; text: string }[] }
  return data.content[0]?.text ?? ''
}

// Trích xuất JSON từ câu trả lời (AI đôi khi bọc thêm markdown ```)
export function parseJson<T>(text: string): T | null {
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    return JSON.parse(cleaned) as T
  } catch { return null }
}
