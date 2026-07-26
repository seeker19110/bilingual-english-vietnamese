// api/ai.ts — chạy qua server.ts (Express) khi deploy VPS — proxy gọi Anthropic API
// Giữ API key ở phía server (biến môi trường ANTHROPIC_API_KEY, KHÔNG có tiền tố VITE_
// nên sẽ không bị đóng gói vào file JS gửi cho browser).
//
// Frontend (src/lib/ai.ts) chỉ gọi POST /api/agent với { system, messages, max_tokens }
// — không hề biết và không cần gửi API key.
//
// BẢO MẬT: Server tự quyết định model và giới hạn max_tokens,
// không tin giá trị client gửi lên (tránh bị gọi model đắt / token lớn).

import { z } from 'zod'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  validateContentType,
  logSecurityEvent,
} from './_lib/security.js'
import { checkAndConsumeUsage, refundUsage, type UsageMode } from './_lib/usage.js'
import { callGemini } from './_lib/geminiApi.js'
import { fetchWithTimeout } from './_lib/fetchTimeout.js'
import { withConcurrencyLimit } from './_lib/concurrencyLimiter.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { validateBody } from './_lib/validation.js'
// Model + guardrail tách sang aiConfig.ts để script eval offline (scripts/eval-tutor.ts)
// dùng chung đúng một nguồn — đổi model ở đây tự động phản ánh vào bài đánh giá (⑤ T1).
import {
  ALLOWED_MODEL,
  GEMINI_CHAT_MODEL,
  GROQ_CHAT_MODEL,
  SYSTEM_GUARDRAIL,
} from './_lib/aiConfig.js'

// Thời gian chờ tối đa cho 1 lần gọi AI (ms) — tránh treo vô hạn khi nhà cung cấp chậm.
const AI_TIMEOUT_MS = 30_000

const MAX_TOKENS_LIMIT = 2048 // tối đa cho phép (writing cần 2048, chat 1024)
const MAX_BODY_BYTES = 64 * 1024 // 64KB — đủ cho 1 cuộc hội thoại dài
const MAX_MSG_CONTENT = 2000 // mỗi tin nhắn không quá 2000 ký tự
const MAX_TOTAL_CONTENT = 40000 // tổng nội dung messages không quá 40000 ký tự

// Đọc text trả lời từ body JSON của Groq (chuẩn OpenAI: choices[0].message.content).
// Ném Error với message cụ thể khi cấu trúc sai — nơi gọi bắt lỗi để hoàn lượt + trả 500.
function parseGroqText(groqData: unknown): string {
  if (!groqData || typeof groqData !== 'object' || !('choices' in groqData)) {
    throw new Error('Groq API returned invalid response structure')
  }
  const choices = (groqData as { choices?: unknown }).choices
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error('Groq API returned empty choices')
  }
  const choice = choices[0]
  if (typeof choice !== 'object' || !choice || !('message' in choice)) {
    throw new Error('Groq API returned invalid choice structure')
  }
  const message = (choice as { message?: unknown }).message
  if (typeof message !== 'object' || !message || !('content' in message)) {
    throw new Error('Groq API returned invalid message structure')
  }
  const text = (message as { content?: unknown }).content
  if (typeof text !== 'string') {
    throw new Error('Groq API returned non-string content')
  }
  return text
}

// Xử lý 1 tin nhắn — object có field `content` thì cắt bớt content (nếu là string) + giữ
// nguyên role; còn lại (không phải object / không có content) thì giữ nguyên KHÔNG đổi. Handler
// này CỐ TÌNH lenient (không từ chối input lạ, chỉ coi như rỗng/cắt bớt) — Zod ở đây định hình
// lại logic cũ, KHÔNG siết chặt thêm.
function sanitizeMessage(msg: unknown): unknown {
  if (typeof msg === 'object' && msg !== null && 'content' in msg) {
    const m = msg as { role?: unknown; content?: unknown }
    return {
      role: m.role,
      content:
        typeof m.content === 'string' ? m.content.trim().slice(0, MAX_MSG_CONTENT) : m.content,
    }
  }
  return msg
}

function sumStringContent(messages: unknown[]): number {
  return messages.reduce((sum: number, msg: unknown) => {
    const m = msg as { content?: unknown }
    return sum + (typeof m?.content === 'string' ? m.content.length : 0)
  }, 0)
}

// Mode HỢP LỆ cho /api/agent — CHỈ 3 giá trị này (khớp CallMode ở src/lib/ai.ts). Cố ý
// KHÔNG dùng isUsageMode() chung của usage.ts (nay còn có 'stt'/'pronounce' — các mode đó đếm
// vào /api/stt và /api/pronounce-assess riêng): dùng chung sẽ cho phép client gửi
// mode:'stt'/'pronounce' để /api/agent ÂM THẦM trừ nhầm sang cột đếm khác, né giới hạn chat.
const CHAT_ENDPOINT_MODES = new Set<UsageMode>(['chat', 'writing', 'speaking'])
function isChatEndpointMode(v: unknown): v is 'chat' | 'writing' | 'speaking' {
  return typeof v === 'string' && CHAT_ENDPOINT_MODES.has(v as UsageMode)
}

// Schema validate body /api/agent — xem api/ai.ts đầu file: server tự quyết định model/giới
// hạn, KHÔNG tin giá trị client gửi lên. `.catch()` tái tạo đúng hành vi lenient cũ (input sai
// kiểu → coi như rỗng/mặc định, KHÔNG từ chối) — duy nhất `.refine()` cuối vẫn từ chối (413) khi
// tổng nội dung quá lớn, giống hệt logic cũ.
const AiBodySchema = z
  .object({
    // Client gửi nhưng server KHÔNG dùng — model do server quyết định (ALLOWED_MODEL).
    model: z.string().optional(),
    messages: z
      .array(z.unknown())
      .catch([])
      .transform((arr) => arr.slice(-30).map(sanitizeMessage)),
    max_tokens: z
      .number()
      .catch(1024)
      .transform((v) => Math.min(v, MAX_TOKENS_LIMIT)),
    system: z
      .string()
      .catch('')
      .transform((v) => v.slice(0, 8000)),
    mode: z.unknown().transform((v) => (isChatEndpointMode(v) ? v : 'chat')),
  })
  .refine((d) => sumStringContent(d.messages) <= MAX_TOTAL_CONTENT, {
    error: 'Nội dung hội thoại quá dài',
    params: { status: 413 },
  })

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = getCorsHeaders(req)
  const allHeaders = { ...corsHeaders, ...SECURITY_HEADERS }

  // Xử lý preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: allHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: { message: 'Method not allowed' } }, 405, allHeaders)
  }

  // Lấy IP để rate limit
  const clientIp = getClientIp(req)

  // Kiểm tra Content-Type phải là application/json
  if (!validateContentType(req)) {
    logSecurityEvent('INVALID_CONTENT_TYPE', clientIp, { path: '/api/agent' })
    return jsonResponse(
      { error: { message: 'Content-Type phải là application/json' } },
      415,
      allHeaders,
    )
  }

  // Rate limit: tối đa 5 request/phút mỗi IP
  if (!(await checkRateLimit(clientIp, 5))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/agent' })
    return jsonResponse(
      { error: { message: 'Quá nhiều yêu cầu — thử lại sau 1 phút' } },
      429,
      allHeaders,
    )
  }

  // Xác thực người dùng qua Bearer token tự viết (validateAuth)
  const authResult = await validateAuth(req)
  if (!authResult) {
    logSecurityEvent('AUTH_FAILED', clientIp, { path: '/api/agent' })
    return jsonResponse(
      { error: { message: 'Chưa đăng nhập hoặc phiên hết hạn' } },
      401,
      allHeaders,
    )
  }

  // Chọn nhà cung cấp AI: ưu tiên Gemini → Groq → Anthropic
  // Cần ít nhất một trong ba key.
  const geminiKey = process.env.GEMINI_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!geminiKey && !groqKey && !anthropicKey) {
    return jsonResponse(
      {
        error: {
          message: 'Server chưa cấu hình GEMINI_API_KEY, GROQ_API_KEY hoặc ANTHROPIC_API_KEY',
        },
      },
      500,
      allHeaders,
    )
  }

  // Giới hạn kích thước request — tránh gửi nội dung khổng lồ
  const rawText = await req.text()
  if (rawText.length > MAX_BODY_BYTES) {
    return jsonResponse({ error: { message: 'Request quá lớn' } }, 413, allHeaders)
  }

  // Parse và kiểm tra body
  let rawBody: unknown
  try {
    rawBody = JSON.parse(rawText)
  } catch {
    return jsonResponse({ error: { message: 'Body không hợp lệ (cần JSON)' } }, 400, allHeaders)
  }

  // Validate + sanitize (Zod) — schema tái tạo đúng logic lenient cũ (cắt bớt tin nhắn/nội
  // dung, mặc định max_tokens/system, coi messages sai kiểu là rỗng), chỉ từ chối (413) khi
  // tổng nội dung quá lớn. Không dùng readJsonBody (api/_lib/validation.ts) vì body Request đã
  // đọc qua req.text() ở trên để kiểm tra MAX_BODY_BYTES — stream chỉ đọc được 1 lần.
  const parsedBody = validateBody(AiBodySchema, rawBody)
  if (!parsedBody.ok) {
    return jsonResponse(
      { error: { message: parsedBody.error.message } },
      parsedBody.error.status,
      allHeaders,
    )
  }
  const sanitizedMessages = parsedBody.data.messages
  const maxTokens = parsedBody.data.max_tokens
  // Prompt nền của client (đã cắt độ dài trong schema) + guardrail cố định phía server prepend vào đầu.
  const system = SYSTEM_GUARDRAIL + parsedBody.data.system

  // ── Giới hạn lượt dùng ở SERVER (theo gói Free/Pro) ──────────────────────────
  // mode do client gửi: 'chat' | 'writing' | 'speaking' (mặc định 'chat').
  // Server đếm authoritative trong daily_usage → client không tự vượt giới hạn được.
  const mode = parsedBody.data.mode
  const gate = await checkAndConsumeUsage(authResult.userId, mode)
  if (!gate.ok) {
    logSecurityEvent('USAGE_LIMIT', clientIp, { path: '/api/agent', mode })
    return jsonResponse({ error: { message: gate.message } }, 429, allHeaders)
  }

  // ── Nhánh Gemini (ưu tiên — FREE quota, kết quả tốt) ─────────────────────────
  if (geminiKey) {
    // Log bắt đầu/kết thúc mỗi lần gọi thật (kể cả thành công) — trước đây chỉ log
    // lúc bị chặn (401/429), nên khi Gemini/Groq chạy chậm hoặc treo giữa chừng thì
    // không có dòng nào để tra — không suy luận được request có tới server hay không.
    const startedAt = Date.now()
    console.log(`[agent] gọi Gemini bắt đầu, mode=${mode}`)
    try {
      const geminiText = await withConcurrencyLimit('gemini', () =>
        callGemini(
          geminiKey,
          GEMINI_CHAT_MODEL,
          system,
          sanitizedMessages as Array<{ role: 'user' | 'assistant'; content: string }>,
          maxTokens,
        ),
      )
      console.log(`[agent] Gemini xong sau ${Date.now() - startedAt}ms`)
      // Chuẩn hoá về đúng format Anthropic mà frontend (src/lib/ai.ts) đang đọc
      return jsonResponse({ content: [{ type: 'text', text: geminiText }] }, 200, allHeaders)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.warn(`[agent] Gemini lỗi sau ${Date.now() - startedAt}ms: ${errMsg}`)
      // Provider lỗi → người dùng không nhận được trả lời: hoàn lại lượt vừa trừ.
      await refundUsage(authResult.userId, mode)
      // Lỗi timeout (AbortController) → 504, còn lại 502 (lỗi từ nhà cung cấp), không phải 500 của ta.
      const isTimeout = /Hết thời gian chờ/.test(errMsg)
      return jsonResponse(
        { error: { message: `Gemini lỗi: ${errMsg.slice(0, 200)}` } },
        isTimeout ? 504 : 502,
        allHeaders,
      )
    }
  }

  // ── Nhánh Groq (FREE, API tương thích chuẩn OpenAI) ────────────────────────
  if (groqKey) {
    // Groq nhận system như 1 message role="system" ở đầu danh sách
    const groqMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...sanitizedMessages,
    ]
    let groqResp: Response
    const groqStartedAt = Date.now()
    console.log(`[agent] gọi Groq bắt đầu, mode=${mode}`)
    try {
      groqResp = await withConcurrencyLimit('groq', () =>
        fetchWithTimeout(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${groqKey}`, 'content-type': 'application/json' },
            body: JSON.stringify({
              model: GROQ_CHAT_MODEL,
              max_tokens: maxTokens,
              messages: groqMessages,
            }),
          },
          AI_TIMEOUT_MS,
        ),
      )
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.warn(`[agent] Groq lỗi sau ${Date.now() - groqStartedAt}ms: ${errMsg}`)
      await refundUsage(authResult.userId, mode)
      return jsonResponse(
        { error: { message: `Groq lỗi: ${errMsg.slice(0, 200)}` } },
        504,
        allHeaders,
      )
    }
    console.log(
      `[agent] Groq phản hồi sau ${Date.now() - groqStartedAt}ms, status=${groqResp.status}`,
    )

    if (!groqResp.ok) {
      const detail = await groqResp.text().catch(() => '')
      await refundUsage(authResult.userId, mode)
      return jsonResponse(
        { error: { message: `Groq lỗi (${groqResp.status}): ${detail.slice(0, 200)}` } },
        groqResp.status,
        allHeaders,
      )
    }

    // Parse + kiểm tra cấu trúc trong try/catch: nếu Groq trả 200 nhưng body hỏng
    // (không phải JSON / thiếu field), người dùng KHÔNG nhận được câu trả lời →
    // phải hoàn lượt giống các nhánh lỗi khác (trước đây các nhánh này quên hoàn).
    let text: string
    try {
      text = parseGroqText(await groqResp.json())
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      await refundUsage(authResult.userId, mode)
      return jsonResponse({ error: { message: errMsg } }, 500, allHeaders)
    }
    // Chuẩn hoá về đúng format Anthropic mà frontend (src/lib/ai.ts) đang đọc: data.content[0].text
    return jsonResponse({ content: [{ type: 'text', text }] }, 200, allHeaders)
  }

  // ── Nhánh Anthropic (chất lượng cao — cần credit) ────────────────────────
  const safeBody = {
    model: ALLOWED_MODEL,
    max_tokens: maxTokens,
    system,
    messages: sanitizedMessages,
  }

  let resp: Response
  try {
    resp = await withConcurrencyLimit('anthropic', () =>
      fetchWithTimeout(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey as string,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify(safeBody),
        },
        AI_TIMEOUT_MS,
      ),
    )
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    await refundUsage(authResult.userId, mode)
    return jsonResponse(
      { error: { message: `Anthropic lỗi: ${errMsg.slice(0, 200)}` } },
      504,
      allHeaders,
    )
  }

  // Anthropic trả lỗi (4xx/5xx) → người dùng không có câu trả lời: hoàn lại lượt vừa trừ.
  if (!resp.ok) await refundUsage(authResult.userId, mode)
  const data = await resp.text()
  return new Response(data, {
    status: resp.status,
    headers: { 'content-type': 'application/json', ...allHeaders },
  })
}

// Dùng Edge Runtime — nhẹ, khởi động nhanh, đủ cho việc proxy 1 request
export const config = {
  runtime: 'edge',
}
