// api/proactive-agent.ts — REST handler cho Platform V5 Autonomous Proactive Agent.
import { jsonResponse } from './_lib/http.js'
import { validateAuth, getCorsHeaders } from '../packages/core-auth/security.js'
import {
  dismissNudge,
  evaluateProactiveState,
  executeQuickAction,
  generateGoalAutoPilotPlan,
  updateProactiveConfig,
} from '../packages/core-personal/proactiveAgentService.js'

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse(
      { error: 'Unauthorized', message: 'Yêu cầu đăng nhập để tương tác với Proactive Agent.' },
      401,
    )
  }

  const personId = auth.userId
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (req.method === 'GET') {
    const stressIndex = url.searchParams.get('stressIndex')
      ? Number(url.searchParams.get('stressIndex'))
      : undefined
    const circadianEnergy = url.searchParams.get('circadianEnergy')
      ? Number(url.searchParams.get('circadianEnergy'))
      : undefined
    const hasUnfinishedCanvasTask = url.searchParams.get('hasUnfinishedCanvasTask') === 'true'
    const streakCount = url.searchParams.get('streakCount')
      ? Number(url.searchParams.get('streakCount'))
      : undefined

    const state = evaluateProactiveState(personId, {
      stressIndex,
      circadianEnergy,
      hasUnfinishedCanvasTask,
      streakCount,
    })

    return jsonResponse({ success: true, state }, 200)
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'dismiss_nudge') {
        const { nudgeId } = body
        if (!nudgeId) {
          return jsonResponse({ error: 'Missing nudgeId' }, 400)
        }
        dismissNudge(personId, nudgeId)
        return jsonResponse({ success: true, message: 'Đã ẩn nhắc nhở.' }, 200)
      }

      if (action === 'execute_action') {
        const { nudgeId, actionPayload } = body
        if (!nudgeId || !actionPayload) {
          return jsonResponse({ error: 'Missing nudgeId or actionPayload' }, 400)
        }
        const result = executeQuickAction(personId, nudgeId, actionPayload)
        return jsonResponse({ success: true, result }, 200)
      }

      if (action === 'update_config') {
        const { config } = body
        if (!config) {
          return jsonResponse({ error: 'Missing config' }, 400)
        }
        const updated = updateProactiveConfig(personId, config)
        return jsonResponse({ success: true, config: updated }, 200)
      }

      if (action === 'create_plan') {
        const { goalId, goalTitle, domain } = body
        if (!goalId || !goalTitle) {
          return jsonResponse({ error: 'Missing goalId or goalTitle' }, 400)
        }
        const plan = generateGoalAutoPilotPlan(personId, goalId, goalTitle, domain)
        return jsonResponse({ success: true, plan }, 200)
      }

      return jsonResponse({ error: 'Invalid action parameter' }, 400)
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON payload', details: String(err) }, 400)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
