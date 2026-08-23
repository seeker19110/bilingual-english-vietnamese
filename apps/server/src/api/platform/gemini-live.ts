// api/gemini-live.ts — REST handler cho Gemini Live Session Gateway V7.2.
import { jsonResponse } from '@dhcb/core-http/http'
import {
  validateAuth,
  getCorsHeaders,
  checkRateLimit,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { getClientIp } from '@dhcb/core-http/http'
import { checkAndConsumeUsage, refundUsage } from '@dhcb/core-billing/usage'
import {
  createGeminiLiveSession,
  getGeminiLiveSession,
  removeGeminiLiveSession,
} from '@dhcb/core-ai/geminiLiveService'
import { GeminiLiveSessionConfigSchema, GEMINI_LIVE_VERSION } from '@dhcb/core-contracts/geminiLive'

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 10, 'gemini_live'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/gemini-live' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429)
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const url = new URL(req.url)

  if (req.method === 'GET') {
    const sessionId = url.searchParams.get('sessionId')
    if (!sessionId) {
      return jsonResponse({ error: 'Missing sessionId parameter' }, 400)
    }

    const session = getGeminiLiveSession(sessionId)
    if (!session) {
      return jsonResponse({ error: 'Session not found or already closed' }, 404)
    }

    return jsonResponse({
      sessionId: session.config.sessionId,
      status: session.getStatus(),
      config: session.config,
      schemaVersion: GEMINI_LIVE_VERSION,
    })
  }

  if (req.method === 'POST') {
    // Mỗi phiên Gemini Live realtime trừ 1 lượt 'speaking' — đây là đường AI đắt nhất,
    // trước đây không có hàng rào chi phí nào (vá 2026-08-23, đề xuất N1 mục B3).
    const gate = await checkAndConsumeUsage(auth.userId, 'speaking')
    if (!gate.ok) {
      logSecurityEvent('USAGE_LIMIT', clientIp, { path: '/api/gemini-live' })
      return jsonResponse({ error: gate.message }, 429)
    }
    try {
      const body = await req.json()
      const parsedConfig = GeminiLiveSessionConfigSchema.partial().parse(body)
      const sessionId = parsedConfig.sessionId || `live-${auth.userId}-${Date.now()}`

      const session = createGeminiLiveSession({
        ...parsedConfig,
        sessionId,
        personId: auth.userId,
      })
      session.start()

      return jsonResponse(
        {
          success: true,
          sessionId: session.config.sessionId,
          status: session.getStatus(),
          config: session.config,
          schemaVersion: GEMINI_LIVE_VERSION,
        },
        201,
      )
    } catch (err) {
      // Tạo phiên thất bại → chưa tốn AI, trả lại lượt vừa trừ
      refundUsage(auth.userId, 'speaking', gate.day).catch(() => {})
      return jsonResponse({ error: 'Invalid configuration', details: String(err) }, 400)
    }
  }

  if (req.method === 'DELETE') {
    const sessionId = url.searchParams.get('sessionId')
    if (!sessionId) {
      return jsonResponse({ error: 'Missing sessionId parameter' }, 400)
    }

    removeGeminiLiveSession(sessionId)
    return jsonResponse({ success: true, message: 'Session closed successfully' }, 200)
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
