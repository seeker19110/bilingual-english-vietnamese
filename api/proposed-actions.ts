// api/proposed-actions.ts — V2-08 ProposedAction & Tool Manifest API.
// personId luôn suy từ token xác thực, không nhận từ client.
import { z } from 'zod'
import { getPgPool } from '../packages/core-db/pgPool.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { getOrCreatePerson } from '../packages/core-personal/personService.js'
import {
  proposeAction,
  confirmAction,
  rejectAction,
  listProposedActions,
} from '../packages/core-personal/proposedActionService.js'
import { listToolManifests } from '../packages/core-personal/toolRegistry.js'
import { CapabilityRiskLevelSchema } from '../packages/core-contracts/capabilityManifest.js'
import { ProposedActionStatusSchema } from '../packages/core-contracts/proposedAction.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

const PostProposalSchema = z
  .object({
    capabilityId: z.string().regex(/^[a-z_]+\.[a-z_]+$/, 'capabilityId phải dạng "domain.action"'),
    action: z.string().min(1).max(300),
    targetDomain: z.string().min(1).max(100),
    payload: z.record(z.string(), z.unknown()),
    riskLevel: CapabilityRiskLevelSchema,
  })
  .strict()

const PatchProposalSchema = z.discriminatedUnion('action', [
  z
    .object({
      id: z.string().uuid(),
      action: z.literal('confirm'),
      expectedVersion: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      id: z.string().uuid(),
      action: z.literal('reject'),
      expectedVersion: z.number().int().positive(),
      reason: z.string().max(500).optional(),
    })
    .strict(),
])

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'proposed-actions'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/proposed-actions' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  }

  const pool = getPgPool()
  const person = await getOrCreatePerson(pool, auth.userId)

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const kind = url.searchParams.get('kind')

      if (kind === 'tools') {
        return jsonResponse({ tools: listToolManifests() }, 200, headers)
      }

      const statusRaw = url.searchParams.get('status')
      let status = undefined
      if (statusRaw) {
        const parsed = ProposedActionStatusSchema.safeParse(statusRaw)
        if (!parsed.success) {
          return jsonResponse({ error: 'Invalid status parameter' }, 400, headers)
        }
        status = parsed.data
      }

      const actions = await listProposedActions(pool, person.id, { status })
      return jsonResponse({ actions }, 200, headers)
    }

    if (req.method === 'POST') {
      const parsedBody = await readJsonBody(req)
      if (!parsedBody.ok) {
        return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, headers)
      }
      const validated = validateBody(PostProposalSchema, parsedBody.raw)
      if (!validated.ok) {
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)
      }

      const result = await proposeAction(pool, {
        personId: person.id,
        capabilityId: validated.data.capabilityId,
        action: validated.data.action,
        targetDomain: validated.data.targetDomain,
        payload: validated.data.payload,
        riskLevel: validated.data.riskLevel,
      })

      return jsonResponse(result, 201, headers)
    }

    if (req.method === 'PATCH') {
      const parsedBody = await readJsonBody(req)
      if (!parsedBody.ok) {
        return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, headers)
      }
      const validated = validateBody(PatchProposalSchema, parsedBody.raw)
      if (!validated.ok) {
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)
      }

      if (validated.data.action === 'confirm') {
        const action = await confirmAction(
          pool,
          person.id,
          validated.data.id,
          validated.data.expectedVersion,
          `user:${auth.userId}`,
        )
        return jsonResponse({ action }, 200, headers)
      }

      const action = await rejectAction(
        pool,
        person.id,
        validated.data.id,
        validated.data.expectedVersion,
        `user:${auth.userId}`,
        validated.data.reason,
      )
      return jsonResponse({ action }, 200, headers)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    throw err
  }
}
