// Gọi AI qua /api/claude — KHÔNG gửi API key từ browser.
// API key được giữ ở server: vite.config.ts (lúc dev) hoặc api/claude.ts (lúc deploy lên Vercel).

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
  // /api/claude: lúc "npm run dev" được vite.config.ts proxy thẳng tới Anthropic (key đọc từ .env phía server);
  // lúc deploy lên Vercel, route này do api/claude.ts (serverless function) xử lý.
  const resp = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
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
