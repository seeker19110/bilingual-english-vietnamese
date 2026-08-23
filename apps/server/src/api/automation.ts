// api/automation.ts — V2-18 Approved Automation API.
// personId luôn suy từ token xác thực qua getOrCreatePerson, không nhận từ client.
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
  createAutomationGrant,
  pauseAutomationGrant,
  resumeAutomationGrant,
  revokeAutomationGrant,
  listAutomationGrants,
  getAutomationGrant,
  executeAutomatedAction,
  listActionReceipts,
  getActionReceipt,
} from '@dhcb/core-personal/automationService'
import {
  AutomationTriggerSchema,
  AutomationBudgetSchema,
  AutomationCompensationSchema,
  AutomationGrantStatusSchema,
} from '@dhcb/core-contracts/automation'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'

const PostAutomationSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('create_grant'),
      name: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
      capabilityId: z
        .string()
        .regex(/^[a-z_]+\.[a-z_]+$/, 'capabilityId phải dạng "domain.action"'),
      action: z.string().min(1).max(200),
      targetDomain: z.string().min(1).max(100),
      trigger: AutomationTriggerSchema,
      budget: AutomationBudgetSchema.partial().optional(),
      compensation: AutomationCompensationSchema.optional(),
      reviewAt: z.string().datetime(),
      expiresAt: z.string().datetime().optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('trigger'),
      grantId: z.string().uuid(),
      idempotencyKey: z.string().min(1).max(200),
      triggerSource: z.string().min(1).max(100),
      inputPayload: z.record(z.string(), z.unknown()),
      maxRetries: z.number().int().nonnegative().max(5).optional(),
    })
    .strict(),
])

const PatchAutomationSchema = z.discriminatedUnion('action', [
  z
    .object({
      id: z.string().uuid(),
      action: z.literal('pause'),
      expectedVersion: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      id: z.string().uuid(),
      action: z.literal('resume'),
      expectedVersion: z.number().int().positive(),
    })
    .strict(),
  z
    .object({
      id: z.string().uuid(),
      action: z.literal('revoke'),
      expectedVersion: z.number().int().positive(),
    })
    .strict(),
])

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'automation'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/automation' })
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

      if (kind === 'receipts') {
        const grantId = url.searchParams.get('grantId') ?? undefined
        const receipts = await listActionReceipts(pool, person.id, { grantId })
        return jsonResponse({ receipts }, 200, headers)
      }

      const receiptId = url.searchParams.get('receiptId')
      if (receiptId) {
        const receipt = await getActionReceipt(pool, person.id, receiptId)
        return jsonResponse({ receipt }, 200, headers)
      }

      const grantId = url.searchParams.get('grantId')
      if (grantId) {
        const grant = await getAutomationGrant(pool, person.id, grantId)
        return jsonResponse({ grant }, 200, headers)
      }

      const statusRaw = url.searchParams.get('status')
      let status = undefined
      if (statusRaw) {
        const parsed = AutomationGrantStatusSchema.safeParse(statusRaw)
        if (!parsed.success) {
          return jsonResponse({ error: 'Invalid status parameter' }, 400, headers)
        }
        status = parsed.data
      }

      const grants = await listAutomationGrants(pool, person.id, { status })
      return jsonResponse({ grants }, 200, headers)
    }

    if (req.method === 'POST') {
      const parsedBody = await readJsonBody(req)
      if (!parsedBody.ok) {
        return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, headers)
      }
      const validated = validateBody(PostAutomationSchema, parsedBody.raw)
      if (!validated.ok) {
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)
      }

      if (validated.data.kind === 'create_grant') {
        const grant = await createAutomationGrant(pool, {
          personId: person.id,
          name: validated.data.name,
          description: validated.data.description,
          capabilityId: validated.data.capabilityId,
          action: validated.data.action,
          targetDomain: validated.data.targetDomain,
          trigger: validated.data.trigger,
          budget: validated.data.budget,
          compensation: validated.data.compensation,
          reviewAt: validated.data.reviewAt,
          expiresAt: validated.data.expiresAt,
        })
        return jsonResponse({ grant }, 201, headers)
      }

      const triggerResult = await executeAutomatedAction(pool, {
        personId: person.id,
        grantId: validated.data.grantId,
        idempotencyKey: validated.data.idempotencyKey,
        triggerSource: validated.data.triggerSource,
        inputPayload: validated.data.inputPayload,
        maxRetries: validated.data.maxRetries,
      })

      return jsonResponse(triggerResult, 200, headers)
    }

    if (req.method === 'PATCH') {
      const parsedBody = await readJsonBody(req)
      if (!parsedBody.ok) {
        return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, headers)
      }
      const validated = validateBody(PatchAutomationSchema, parsedBody.raw)
      if (!validated.ok) {
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)
      }

      let grant
      if (validated.data.action === 'pause') {
        grant = await pauseAutomationGrant(
          pool,
          person.id,
          validated.data.id,
          validated.data.expectedVersion,
        )
      } else if (validated.data.action === 'resume') {
        grant = await resumeAutomationGrant(
          pool,
          person.id,
          validated.data.id,
          validated.data.expectedVersion,
        )
      } else {
        grant = await revokeAutomationGrant(
          pool,
          person.id,
          validated.data.id,
          validated.data.expectedVersion,
        )
      }

      return jsonResponse({ grant }, 200, headers)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    throw err
  }
}
