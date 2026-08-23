// api/life-synthesis.ts — REST handler cho Cross-Domain Life Synthesis & Predictive Goal Horizon.
import { jsonResponse } from '@dhcb/core-http/http'
import { validateAuth, getCorsHeaders } from '@dhcb/core-auth/security'
import { generateLifeSynthesisReport } from '@dhcb/core-personal/lifeSynthesisService'

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse(
      {
        error: 'Unauthorized',
        message: 'Yêu cầu đăng nhập để truy cập Báo cáo Tổng hợp Đa Miền.',
      },
      401,
    )
  }

  const personId = auth.userId
  const url = new URL(req.url)
  const timeframe = (url.searchParams.get('timeframe') || 'weekly') as
    'daily' | 'weekly' | 'monthly'

  if (req.method === 'GET') {
    const report = generateLifeSynthesisReport({
      personId,
      timeframe,
    })
    return jsonResponse({ success: true, report }, 200)
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json().catch(() => ({}))
      const report = generateLifeSynthesisReport({
        personId,
        timeframe: body.timeframe || timeframe,
        domainActivityCounts: body.domainActivityCounts,
        metacognitiveAwarenessIndex: body.metacognitiveAwarenessIndex,
        neuroEnergyScore: body.neuroEnergyScore,
        activeGoals: body.activeGoals,
      })
      return jsonResponse({ success: true, report }, 200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return jsonResponse({ error: 'Failed to generate life synthesis report', details: msg }, 500)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
