// api/realtime-multimodal.ts — API Gateway quản lý phiên đàm thoại đa phương thức song công V4.
import { jsonResponse } from './_lib/http.js'
import { validateAuth } from '../packages/core-auth/security.js'
import {
  createMultimodalSession,
  getMultimodalSession,
  removeMultimodalSession,
} from '../packages/core-ai/realtimeMultimodalService.js'
import {
  RealtimeSessionConfigSchema,
  REALTIME_MULTIMODAL_VERSION,
} from '../packages/core-contracts/realtimeMultimodal.js'

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
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

    const session = getMultimodalSession(sessionId)
    if (!session) {
      return jsonResponse({ error: 'Session not found or already closed' }, 404)
    }

    return jsonResponse({
      sessionId: session.config.sessionId,
      state: session.getState(),
      config: session.config,
      schemaVersion: REALTIME_MULTIMODAL_VERSION,
    })
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()
      const parsedConfig = RealtimeSessionConfigSchema.partial().parse(body)

      const session = createMultimodalSession({
        ...parsedConfig,
        personId: auth.userId,
      })

      return jsonResponse(
        {
          sessionId: session.config.sessionId,
          state: session.getState(),
          config: session.config,
          websocketEndpoint: `/ws/realtime-multimodal?sessionId=${session.config.sessionId}`,
          schemaVersion: REALTIME_MULTIMODAL_VERSION,
        },
        201,
      )
    } catch (err) {
      return jsonResponse(
        { error: 'Invalid session configuration payload', details: String(err) },
        400,
      )
    }
  }

  if (req.method === 'DELETE') {
    const sessionId = url.searchParams.get('sessionId')
    if (!sessionId) {
      return jsonResponse({ error: 'Missing sessionId parameter' }, 400)
    }

    const removed = removeMultimodalSession(sessionId)
    return jsonResponse({ success: removed })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
