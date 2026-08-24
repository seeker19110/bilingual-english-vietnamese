// api/agent-orchestrator.ts — REST handler cho Autonomous Multi-Agent Orchestrator Studio.
import { jsonResponse } from '@dhcb/core-http/http'
import { validateAuth, getCorsHeaders } from '@dhcb/core-auth/security'
import { orchestrateAutonomousAgentTask } from '@dhcb/core-personal/agentOrchestratorService'
import type {
  AutonomousAgentRole,
  AgentExecutionSession,
} from '@dhcb/core-contracts/agentOrchestrator'
import { getFeatureState, setFeatureState } from '@dhcb/core-db/featureState'

// [2026-08-24] Trước đây danh sách phiên nằm trong `new Map` cấp module — mất khi restart và VỠ
// trong PM2 cluster 3 instance (mỗi tiến trình một bản sao). Nay lưu ở platform.feature_state.
const FEATURE = 'agent_orchestrator'
// Trần số phiên giữ lại mỗi người, để dòng JSONB không phình vô hạn.
const MAX_SESSIONS = 50

async function readSessions(userId: string): Promise<AgentExecutionSession[]> {
  const state = await getFeatureState<AgentExecutionSession[]>(userId, FEATURE)
  return Array.isArray(state) ? state : []
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse(
      {
        error: 'Unauthorized',
        message: 'Yêu cầu đăng nhập để truy cập Studio Điều Phối Agent Tự Trị.',
      },
      401,
    )
  }

  const personId = auth.userId
  const url = new URL(req.url)
  const sessionId = url.searchParams.get('sessionId')

  if (req.method === 'GET') {
    const userSessions = await readSessions(personId)
    if (sessionId) {
      const found = userSessions.find((s) => s.sessionId === sessionId)
      if (!found) {
        return jsonResponse({ error: 'Session not found' }, 404)
      }
      return jsonResponse({ success: true, session: found }, 200)
    }
    return jsonResponse({ success: true, sessions: userSessions }, 200)
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()
      const { sessionTitle, primaryRole, userGoalDescription, budgetGuardrail } = body

      if (!sessionTitle || !primaryRole || !userGoalDescription) {
        return jsonResponse(
          { error: 'Missing required fields: sessionTitle, primaryRole, userGoalDescription' },
          400,
        )
      }

      const validRoles: AutonomousAgentRole[] = [
        'socratic_mentor',
        'career_strategist',
        'code_architect',
        'venture_validator',
        'life_concierge',
      ]

      if (!validRoles.includes(primaryRole)) {
        return jsonResponse({ error: `Invalid role: ${primaryRole}` }, 400)
      }

      const session = orchestrateAutonomousAgentTask({
        personId,
        sessionTitle,
        primaryRole,
        userGoalDescription,
        budgetGuardrail,
      })

      const userSessions = await readSessions(personId)
      userSessions.unshift(session)
      await setFeatureState(personId, FEATURE, userSessions.slice(0, MAX_SESSIONS))

      return jsonResponse({ success: true, session }, 200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return jsonResponse({ error: 'Failed to orchestrate agent task', details: msg }, 500)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
