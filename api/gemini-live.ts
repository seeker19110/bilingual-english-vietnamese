// api/gemini-live.ts — REST handler cho Gemini Live Session Gateway V7.2.
import { jsonResponse } from './_lib/http.js'
import { validateAuth } from '../packages/core-auth/security.js'
import {
  createGeminiLiveSession,
  getGeminiLiveSession,
  removeGeminiLiveSession,
} from '../packages/core-ai/geminiLiveService.js'
import {
  GeminiLiveSessionConfigSchema,
  GEMINI_LIVE_VERSION,
} from '../packages/core-contracts/geminiLive.js'

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
