// api/agent-orchestrator.ts — REST handler cho Autonomous Multi-Agent Orchestrator Studio.
import { jsonResponse } from './_lib/http.js'
import { validateAuth } from '../packages/core-auth/security.js'
import { orchestrateAutonomousAgentTask } from '../packages/core-personal/agentOrchestratorService.js'
import type {
  AutonomousAgentRole,
  AgentExecutionSession,
} from '../packages/core-contracts/agentOrchestrator.js'

const sessionsMap = new Map<string, AgentExecutionSession[]>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
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
    const userSessions = sessionsMap.get(personId) || []
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

      const userSessions = sessionsMap.get(personId) || []
      userSessions.unshift(session)
      sessionsMap.set(personId, userSessions)

      return jsonResponse({ success: true, session }, 200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return jsonResponse({ error: 'Failed to orchestrate agent task', details: msg }, 500)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
