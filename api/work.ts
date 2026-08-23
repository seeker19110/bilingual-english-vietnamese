// api/work.ts — REST API cho Work Domain (V2-15).
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
  createWorkProject,
  listWorkProjects,
  updateWorkProject,
  createWorkTask,
  listWorkTasks,
  updateWorkTask,
  recordWorkMeeting,
  listWorkMeetings,
  createWorkDocument,
  listWorkDocuments,
} from '@dhcb/core-work/workService'
import {
  WorkProjectStatusSchema,
  WorkTaskPrioritySchema,
  WorkTaskStatusSchema,
  WorkDocumentTypeSchema,
} from '@dhcb/core-contracts/work'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'

const CreateProjectBodySchema = z
  .object({
    kind: z.literal('project'),
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    deadline: z.string().datetime().optional(),
  })
  .strict()

const CreateTaskBodySchema = z
  .object({
    kind: z.literal('task'),
    projectId: z.uuid().optional(),
    title: z.string().min(1).max(200),
    priority: WorkTaskPrioritySchema,
    dueAt: z.string().datetime().optional(),
  })
  .strict()

const RecordMeetingBodySchema = z
  .object({
    kind: z.literal('meeting'),
    title: z.string().min(1).max(200),
    scheduledAt: z.string().datetime(),
    durationMinutes: z.number().int().positive().optional(),
    summary: z.string().max(2000).optional(),
    actionItems: z.array(z.string().min(1).max(500)).optional(),
  })
  .strict()

const CreateDocumentBodySchema = z
  .object({
    kind: z.literal('document'),
    projectId: z.uuid().optional(),
    title: z.string().min(1).max(200),
    documentType: WorkDocumentTypeSchema,
    summary: z.string().min(1).max(2000),
    contentUri: z.string().max(500).optional(),
  })
  .strict()

const PostBodySchema = z.discriminatedUnion('kind', [
  CreateProjectBodySchema,
  CreateTaskBodySchema,
  RecordMeetingBodySchema,
  CreateDocumentBodySchema,
])

const UpdateProjectBodySchema = z
  .object({
    kind: z.literal('project'),
    id: z.uuid(),
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: WorkProjectStatusSchema.optional(),
    deadline: z.string().datetime().optional(),
  })
  .strict()

const UpdateTaskBodySchema = z
  .object({
    kind: z.literal('task'),
    id: z.uuid(),
    title: z.string().min(1).max(200).optional(),
    priority: WorkTaskPrioritySchema.optional(),
    status: WorkTaskStatusSchema.optional(),
    dueAt: z.string().datetime().optional(),
  })
  .strict()

const PatchBodySchema = z.discriminatedUnion('kind', [
  UpdateProjectBodySchema,
  UpdateTaskBodySchema,
])

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'work'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/work' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)

  const pool = getPgPool()
  try {
    const person = await getOrCreatePerson(pool, auth.userId)
    const url = new URL(req.url)

    if (req.method === 'GET') {
      const kind = url.searchParams.get('kind') ?? 'projects'
      if (kind === 'projects') {
        const status = url.searchParams.get('status') ?? undefined
        return jsonResponse(
          { projects: await listWorkProjects(pool, person.id, status) },
          200,
          headers,
        )
      }
      if (kind === 'tasks') {
        const status = url.searchParams.get('status') ?? undefined
        const projectId = url.searchParams.get('projectId') ?? undefined
        return jsonResponse(
          { tasks: await listWorkTasks(pool, person.id, status, projectId) },
          200,
          headers,
        )
      }
      if (kind === 'meetings') {
        return jsonResponse({ meetings: await listWorkMeetings(pool, person.id) }, 200, headers)
      }
      if (kind === 'documents') {
        const projectId = url.searchParams.get('projectId') ?? undefined
        return jsonResponse(
          { documents: await listWorkDocuments(pool, person.id, projectId) },
          200,
          headers,
        )
      }
      return jsonResponse({ error: 'kind không hợp lệ' }, 400, headers)
    }

    if (req.method === 'POST') {
      const parsed = await readJsonBody(req)
      if (!parsed.ok)
        return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
      const validated = validateBody(PostBodySchema, parsed.raw)
      if (!validated.ok)
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)

      const body = validated.data
      if (body.kind === 'project') {
        return jsonResponse(await createWorkProject(pool, person.id, body), 201, headers)
      }
      if (body.kind === 'task') {
        return jsonResponse(await createWorkTask(pool, person.id, body), 201, headers)
      }
      if (body.kind === 'meeting') {
        return jsonResponse(await recordWorkMeeting(pool, person.id, body), 201, headers)
      }
      if (body.kind === 'document') {
        return jsonResponse(await createWorkDocument(pool, person.id, body), 201, headers)
      }
    }

    if (req.method === 'PATCH') {
      const parsed = await readJsonBody(req)
      if (!parsed.ok)
        return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
      const validated = validateBody(PatchBodySchema, parsed.raw)
      if (!validated.ok)
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)

      const body = validated.data
      if (body.kind === 'project') {
        return jsonResponse(await updateWorkProject(pool, person.id, body.id, body), 200, headers)
      }
      if (body.kind === 'task') {
        return jsonResponse(await updateWorkTask(pool, person.id, body.id, body), 200, headers)
      }
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) return jsonResponse(toErrorBody(err), err.status, headers)
    throw err
  }
}
