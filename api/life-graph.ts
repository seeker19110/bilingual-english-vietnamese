// V2-05 Life Graph API. personId luôn suy từ token, không nhận từ client.
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
  createNode,
  listNodes,
  getNode,
  updateNode,
  softDeleteNode,
  createEdge,
  listEdges,
  softDeleteEdge,
  transitionGoalStatus,
  validateGraphIntegrity,
} from '../packages/core-personal/lifeGraphService.js'
import {
  LifeGraphNodeTypeSchema,
  LifeRelationSchema,
} from '../packages/core-contracts/lifeGraph.js'
import { LifeGoalStatusSchema } from '../packages/core-contracts/lifeGoal.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

const CreateNodeSchema = z
  .object({
    kind: z.literal('node'),
    type: LifeGraphNodeTypeSchema,
    label: z.string().min(1).max(200),
  })
  .strict()
const CreateEdgeSchema = z
  .object({
    kind: z.literal('edge'),
    fromNodeId: z.uuid(),
    toNodeId: z.uuid(),
    relation: LifeRelationSchema,
    provenance: z.string().min(1).max(100),
  })
  .strict()
import { syncCrossDomainLifeGraph } from '../packages/core-personal/crossDomainGraphService.js'

const CreateCrossDomainSyncSchema = z
  .object({
    kind: z.literal('cross_domain_sync'),
  })
  .strict()

const PostSchema = z.discriminatedUnion('kind', [
  CreateNodeSchema,
  CreateEdgeSchema,
  CreateCrossDomainSyncSchema,
])
const PatchSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('node'),
      id: z.uuid(),
      label: z.string().min(1).max(200),
      expectedVersion: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('goal'),
      id: z.uuid(),
      status: LifeGoalStatusSchema,
      expectedVersion: z.number().int().positive(),
    })
    .strict(),
])
const DeleteSchema = z.discriminatedUnion('kind', [
  z
    .object({ kind: z.literal('node'), id: z.uuid(), expectedVersion: z.number().int().positive() })
    .strict(),
  z
    .object({ kind: z.literal('edge'), id: z.uuid(), expectedVersion: z.number().int().positive() })
    .strict(),
])

async function parseBody<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const parsed = await readJsonBody(req)
  if (!parsed.ok)
    return { ok: false as const, status: parsed.error.status, message: parsed.error.message }
  const result = validateBody(schema, parsed.raw)
  if (!result.ok)
    return { ok: false as const, status: result.error.status, message: result.error.message }
  return { ok: true as const, data: result.data }
}

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'life-graph'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/life-graph' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }
  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  const pool = getPgPool()
  try {
    const person = await getOrCreatePerson(pool, auth.userId)
    const url = new URL(req.url)
    if (req.method === 'GET') {
      const kind = url.searchParams.get('kind') ?? 'nodes'
      if (kind === 'nodes') {
        const typeResult = LifeGraphNodeTypeSchema.optional().safeParse(
          url.searchParams.get('type') ?? undefined,
        )
        if (!typeResult.success)
          return jsonResponse({ error: 'Loại node không hợp lệ' }, 400, headers)
        return jsonResponse(
          { nodes: await listNodes(pool, person.id, { type: typeResult.data }) },
          200,
          headers,
        )
      }
      if (kind === 'node') {
        const id = z.uuid().safeParse(url.searchParams.get('id') ?? '')
        if (!id.success) return jsonResponse({ error: 'Thiếu hoặc sai tham số id' }, 400, headers)
        return jsonResponse(await getNode(pool, person.id, id.data), 200, headers)
      }
      if (kind === 'edges')
        return jsonResponse({ edges: await listEdges(pool, person.id) }, 200, headers)
      if (kind === 'integrity')
        return jsonResponse({ issues: await validateGraphIntegrity(pool, person.id) }, 200, headers)
      if (kind === 'cross_domain')
        return jsonResponse(
          await syncCrossDomainLifeGraph(pool, person.id, auth.userId),
          200,
          headers,
        )
      return jsonResponse({ error: 'kind không hợp lệ' }, 400, headers)
    }
    if (req.method === 'POST') {
      const body = await parseBody(req, PostSchema)
      if (!body.ok) return jsonResponse({ error: body.message }, body.status, headers)
      if (body.data.kind === 'node') {
        return jsonResponse(
          await createNode(pool, {
            personId: person.id,
            type: body.data.type,
            label: body.data.label,
          }),
          201,
          headers,
        )
      }
      if (body.data.kind === 'edge') {
        return jsonResponse(
          await createEdge(pool, { personId: person.id, ...body.data }),
          201,
          headers,
        )
      }
      if (body.data.kind === 'cross_domain_sync') {
        return jsonResponse(
          await syncCrossDomainLifeGraph(pool, person.id, auth.userId),
          200,
          headers,
        )
      }
    }
    if (req.method === 'PATCH') {
      const body = await parseBody(req, PatchSchema)
      if (!body.ok) return jsonResponse({ error: body.message }, body.status, headers)
      if (body.data.kind === 'node') {
        return jsonResponse(
          await updateNode(pool, person.id, body.data.id, body.data),
          200,
          headers,
        )
      }
      return jsonResponse(
        await transitionGoalStatus(
          pool,
          person.id,
          body.data.id,
          body.data.status,
          body.data.expectedVersion,
        ),
        200,
        headers,
      )
    }
    if (req.method === 'DELETE') {
      const body = await parseBody(req, DeleteSchema)
      if (!body.ok) return jsonResponse({ error: body.message }, body.status, headers)
      if (body.data.kind === 'node')
        await softDeleteNode(pool, person.id, body.data.id, body.data.expectedVersion)
      else await softDeleteEdge(pool, person.id, body.data.id, body.data.expectedVersion)
      return jsonResponse({ ok: true }, 200, headers)
    }
    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) return jsonResponse(toErrorBody(err), err.status, headers)
    throw err
  }
}
