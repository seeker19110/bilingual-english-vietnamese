// Vercel Serverless Function — proxy gọi Anthropic API
// Giữ API key ở phía server (biến môi trường ANTHROPIC_API_KEY, KHÔNG có tiền tố VITE_
// nên sẽ không bị đóng gói vào file JS gửi cho browser).
//
// Frontend (src/lib/ai.ts) chỉ gọi POST /api/claude với { system, messages, max_tokens }
// — không hề biết và không cần gửi API key.
//
// BẢO MẬT: Server tự quyết định model và giới hạn max_tokens,
// không tin giá trị client gửi lên (tránh bị gọi model đắt / token lớn).

import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  validateContentType,
  logSecurityEvent,
} from './_lib/security'
import { retryWithBackoff } from './_lib/retry'

// Model và giới hạn do SERVER quyết định, không tin client
const ALLOWED_MODEL = 'claude-haiku-4-5-20251001'
// Model chat của Groq (FREE) — dùng khi có GROQ_API_KEY. Có thể đổi qua biến môi trường.
const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile'
const MAX_TOKENS_LIMIT = 2048      // tối đa cho phép (writing cần 2048, chat 1024)
const MAX_BODY_BYTES = 64 * 1024   // 64KB — đủ cho 1 cuộc hội thoại dài
const MAX_MSG_CONTENT = 2000       // mỗi tin nhắn không quá 2000 ký tự
const MAX_TOTAL_CONTENT = 40000    // tổng nội dung messages không quá 40000 ký tự

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = getCorsHeaders(req)
  const allHeaders = { ...corsHeaders, ...SECURITY_HEADERS }

  // Xử lý preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: allHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
      status: 405,
      headers: { 'content-type': 'application/json', ...allHeaders },
    })
  }

  // Lấy IP để rate limit
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // Kiểm tra Content-Type phải là application/json
  if (!validateContentType(req)) {
    logSecurityEvent('INVALID_CONTENT_TYPE', clientIp, { path: '/api/claude' })
    return new Response(
      JSON.stringify({ error: { message: 'Content-Type phải là application/json' } }),
      { status: 415, headers: { 'content-type': 'application/json', ...allHeaders } },
    )
  }

  // Rate limit: tối đa 5 request/phút mỗi IP
  if (!checkRateLimit(clientIp, 5)) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/claude' })
    return new Response(
      JSON.stringify({ error: { message: 'Quá nhiều yêu cầu — thử lại sau 1 phút' } }),
      { status: 429, headers: { 'content-type': 'application/json', ...allHeaders } },
    )
  }

  // Xác thực người dùng qua Supabase JWT
  const authResult = await validateAuth(req)
  if (!authResult) {
    logSecurityEvent('AUTH_FAILED', clientIp, { path: '/api/claude' })
    return new Response(
      JSON.stringify({ error: { message: 'Chưa đăng nhập hoặc phiên hết hạn' } }),
      { status: 401, headers: { 'content-type': 'application/json', ...allHeaders } },
    )
  }

  // Chọn nhà cung cấp AI: có GROQ_API_KEY thì dùng Groq (Llama, FREE), không thì Anthropic.
  // Cần ít nhất một trong hai key.
  const groqKey = process.env.GROQ_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!groqKey && !anthropicKey) {
    return new Response(
      JSON.stringify({ error: { message: 'Server chưa cấu hình GROQ_API_KEY hoặc ANTHROPIC_API_KEY' } }),
      { status: 500, headers: { 'content-type': 'application/json', ...allHeaders } },
    )
  }

  // Giới hạn kích thước request — tránh gửi nội dung khổng lồ
  const rawText = await req.text()
  if (rawText.length > MAX_BODY_BYTES) {
    return new Response(
      JSON.stringify({ error: { message: 'Request quá lớn' } }),
      { status: 413, headers: { 'content-type': 'application/json', ...allHeaders } },
    )
  }

  // Parse và kiểm tra body
  let parsed: { system?: string; messages?: unknown[]; max_tokens?: number }
  try {
    parsed = JSON.parse(rawText)
  } catch {
    return new Response(
      JSON.stringify({ error: { message: 'Body không hợp lệ (cần JSON)' } }),
      { status: 400, headers: { 'content-type': 'application/json', ...allHeaders } },
    )
  }

  // Giới hạn kích thước từng tin nhắn và tổng nội dung
  const rawMessages = Array.isArray(parsed.messages) ? parsed.messages.slice(-30) : []
  const sanitizedMessages = rawMessages.map((msg: unknown) => {
    if (typeof msg === 'object' && msg !== null && 'content' in msg) {
      const m = msg as { role?: unknown; content?: unknown }
      return {
        role: m.role,
        // Cắt bớt nội dung quá dài để tránh tốn token / bị inject
        content: typeof m.content === 'string' ? m.content.trim().slice(0, MAX_MSG_CONTENT) : m.content,
      }
    }
    return msg
  })

  // Từ chối nếu tổng nội dung quá lớn
  const totalContent = sanitizedMessages.reduce((sum, msg: unknown) => {
    const m = msg as { content?: unknown }
    return sum + (typeof m?.content === 'string' ? m.content.length : 0)
  }, 0)
  if (totalContent > MAX_TOTAL_CONTENT) {
    return new Response(
      JSON.stringify({ error: { message: 'Nội dung hội thoại quá dài' } }),
      { status: 413, headers: { 'content-type': 'application/json', ...allHeaders } },
    )
  }

  // Server quyết định max_tokens + system — không tin giá trị client gửi lên
  const maxTokens = Math.min(
    typeof parsed.max_tokens === 'number' ? parsed.max_tokens : 1024,
    MAX_TOKENS_LIMIT,
  )
  const system = typeof parsed.system === 'string' ? parsed.system.slice(0, 8000) : ''

  // ── Nhánh Groq (ưu tiên — FREE, API tương thích chuẩn OpenAI) ───────────────
  if (groqKey) {
    // Groq nhận system như 1 message role="system" ở đầu danh sách
    const groqMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...sanitizedMessages,
    ]

    try {
      const text = await retryWithBackoff(
        async () => {
          const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${groqKey}`, 'content-type': 'application/json' },
            body: JSON.stringify({ model: GROQ_CHAT_MODEL, max_tokens: maxTokens, messages: groqMessages }),
          })

          if (!groqResp.ok) {
            const detail = await groqResp.text().catch(() => '')
            throw new Error(`Groq lỗi (${groqResp.status}): ${detail.slice(0, 200)}`)
          }

          const groqData = (await groqResp.json()) as { choices?: { message?: { content?: string } }[] }
          return groqData.choices?.[0]?.message?.content ?? ''
        },
        { maxRetries: 2, initialDelayMs: 100, maxDelayMs: 2000 },
      )

      // Chuẩn hoá về đúng format Anthropic mà frontend (src/lib/ai.ts) đang đọc: data.content[0].text
      return new Response(
        JSON.stringify({ content: [{ type: 'text', text }] }),
        { status: 200, headers: { 'content-type': 'application/json', ...allHeaders } },
      )
    } catch (groqError) {
      // Nếu Groq fail (và không retry được), fallback sang Anthropic nếu có key
      if (!anthropicKey) {
        const errorMsg = (groqError as Error).message || 'Groq API lỗi'
        return new Response(
          JSON.stringify({ error: { message: errorMsg } }),
          { status: 503, headers: { 'content-type': 'application/json', ...allHeaders } },
        )
      }
      console.warn('[Claude API] Groq failed, falling back to Anthropic:', groqError)
      // Tiếp tục sang Anthropic ở dưới
    }
  }

  // ── Nhánh Anthropic (chất lượng cao — cần credit) ──────────────────────────
  const safeBody = {
    model: ALLOWED_MODEL,
    max_tokens: maxTokens,
    system,
    messages: sanitizedMessages,
  }

  try {
    const data = await retryWithBackoff(
      async () => {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey as string,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify(safeBody),
        })

        if (!resp.ok) {
          const detail = await resp.text().catch(() => '')
          throw new Error(`Anthropic lỗi (${resp.status}): ${detail.slice(0, 200)}`)
        }

        return resp.text()
      },
      { maxRetries: 2, initialDelayMs: 100, maxDelayMs: 2000 },
    )

    return new Response(data, {
      status: 200,
      headers: { 'content-type': 'application/json', ...allHeaders },
    })
  } catch (err) {
    const errorMsg = (err as Error).message || 'Anthropic API lỗi'
    const isRetryable = errorMsg.includes('(503)') || errorMsg.includes('(502)') || errorMsg.includes('(504)')
    return new Response(
      JSON.stringify({ error: { message: errorMsg } }),
      { status: isRetryable ? 503 : 500, headers: { 'content-type': 'application/json', ...allHeaders } },
    )
  }
}

// Dùng Edge Runtime — nhẹ, khởi động nhanh, đủ cho việc proxy 1 request
export const config = {
  runtime: 'edge',
}
