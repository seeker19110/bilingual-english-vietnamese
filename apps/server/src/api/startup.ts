// api/startup.ts — REST API cho Startup Domain (V2-16).
import { z } from 'zod'
import { getPgPool } from '@dhcb/core-db/pgPool'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { getOrCreatePerson } from '@dhcb/core-personal/personService'
import {
  createVenture,
  listVentures,
  updateVentureStage,
  createProblem,
  listProblems,
  createHypothesis,
  updateHypothesisStatus,
  listHypotheses,
  recordEvidence,
  listEvidence,
} from '@dhcb/core-startup/startupService'
import {
  VentureStageSchema,
  HypothesisTypeSchema,
  HypothesisStatusSchema,
  EvidenceTypeSchema,
  ProblemSeveritySchema,
} from '@dhcb/core-contracts/startup'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'

const CreateVentureSchema = z
  .object({
    kind: z.literal('venture'),
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    stage: VentureStageSchema.optional(),
  })
  .strict()

const UpdateVentureSchema = z
  .object({ kind: z.literal('venture_stage'), id: z.uuid(), stage: VentureStageSchema })
  .strict()

const CreateProblemSchema = z
  .object({
    kind: z.literal('problem'),
    ventureId: z.uuid(),
    statement: z.string().min(1).max(2000),
    customerSegment: z.string().min(1).max(200),
    severity: ProblemSeveritySchema,
  })
  .strict()

const CreateHypothesisSchema = z
  .object({
    kind: z.literal('hypothesis'),
    ventureId: z.uuid(),
    statement: z.string().min(1).max(2000),
    hypothesisType: HypothesisTypeSchema,
  })
  .strict()

const UpdateHypothesisSchema = z
  .object({ kind: z.literal('hypothesis_status'), id: z.uuid(), status: HypothesisStatusSchema })
  .strict()

const RecordEvidenceSchema = z
  .object({
    kind: z.literal('evidence'),
    ventureId: z.uuid(),
    hypothesisId: z.uuid().optional(),
    title: z.string().min(1).max(200),
    evidenceType: EvidenceTypeSchema,
    provenance: z.string().min(1).max(500),
    findings: z.string().min(1).max(5000),
    supportsHypothesis: z.boolean(),
    collectedAt: z.string().datetime().optional(),
  })
  .strict()

const PostSchema = z.discriminatedUnion('kind', [
  CreateVentureSchema,
  CreateProblemSchema,
  CreateHypothesisSchema,
  RecordEvidenceSchema,
])

const PatchSchema = z.discriminatedUnion('kind', [UpdateVentureSchema, UpdateHypothesisSchema])

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'startup'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/startup' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)

  const pool = getPgPool()
  try {
    const person = await getOrCreatePerson(pool, auth.userId)
    const url = new URL(req.url)

    if (req.method === 'GET') {
      const kind = url.searchParams.get('kind') ?? 'ventures'
      const ventureId = url.searchParams.get('ventureId')

      if (kind === 'ventures') {
        return jsonResponse({ ventures: await listVentures(pool, person.id) }, 200, headers)
      }
      if (kind === 'problems' && ventureId) {
        return jsonResponse(
          { problems: await listProblems(pool, person.id, ventureId) },
          200,
          headers,
        )
      }
      if (kind === 'hypotheses' && ventureId) {
        return jsonResponse(
          { hypotheses: await listHypotheses(pool, person.id, ventureId) },
          200,
          headers,
        )
      }
      if (kind === 'evidence' && ventureId) {
        return jsonResponse(
          { evidence: await listEvidence(pool, person.id, ventureId) },
          200,
          headers,
        )
      }
      return jsonResponse({ error: 'kind không hợp lệ hoặc thiếu ventureId' }, 400, headers)
    }

    if (req.method === 'POST') {
      const parsed = await readJsonBody(req)
      if (!parsed.ok)
        return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
      const validated = validateBody(PostSchema, parsed.raw)
      if (!validated.ok)
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)

      const body = validated.data
      if (body.kind === 'venture') {
        return jsonResponse(await createVenture(pool, person.id, body), 201, headers)
      }
      if (body.kind === 'problem') {
        return jsonResponse(await createProblem(pool, person.id, body), 201, headers)
      }
      if (body.kind === 'hypothesis') {
        return jsonResponse(await createHypothesis(pool, person.id, body), 201, headers)
      }
      if (body.kind === 'evidence') {
        return jsonResponse(await recordEvidence(pool, person.id, body), 201, headers)
      }
    }

    if (req.method === 'PATCH') {
      const parsed = await readJsonBody(req)
      if (!parsed.ok)
        return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
      const validated = validateBody(PatchSchema, parsed.raw)
      if (!validated.ok)
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)

      const body = validated.data
      if (body.kind === 'venture_stage') {
        return jsonResponse(
          await updateVentureStage(pool, person.id, body.id, body.stage),
          200,
          headers,
        )
      }
      if (body.kind === 'hypothesis_status') {
        return jsonResponse(
          await updateHypothesisStatus(pool, person.id, body.id, body.status),
          200,
          headers,
        )
      }
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) return jsonResponse(toErrorBody(err), err.status, headers)
    throw err
  }
}
