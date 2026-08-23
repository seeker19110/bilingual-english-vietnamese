// api/life.ts — REST API cho Life Foundation Domain (V2-17).
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
  createLifePlan,
  listLifePlans,
  updateLifePlanStatus,
  createHabit,
  listHabits,
  logHabit,
  recordWellbeingCheck,
  listWellbeingChecks,
  createGrowthMilestone,
  listGrowthMilestones,
} from '@dhcb/core-life/lifeFoundationService'
import {
  LifePlanTypeSchema,
  LifePlanStatusSchema,
  HabitTypeSchema,
  HabitFrequencySchema,
  GrowthAreaSchema,
} from '@dhcb/core-contracts/lifeFoundation'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'

const CreatePlanSchema = z
  .object({
    kind: z.literal('plan'),
    title: z.string().min(1).max(200),
    planType: LifePlanTypeSchema,
    periodStart: z.string().date(),
    periodEnd: z.string().date(),
  })
  .strict()
const UpdatePlanSchema = z
  .object({ kind: z.literal('plan_status'), id: z.uuid(), status: LifePlanStatusSchema })
  .strict()
const CreateHabitSchema = z
  .object({
    kind: z.literal('habit'),
    title: z.string().min(1).max(200),
    habitType: HabitTypeSchema,
    frequency: HabitFrequencySchema,
    targetCount: z.number().int().positive().optional(),
  })
  .strict()
const LogHabitSchema = z
  .object({
    kind: z.literal('habit_log'),
    habitId: z.uuid(),
    loggedAt: z.string().date().optional(),
    count: z.number().int().positive().optional(),
    note: z.string().max(500).optional(),
  })
  .strict()
const WellbeingSchema = z
  .object({
    kind: z.literal('wellbeing'),
    moodScore: z.number().int().min(1).max(10),
    energyScore: z.number().int().min(1).max(10),
    stressScore: z.number().int().min(1).max(10),
    notes: z.string().max(2000).optional(),
  })
  .strict()
const MilestoneSchema = z
  .object({
    kind: z.literal('milestone'),
    area: GrowthAreaSchema,
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    achievedAt: z.string().date().optional(),
  })
  .strict()

const PostSchema = z.discriminatedUnion('kind', [
  CreatePlanSchema,
  CreateHabitSchema,
  LogHabitSchema,
  WellbeingSchema,
  MilestoneSchema,
])
const PatchSchema = z.discriminatedUnion('kind', [UpdatePlanSchema])

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'life'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/life' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)

  const pool = getPgPool()
  try {
    const person = await getOrCreatePerson(pool, auth.userId)
    const url = new URL(req.url)

    if (req.method === 'GET') {
      const kind = url.searchParams.get('kind') ?? 'plans'
      if (kind === 'plans') {
        const status = url.searchParams.get('status') ?? undefined
        return jsonResponse({ plans: await listLifePlans(pool, person.id, status) }, 200, headers)
      }
      if (kind === 'habits') {
        const active = url.searchParams.get('isActive')
        const isActive = active === null ? undefined : active === 'true'
        return jsonResponse({ habits: await listHabits(pool, person.id, isActive) }, 200, headers)
      }
      if (kind === 'wellbeing') {
        const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '30'), 90)
        return jsonResponse(
          { checks: await listWellbeingChecks(pool, person.id, limit) },
          200,
          headers,
        )
      }
      if (kind === 'milestones') {
        const area = (url.searchParams.get('area') ?? undefined) as Parameters<
          typeof listGrowthMilestones
        >[2]
        return jsonResponse(
          { milestones: await listGrowthMilestones(pool, person.id, area) },
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
      const validated = validateBody(PostSchema, parsed.raw)
      if (!validated.ok)
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)
      const body = validated.data
      if (body.kind === 'plan')
        return jsonResponse(await createLifePlan(pool, person.id, body), 201, headers)
      if (body.kind === 'habit')
        return jsonResponse(await createHabit(pool, person.id, body), 201, headers)
      if (body.kind === 'habit_log')
        return jsonResponse(await logHabit(pool, person.id, body), 201, headers)
      if (body.kind === 'wellbeing')
        return jsonResponse(await recordWellbeingCheck(pool, person.id, body), 201, headers)
      if (body.kind === 'milestone')
        return jsonResponse(await createGrowthMilestone(pool, person.id, body), 201, headers)
    }

    if (req.method === 'PATCH') {
      const parsed = await readJsonBody(req)
      if (!parsed.ok)
        return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
      const validated = validateBody(PatchSchema, parsed.raw)
      if (!validated.ok)
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)
      const body = validated.data
      if (body.kind === 'plan_status')
        return jsonResponse(
          await updateLifePlanStatus(pool, person.id, body.id, body.status),
          200,
          headers,
        )
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) return jsonResponse(toErrorBody(err), err.status, headers)
    throw err
  }
}
