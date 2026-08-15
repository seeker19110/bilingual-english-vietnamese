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
} from '../core-auth/security.js'
import { checkAndConsumeUsage, refundUsage, type UsageMode } from '../core-billing/usage.js'
import { callGemini } from '../../api/_lib/geminiApi.js'
import { callGroqChat, callAnthropicChat } from './chatProviders.js'
import { withConcurrencyLimit } from '../core-db/concurrencyLimiter.js'
import { createLogger } from '../core-db/logger.js'
import { jsonResponse, getClientIp } from '../../api/_lib/http.js'
import { validateBody } from '../../api/_lib/validation.js'
// Model + guardrail tách sang aiConfig.ts để script eval offline (scripts/eval-tutor.ts)
// dùng chung đúng một nguồn — đổi model ở đây tự động phản ánh vào bài đánh giá (⑤ T1).
import { ALLOWED_MODEL, GEMINI_CHAT_MODEL, GROQ_CHAT_MODEL, SYSTEM_GUARDRAIL } from './aiConfig.js'

// Thời gian chờ tối đa cho 1 lần gọi AI (ms) — tránh treo vô hạn khi nhà cung cấp chậm.
const log = createLogger('agent')

const AI_TIMEOUT_MS = 30_000

const MAX_TOKENS_LIMIT = 2048 // tối đa cho phép (writing cần 2048, chat 1024)
const MAX_BODY_BYTES = 64 * 1024 // 64KB — đủ cho 1 cuộc hội thoại dài
const MAX_MSG_CONTENT = 2000 // mỗi tin nhắn không quá 2000 ký tự
const MAX_TOTAL_CONTENT = 40000 // tổng nội dung messages không quá 40000 ký tự

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

  // Chọn nhà cung cấp AI: ưu tiên Groq → Anthropic → Gemini (đổi thứ tự 2026-08-06 — Gemini
  // xuống cuối, xem PROGRESS.md).
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

  // ── Nhánh Groq (ưu tiên — FREE, API tương thích chuẩn OpenAI) ───────────────
  if (groqKey) {
    // Còn Anthropic/Gemini dự phòng → lỗi thì thử tiếp thay vì báo lỗi ngay. Khi KHÔNG còn
    // provider nào khác, giữ NGUYÊN status/hành vi gốc (trước đây Groq luôn là nhánh cuối).
    const canFallback = Boolean(anthropicKey || geminiKey)

    log.debug(`gọi Groq bắt đầu, mode=${mode}`)
    const groqResult = await withConcurrencyLimit('groq', () =>
      callGroqChat(groqKey, GROQ_CHAT_MODEL, system, sanitizedMessages, maxTokens, AI_TIMEOUT_MS),
    )
    log.debug(`Groq xong sau ${groqResult.latencyMs}ms, kind=${groqResult.kind}`)

    if (groqResult.kind === 'network_error') {
      log.warn(`Groq lỗi mạng: ${groqResult.message}`)
      if (!canFallback) {
        await refundUsage(authResult.userId, mode, gate.day)
        return jsonResponse(
          { error: { message: `Groq lỗi: ${groqResult.message.slice(0, 200)}` } },
          504,
          allHeaders,
        )
      }
      log.warn('Groq lỗi — chuyển sang provider dự phòng (Anthropic/Gemini)')
    } else if (groqResult.kind === 'http_error') {
      if (!canFallback) {
        await refundUsage(authResult.userId, mode, gate.day)
        return jsonResponse(
          {
            error: {
              message: `Groq lỗi (${groqResult.status}): ${groqResult.bodyText.slice(0, 200)}`,
            },
          },
          groqResult.status,
          allHeaders,
        )
      }
      log.warn('Groq lỗi — chuyển sang provider dự phòng (Anthropic/Gemini)')
    } else if (groqResult.kind === 'malformed_body') {
      // Groq trả 200 nhưng body hỏng (không phải JSON / thiếu field): người dùng KHÔNG nhận
      // được câu trả lời → phải hoàn lượt giống các nhánh lỗi khác.
      if (!canFallback) {
        await refundUsage(authResult.userId, mode, gate.day)
        return jsonResponse({ error: { message: groqResult.message } }, 500, allHeaders)
      }
      log.warn(
        `Groq trả body hỏng (${groqResult.message}) — chuyển sang provider dự phòng (Anthropic/Gemini)`,
      )
    } else {
      // Chuẩn hoá về đúng format Anthropic mà frontend (apps/english/src/lib/ai.ts) đang đọc:
      // data.content[0].text
      return jsonResponse({ content: [{ type: 'text', text: groqResult.text }] }, 200, allHeaders)
    }
  }

  // ── Nhánh Anthropic (chất lượng cao — cần credit) ────────────────────────
  if (anthropicKey) {
    // Còn Gemini dự phòng → lỗi thì thử tiếp. Không còn thì giữ NGUYÊN hành vi gốc (trước đây
    // Anthropic luôn là nhánh cuối): forward thẳng status/body từ Anthropic, không bọc JSON.
    const canFallback = Boolean(geminiKey)

    log.debug(`gọi Anthropic bắt đầu, mode=${mode}`)
    const anthropicResult = await withConcurrencyLimit('anthropic', () =>
      callAnthropicChat(
        anthropicKey,
        ALLOWED_MODEL,
        system,
        sanitizedMessages,
        maxTokens,
        AI_TIMEOUT_MS,
      ),
    )

    if (anthropicResult.kind === 'network_error') {
      log.warn(`Anthropic lỗi mạng: ${anthropicResult.message}`)
      if (!canFallback) {
        await refundUsage(authResult.userId, mode, gate.day)
        return jsonResponse(
          { error: { message: `Anthropic lỗi: ${anthropicResult.message.slice(0, 200)}` } },
          504,
          allHeaders,
        )
      }
      log.warn('Anthropic lỗi — chuyển sang provider dự phòng (Gemini)')
    } else {
      log.debug(
        `Anthropic phản hồi sau ${anthropicResult.latencyMs}ms, status=${anthropicResult.status}`,
      )
      const respOk = anthropicResult.status >= 200 && anthropicResult.status < 300
      if (!respOk && canFallback) {
        log.warn(
          `Anthropic trả lỗi (${anthropicResult.status}) — chuyển sang provider dự phòng (Gemini)`,
        )
      } else {
        // Thành công HOẶC không còn provider dự phòng → forward thẳng status/body gốc, giữ
        // đúng hành vi cũ (kể cả lỗi 4xx/5xx của Anthropic, không bọc lại thành JSON riêng).
        if (!respOk) await refundUsage(authResult.userId, mode, gate.day)
        return new Response(anthropicResult.bodyText, {
          status: anthropicResult.status,
          headers: { 'content-type': 'application/json', ...allHeaders },
        })
      }
    }
  }

  // ── Nhánh Gemini (cuối cùng — chỉ dùng khi Groq/Anthropic không có key hoặc đều lỗi)
  const geminiStartedAt = Date.now()
  log.debug(`gọi Gemini bắt đầu, mode=${mode}`)
  try {
    const geminiText = await withConcurrencyLimit('gemini', () =>
      callGemini(
        geminiKey as string,
        GEMINI_CHAT_MODEL,
        system,
        sanitizedMessages as Array<{ role: 'user' | 'assistant'; content: string }>,
        maxTokens,
      ),
    )
    log.debug(`Gemini xong sau ${Date.now() - geminiStartedAt}ms`)
    return jsonResponse({ content: [{ type: 'text', text: geminiText }] }, 200, allHeaders)
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    log.warn(`Gemini lỗi sau ${Date.now() - geminiStartedAt}ms: ${errMsg}`)
    await refundUsage(authResult.userId, mode, gate.day)
    // Lỗi timeout (AbortController) → 504, còn lại 502 (lỗi từ nhà cung cấp), không phải 500 của ta.
    const isTimeout = /Hết thời gian chờ/.test(errMsg)
    return jsonResponse(
      { error: { message: `Gemini lỗi: ${errMsg.slice(0, 200)}` } },
      isTimeout ? 504 : 502,
      allHeaders,
    )
  }
}

// Dùng Edge Runtime — nhẹ, khởi động nhanh, đủ cho việc proxy 1 request
export const config = {
  runtime: 'edge',
}
