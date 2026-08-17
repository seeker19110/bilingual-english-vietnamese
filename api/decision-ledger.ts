// api/decision-ledger.ts — V2-10 Decision Ledger & Outcome Loop API.
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
  createDecision,
  decideDecision,
  recordOutcome,
  reviewDecision,
  supersedeDecision,
  getDecision,
  listDecisions,
} from '../packages/core-personal/decisionLedgerService.js'
import {
  DecisionStatusSchema,
  EvidenceRefSchema,
} from '../packages/core-contracts/decisionRecord.js'
import { IsoDateTimeSchema, UuidSchema } from '../packages/core-contracts/shared.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

const CreateDecisionSchema = z
  .object({
    problem: z.string().min(1).max(1000),
    domain: z.string().min(1).max(100).optional(),
    options: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          summary: z.string().min(1).max(500),
        }),
      )
      .min(1),
    assumptions: z.array(EvidenceRefSchema).optional(),
    evidence: z.array(EvidenceRefSchema).optional(),
    tradeoffs: z.array(z.string().min(1).max(500)).optional(),
    expectedOutcomes: z
      .array(
        z.object({
          description: z.string().min(1).max(500),
          expectedBy: IsoDateTimeSchema.optional(),
        }),
      )
      .optional(),
  })
  .strict()

const PatchDecisionSchema = z.discriminatedUnion('action', [
  z
    .object({
      id: UuidSchema,
      action: z.literal('decide'),
      selectedOptionId: z.string().min(1).max(100),
      rationale: z.string().max(2000).optional(),
      expectedOutcomes: z
        .array(
          z.object({
            description: z.string().min(1).max(500),
            expectedBy: IsoDateTimeSchema.optional(),
          }),
        )
        .optional(),
      reviewAt: IsoDateTimeSchema.optional(),
      expectedVersion: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      id: UuidSchema,
      action: z.literal('record_outcome'),
      observation: z.object({
        description: z.string().min(1).max(500),
        observedAt: IsoDateTimeSchema,
        matchedExpectation: z.boolean(),
      }),
      expectedVersion: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      id: UuidSchema,
      action: z.literal('review'),
      resolutionSummary: z.string().min(1).max(2000),
      expectedVersion: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      id: UuidSchema,
      action: z.literal('supersede'),
      newDecisionId: UuidSchema,
      expectedVersion: z.number().int().positive(),
    })
    .strict(),
])

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'decision-ledger'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/decision-ledger' })
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
      const id = url.searchParams.get('id')

      if (id) {
        const idParse = UuidSchema.safeParse(id)
        if (!idParse.success) {
          return jsonResponse({ error: 'id phải là UUID hợp lệ' }, 400, headers)
        }
        const decision = await getDecision(pool, person.id, idParse.data)
        return jsonResponse({ decision }, 200, headers)
      }

      const rawStatus = url.searchParams.get('status')
      const status = rawStatus ? DecisionStatusSchema.safeParse(rawStatus) : null
      if (rawStatus && (!status || !status.success)) {
        return jsonResponse({ error: 'status không hợp lệ' }, 400, headers)
      }

      const domain = url.searchParams.get('domain') ?? undefined
      const limitRaw = url.searchParams.get('limit')
      const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined

      const decisions = await listDecisions(pool, person.id, {
        status: status?.data,
        domain,
        limit,
      })
      return jsonResponse({ decisions }, 200, headers)
    }

    if (req.method === 'POST') {
      const bodyParsed = await readJsonBody(req)
      if (!bodyParsed.ok) {
        return jsonResponse(bodyParsed.error, bodyParsed.error.status, headers)
      }
      const validation = validateBody(CreateDecisionSchema, bodyParsed.raw)
      if (!validation.ok) {
        return jsonResponse(validation.error, validation.error.status, headers)
      }

      const decision = await createDecision(pool, {
        personId: person.id,
        ...validation.data,
      })
      return jsonResponse({ decision }, 201, headers)
    }

    if (req.method === 'PATCH') {
      const bodyParsed = await readJsonBody(req)
      if (!bodyParsed.ok) {
        return jsonResponse(bodyParsed.error, bodyParsed.error.status, headers)
      }
      const validation = validateBody(PatchDecisionSchema, bodyParsed.raw)
      if (!validation.ok) {
        return jsonResponse(validation.error, validation.error.status, headers)
      }

      const data = validation.data
      let updatedDecision

      if (data.action === 'decide') {
        updatedDecision = await decideDecision(pool, person.id, data.id, {
          selectedOptionId: data.selectedOptionId,
          rationale: data.rationale,
          expectedOutcomes: data.expectedOutcomes,
          reviewAt: data.reviewAt,
          expectedVersion: data.expectedVersion,
          actor: `user:${auth.userId}`,
        })
      } else if (data.action === 'record_outcome') {
        updatedDecision = await recordOutcome(pool, person.id, data.id, {
          observation: data.observation,
          expectedVersion: data.expectedVersion,
          actor: `user:${auth.userId}`,
        })
      } else if (data.action === 'review') {
        updatedDecision = await reviewDecision(pool, person.id, data.id, {
          resolutionSummary: data.resolutionSummary,
          expectedVersion: data.expectedVersion,
          actor: `user:${auth.userId}`,
        })
      } else if (data.action === 'supersede') {
        updatedDecision = await supersedeDecision(
          pool,
          person.id,
          data.id,
          data.newDecisionId,
          data.expectedVersion,
          `user:${auth.userId}`,
        )
      }

      return jsonResponse({ decision: updatedDecision }, 200, headers)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err: unknown) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    const message = err instanceof Error ? err.message : String(err)
    return jsonResponse({ error: 'Internal server error', message }, 500, headers)
  }
}
