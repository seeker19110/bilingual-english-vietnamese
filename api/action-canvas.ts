// api/action-canvas.ts — REST handler cho Không gian làm việc Tương tác Action Canvas V4.2.
import { jsonResponse } from './_lib/http.js'
import { validateAuth, getCorsHeaders } from '../packages/core-auth/security.js'
import {
  ActionCanvasState,
  ActionCanvasStateSchema,
  ACTION_CANVAS_VERSION,
} from '../packages/core-contracts/actionCanvas.js'
import { ActionCanvasService } from '../packages/core-personal/actionCanvasService.js'

const inMemoryCanvasMap = new Map<string, ActionCanvasState>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse(
      { error: 'Unauthorized', message: 'Yêu cầu đăng nhập để truy cập Action Canvas.' },
      401,
    )
  }

  const personId = auth.userId
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (req.method === 'GET') {
    const existing =
      inMemoryCanvasMap.get(personId) ||
      ActionCanvasService.synthesizeCrossDomainGoalCanvas({
        canvasId: '11111111-1111-4111-8111-111111111111',
        personId,
        goalPrompt: 'Lộ trình Phát triển Toàn diện & Tiếng Anh Quốc tế 2026',
      })

    return jsonResponse(
      {
        success: true,
        canvas: existing,
      },
      200,
    )
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'synthesize') {
        const goalPrompt = String(body.goalPrompt || 'Mục tiêu Phát triển Cá nhân').slice(0, 200)
        const canvasId = body.canvasId || '11111111-1111-4111-8111-111111111111'
        const synthesized = ActionCanvasService.synthesizeCrossDomainGoalCanvas({
          canvasId,
          personId,
          goalPrompt,
        })
        inMemoryCanvasMap.set(personId, synthesized)
        return jsonResponse({ success: true, canvas: synthesized }, 200)
      }

      if (action === 'auto_layout') {
        const existing = inMemoryCanvasMap.get(personId)
        if (!existing) {
          return jsonResponse({ error: 'canvas_not_found' }, 404)
        }
        const updatedNodes = ActionCanvasService.autoLayoutCanvasNodes(
          existing.nodes,
          existing.edges,
        )
        const updatedCanvas: ActionCanvasState = {
          ...existing,
          nodes: updatedNodes,
          updatedAt: new Date().toISOString(),
        }
        inMemoryCanvasMap.set(personId, updatedCanvas)
        return jsonResponse({ success: true, canvas: updatedCanvas }, 200)
      }

      if (action === 'export') {
        const existing = inMemoryCanvasMap.get(personId)
        if (!existing) {
          return jsonResponse({ error: 'canvas_not_found' }, 404)
        }
        const markdown = ActionCanvasService.exportCanvasToMarkdown(existing)
        return jsonResponse(
          {
            success: true,
            format: 'markdown',
            markdown,
            title: existing.title,
          },
          200,
        )
      }

      const parseResult = ActionCanvasStateSchema.safeParse({
        ...body,
        personId,
        schemaVersion: ACTION_CANVAS_VERSION,
      })

      if (!parseResult.success) {
        return jsonResponse({ error: 'invalid_request', details: parseResult.error.format() }, 400)
      }

      inMemoryCanvasMap.set(personId, parseResult.data)
      return jsonResponse({ success: true, canvas: parseResult.data }, 200)
    } catch (err) {
      return jsonResponse({ error: 'Invalid payload', details: String(err) }, 400)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
