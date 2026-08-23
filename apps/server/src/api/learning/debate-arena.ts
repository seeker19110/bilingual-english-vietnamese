// api/debate-arena.ts — REST handler cho Platform V5 AI Debate Arena & Socratic Multi-Agent.
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'
import {
  validateAuth,
  getCorsHeaders,
  checkRateLimit,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { checkAndConsumeUsage, refundUsage } from '@dhcb/core-billing/usage'
import { DebateArenaService } from '@dhcb/core-ai/debateArenaService'
import { DebateSessionConfig, DebateSessionState } from '@dhcb/core-contracts/debateArena'

// In-memory cache cho các phiên tranh biện của user
const activeSessions = new Map<string, DebateSessionState>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  // [2026-08-23] Endpoint này nay gọi model TRẢ TIỀN thật (trước đây chỉ trả chuỗi cứng nên
  // không ai thấy cần chặn). Phải có rate-limit + đếm lượt như mọi đường AI khác — CLAUDE.md
  // mục 7 và khuôn đã áp cho /api/companion ở đề xuất N1 mục B3.
  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'debate-arena'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/debate-arena' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429)
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse(
      { error: 'Unauthorized', message: 'Yêu cầu đăng nhập để tham gia Đấu trường Tranh biện.' },
      401,
    )
  }

  const personId = auth.userId
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (req.method === 'GET') {
    const sessionId = url.searchParams.get('sessionId')
    if (sessionId) {
      const session = activeSessions.get(sessionId)
      if (!session) {
        return jsonResponse({ error: 'Session not found' }, 404)
      }
      return jsonResponse({ success: true, session }, 200)
    }

    // Trả về danh sách chủ đề tranh biện mẫu
    const sampleTopics = [
      {
        topicId: 'ai-ethics',
        motion: 'AI systems must undergo mandatory ethical auditing before deployment.',
        category: 'technology',
        difficulty: 'advanced_c1',
      },
      {
        topicId: 'ubi-economic',
        motion: 'Universal Basic Income is essential in an automated economy.',
        category: 'economics',
        difficulty: 'advanced_c1',
      },
      {
        topicId: 'remote-work',
        motion: 'Full remote work is more beneficial for long-term career growth than office work.',
        category: 'education',
        difficulty: 'intermediate_b2',
      },
    ]

    return jsonResponse({ success: true, topics: sampleTopics }, 200)
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'create_session') {
        const config: DebateSessionConfig = body.config
        if (!config || !config.motion) {
          return jsonResponse({ error: 'Missing debate session config' }, 400)
        }

        const session = DebateArenaService.createDebateSession(personId, config)
        activeSessions.set(session.id, session)
        return jsonResponse({ success: true, session }, 200)
      }

      if (action === 'submit_turn') {
        const { sessionId, content } = body
        if (!sessionId || !content) {
          return jsonResponse({ error: 'Missing sessionId or content' }, 400)
        }

        let session = activeSessions.get(sessionId)
        if (!session) {
          // Khởi tạo fallback nếu session hết hạn
          session = DebateArenaService.createDebateSession(personId, {
            topicId: 'adhoc-debate',
            motion: 'Debate motion',
            category: 'technology',
            userStance: 'support',
            difficulty: 'advanced_c1',
            maxRounds: 4,
          })
          session.id = sessionId
          activeSessions.set(sessionId, session)
        }

        // 1. Phân tích lượt của user
        const userAnalysis = DebateArenaService.analyzeArgumentTurn(content)
        const userTurn = {
          id: `turn-u-${Date.now()}`,
          speakerId: personId,
          speakerName: 'Người học',
          speakerRole: 'user' as const,
          content,
          detectedFallacy: userAnalysis.detectedFallacy,
          fallacyExplanation: userAnalysis.fallacyExplanation,
          toulmin: userAnalysis.toulmin,
          advancedVocabulary: userAnalysis.advancedVocabulary,
          logicScore: userAnalysis.logicScore,
          persuasionScore: userAnalysis.persuasionScore,
          timestamp: new Date().toISOString(),
        }
        session.turns.push(userTurn)

        // 2. Sinh lượt đối đáp của AI (Opponent) — gọi model THẬT, nên trừ lượt như chế độ
        // 'chat'. Trừ TRƯỚC khi gọi (server authoritative), hoàn lại nếu không dùng được AI.
        const gate = await checkAndConsumeUsage(personId, 'chat')
        if (!gate.ok) {
          logSecurityEvent('USAGE_LIMIT', clientIp, { path: '/api/debate-arena' })
          return jsonResponse({ error: gate.message }, 429)
        }

        const opponentRole = session.config.userStance === 'support' ? 'negative' : 'affirmative'
        const aiTurn = await DebateArenaService.generateAiTurn(session, opponentRole)
        session.turns.push(aiTurn)

        // Không gọi được AI (thiếu key / provider lỗi) → người học nhận mẫu cứng, KHÔNG được
        // tính tiền lượt đó. Hoàn lượt và để cờ isFallback nói thật với UI.
        if (aiTurn.isFallback) {
          await refundUsage(personId, 'chat', gate.day).catch(() => {})
        }

        // 3. Nếu sang vòng mới, moderator có thể đưa ra câu hỏi gợi mở
        if (session.turns.length >= 4 && session.turns.length % 4 === 0) {
          const modTurn = await DebateArenaService.generateAiTurn(session, 'socratic_moderator')
          session.turns.push(modTurn)
          session.currentRound += 1
        }

        // 4. Nếu đạt số round tối đa, kết thúc và chấm điểm
        if (session.currentRound > session.config.maxRounds) {
          session.status = 'completed'
          session.finalRubric = DebateArenaService.evaluateDebateMatch(session)
        }

        session.updatedAt = new Date().toISOString()
        activeSessions.set(sessionId, session)

        return jsonResponse(
          {
            success: true,
            userTurn,
            aiTurn,
            session,
          },
          200,
        )
      }

      if (action === 'evaluate_match') {
        const { sessionId } = body
        const session = activeSessions.get(sessionId)
        if (!session) {
          return jsonResponse({ error: 'Session not found' }, 404)
        }

        session.status = 'completed'
        session.finalRubric = DebateArenaService.evaluateDebateMatch(session)
        return jsonResponse({ success: true, rubric: session.finalRubric }, 200)
      }

      return jsonResponse({ error: 'Invalid action parameter' }, 400)
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON payload', details: String(err) }, 400)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
