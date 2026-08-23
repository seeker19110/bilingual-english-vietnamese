// api/mesh-telemetry.ts — REST handler cho WebSocket Mesh & Realtime Telemetry V4.4.
import { jsonResponse } from '@dhcb/core-http/http'
import { validateAuth, getCorsHeaders } from '@dhcb/core-auth/security'
import {
  RealtimeSessionTelemetry,
  RealtimeSessionTelemetrySchema,
  MESH_TELEMETRY_VERSION,
} from '@dhcb/core-contracts/meshTelemetry'
import { MeshTelemetryService } from '@dhcb/core-ai/meshTelemetryService'

const inMemorySessionTelemetry = new Map<string, RealtimeSessionTelemetry>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse(
      { error: 'Unauthorized', message: 'Yêu cầu đăng nhập để truy cập Telemetry.' },
      401,
    )
  }

  const personId = auth.userId
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (req.method === 'GET') {
    const existing =
      inMemorySessionTelemetry.get(personId) ||
      MeshTelemetryService.createDefaultSessionTelemetry({
        sessionId: `40000000-0000-4000-8000-${Date.now().toString().slice(-12).padStart(12, '0')}`,
        personId,
      })
    inMemorySessionTelemetry.set(personId, existing)

    return jsonResponse(
      {
        success: true,
        telemetry: existing,
        meshStatus: {
          activeNodes: 3,
          overallQuality: 98,
          region: 'ap-southeast-1 (Singapore)',
        },
      },
      200,
    )
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'record_metric') {
        const current =
          inMemorySessionTelemetry.get(personId) ||
          MeshTelemetryService.createDefaultSessionTelemetry({
            sessionId: `40000000-0000-4000-8000-${Date.now().toString().slice(-12).padStart(12, '0')}`,
            personId,
          })

        const updated = MeshTelemetryService.trackLiveSessionCost({
          current,
          addedTokens: Number(body.addedTokens || 0),
          addedAudioSeconds: Number(body.addedAudioSeconds || 0),
          provider: body.provider || 'gemini_live',
          latencyMs: Number(body.latencyMs || 50),
        })

        inMemorySessionTelemetry.set(personId, updated)
        return jsonResponse({ success: true, telemetry: updated }, 200)
      }

      if (action === 'reset_budget') {
        const current =
          inMemorySessionTelemetry.get(personId) ||
          MeshTelemetryService.createDefaultSessionTelemetry({
            sessionId: `40000000-0000-4000-8000-${Date.now().toString().slice(-12).padStart(12, '0')}`,
            personId,
          })

        const newCap = Math.max(0.01, Number(body.costCapUsd || 0.1))
        const resetState: RealtimeSessionTelemetry = {
          ...current,
          costCapUsd: newCap,
          budgetWarning: false,
          isThrottled: false,
          qualityTier: 'ultra_low_latency',
          updatedAt: new Date().toISOString(),
        }

        inMemorySessionTelemetry.set(personId, resetState)
        return jsonResponse({ success: true, telemetry: resetState }, 200)
      }

      const parseResult = RealtimeSessionTelemetrySchema.safeParse({
        ...body,
        personId,
        schemaVersion: MESH_TELEMETRY_VERSION,
      })

      if (!parseResult.success) {
        return jsonResponse({ error: 'invalid_request', details: parseResult.error.format() }, 400)
      }

      inMemorySessionTelemetry.set(personId, parseResult.data)
      return jsonResponse({ success: true, telemetry: parseResult.data }, 200)
    } catch (err) {
      return jsonResponse({ error: 'Invalid payload', details: String(err) }, 400)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
