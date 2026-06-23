// Gọi AI qua /api/claude — KHÔNG gửi API key từ browser.
// API key được giữ ở server: vite.config.ts (lúc dev) hoặc api/claude.ts (lúc deploy lên Vercel).

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

// Retry với exponential backoff cho frontend.
async function retryFetch(
  url: string,
  options: RequestInit,
  maxAttempts = 3,
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await fetch(url, options)

      // Nếu 503, 502, 504 → retry
      if ([502, 503, 504].includes(resp.status) && attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 1000, 10000)
        console.warn(`[Retry] Attempt ${attempt}/${maxAttempts} failed (${resp.status}), waiting ${delay}ms...`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }

      return resp
    } catch (err) {
      lastError = err as Error
      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 1000, 10000)
        console.warn(`[Retry] Attempt ${attempt}/${maxAttempts} network error, waiting ${delay}ms...`, err)
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }

  throw lastError || new Error('Tất cả lần retry đều thất bại')
}

export async function callClaude(
  messages: ClaudeMessage[],
  system: string,
  maxTokens = 1024,
): Promise<string> {
  // /api/claude: lúc "npm run dev" được vite.config.ts proxy thẳng tới Anthropic (key đọc từ .env phía server);
  // lúc deploy lên Vercel, route này do api/claude.ts (serverless function) xử lý.
  const authHeader = await getAuthHeader()

  const resp = await retryFetch(
    '/api/claude',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
    },
    3,
  )

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
