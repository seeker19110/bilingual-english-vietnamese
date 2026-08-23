// api/career.ts — V2-13 Career Domain API.
// Quản lý hồ sơ sự nghiệp, kinh nghiệm, mục tiêu và phân tích khoảng cách kỹ năng (Skill Gap).
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
  getOrCreateCareerProfile,
  updateCareerProfile,
  addCareerExperience,
  listCareerExperiences,
  createCareerGoal,
  listCareerGoals,
  analyzeCareerSkillGap,
} from '@dhcb/core-domains/careerService'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'
import { UuidSchema } from '@dhcb/core-contracts/shared'

const PostCareerSchema = z.discriminatedUnion('resource', [
  z
    .object({
      resource: z.literal('profile'),
      targetRole: z.string().min(1).max(200),
      currentTitle: z.string().max(200).optional(),
      yearsOfExperience: z.number().int().nonnegative(),
      industry: z.string().max(200).optional(),
      targetSalaryMin: z.number().nonnegative().optional(),
      targetSalaryMax: z.number().nonnegative().optional(),
      currency: z.string().default('VND'),
    })
    .strict(),
  z
    .object({
      resource: z.literal('experience'),
      company: z.string().min(1).max(200),
      role: z.string().min(1).max(200),
      startDate: z.string().min(1).max(50),
      endDate: z.string().max(50).optional(),
      isCurrent: z.boolean().optional(),
      achievements: z.array(z.string().min(1).max(500)).optional(),
    })
    .strict(),
  z
    .object({
      resource: z.literal('goal'),
      targetTitle: z.string().min(1).max(200),
      targetCompanyType: z.string().max(200).optional(),
      timeframe: z.string().max(100).optional(),
      skillsRequired: z.array(z.string().min(1).max(100)).min(1),
    })
    .strict(),
])

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'career'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/career' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  }

  try {
    const pool = getPgPool()
    const person = await getOrCreatePerson(pool, auth.userId)

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const resource = url.searchParams.get('resource') ?? 'profile'

      if (resource === 'profile') {
        const profile = await getOrCreateCareerProfile(pool, person.id)
        return jsonResponse({ profile }, 200, headers)
      }

      if (resource === 'experiences') {
        const experiences = await listCareerExperiences(pool, person.id)
        return jsonResponse({ experiences }, 200, headers)
      }

      if (resource === 'goals') {
        const status = url.searchParams.get('status') ?? undefined
        const goals = await listCareerGoals(pool, person.id, status)
        return jsonResponse({ goals }, 200, headers)
      }

      if (resource === 'skill_gap') {
        const goalId = url.searchParams.get('goalId')
        const goalIdParsed = UuidSchema.safeParse(goalId)
        if (!goalIdParsed.success) {
          return jsonResponse({ error: 'goalId phải là UUID hợp lệ' }, 400, headers)
        }
        const analysis = await analyzeCareerSkillGap(
          pool,
          person.id,
          goalIdParsed.data,
          auth.userId,
        )
        return jsonResponse({ analysis }, 200, headers)
      }

      return jsonResponse({ error: 'resource không hợp lệ' }, 400, headers)
    }

    if (req.method === 'POST') {
      const bodyParsed = await readJsonBody(req)
      if (!bodyParsed.ok) {
        return jsonResponse(bodyParsed.error, bodyParsed.error.status, headers)
      }
      const validation = validateBody(PostCareerSchema, bodyParsed.raw)
      if (!validation.ok) {
        return jsonResponse(validation.error, validation.error.status, headers)
      }

      const data = validation.data
      if (data.resource === 'profile') {
        const profile = await updateCareerProfile(pool, person.id, data)
        return jsonResponse({ profile }, 200, headers)
      }

      if (data.resource === 'experience') {
        const experience = await addCareerExperience(pool, person.id, data)
        return jsonResponse({ experience }, 201, headers)
      }

      if (data.resource === 'goal') {
        const goal = await createCareerGoal(pool, person.id, data)
        return jsonResponse({ goal }, 201, headers)
      }
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
