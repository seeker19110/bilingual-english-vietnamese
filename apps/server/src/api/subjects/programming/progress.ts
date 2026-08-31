// api/subjects/programming/progress.ts — Tiến độ bài học môn LẬP TRÌNH (PR-L3).
//
// GET  /api/programming/progress → { state: {currentLevel, projectTrack}, lessons: [{lessonId, status, completedAt}] }
// POST /api/programming/progress  body { lessonId, status } → upsert 1 dòng tiến độ; hoàn
//      thành thì giữ nguyên completed (không hạ cấp về in_progress khi học lại).
//
// Bảng: programming.learner_state + programming.lesson_progress (migration 0064).
// lessonId là khoá từ dữ liệu giáo trình (packages/subject-programming/lessons.ts) — server
// kiểm tồn tại thật qua getLesson() để không ghi rác.
import { z } from 'zod'
import { getPgPool } from '@dhcb/core-db/pgPool'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp, internalErrorResponse } from '@dhcb/core-http/http'
import { getLesson } from '@dhcb/subject-programming/lessons'
import { getProjectStep } from '@dhcb/subject-programming/projectSteps'
import { getSpecStage } from '@dhcb/subject-programming/specializations/registry'
import { getSpecStageDetail } from '@dhcb/subject-programming/specializations/stageDetails'

const UpdateSchema = z
  .object({
    // Bốn loại khoá dùng CHUNG một bảng tiến độ:
    //  · bài học xương sống          'p1-u4-l1'
    //  · bước dự án trục             'p1-s1'
    //  · module/tiêu chí hướng chuyên sâu 'web-s2-m1' / 'web-s2-r3' (chi tiết chặng S2)
    //  · bài thuộc khoá NGẮN (cắt ngang bậc: khoá Git, khoá Hermes)  'git-u2-l1' / 'hermes-u1-l1'
    lessonId: z
      .string()
      .regex(
        /^(p[1-6]-(u\d+-l\d+|s\d+)|[a-z]+-s[1-4]-[mr]\d+|(git|hermes|vibe|openclaw|ml)-u\d+-l\d+)$/,
      ),
    status: z.enum(['in_progress', 'completed']),
  })
  .strict()

/**
 * Khoá tiến độ của tầng HƯỚNG CHUYÊN SÂU có thật hay không.
 * 'web-s2-m1' → module phải có trong bản đồ chặng; 'web-s2-r3' → tiêu chí phải có trong
 * chi tiết chặng. Kiểm để không ghi khoá rác vào bảng tiến độ.
 */
function isSpecProgressKey(id: string): boolean {
  const stageId = id.split('-').slice(0, 2).join('-')
  const stage = getSpecStage(stageId)
  if (!stage) return false
  if (stage.modules.some((m) => m.id === id)) return true
  return getSpecStageDetail(stageId)?.rubric.some((r) => r.id === id) ?? false
}

interface LessonRow {
  lesson_id: string
  status: 'in_progress' | 'completed'
  completed_at: Date | null
}

interface StateRow {
  current_level: string
  project_track: string
}

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'programming-progress'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/programming/progress' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)

  const pool = getPgPool()
  try {
    if (req.method === 'GET') {
      const [stateRes, lessonsRes] = await Promise.all([
        pool.query<StateRow>(
          'select current_level, project_track from programming.learner_state where user_id = $1',
          [auth.userId],
        ),
        pool.query<LessonRow>(
          'select lesson_id, status, completed_at from programming.lesson_progress where user_id = $1',
          [auth.userId],
        ),
      ])
      const state = stateRes.rows[0]
      return jsonResponse(
        {
          state: {
            currentLevel: state?.current_level ?? 'p1',
            projectTrack: state?.project_track ?? 'T1',
          },
          lessons: lessonsRes.rows.map((r) => ({
            lessonId: r.lesson_id,
            status: r.status,
            completedAt: r.completed_at ? r.completed_at.getTime() : null,
          })),
        },
        200,
        headers,
      )
    }

    if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, headers)

    const parsed = await readJsonBody(req)
    if (!parsed.ok)
      return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
    const validated = validateBody(UpdateSchema, parsed.raw)
    if (!validated.ok)
      return jsonResponse({ error: validated.error.message }, validated.error.status, headers)

    const { lessonId, status } = validated.data
    if (!getLesson(lessonId) && !getProjectStep(lessonId) && !isSpecProgressKey(lessonId)) {
      return jsonResponse({ error: `Bài học "${lessonId}" không tồn tại` }, 400, headers)
    }

    // Đảm bảo có learner_state (lần chạm đầu tiên vào môn).
    await pool.query(
      `insert into programming.learner_state (user_id) values ($1)
       on conflict (user_id) do nothing`,
      [auth.userId],
    )
    // completed là trạng thái CHỐT: học lại bài không kéo lùi về in_progress.
    await pool.query(
      `insert into programming.lesson_progress (user_id, lesson_id, status, completed_at, updated_at)
       values ($1, $2, $3, case when $3 = 'completed' then now() end, now())
       on conflict (user_id, lesson_id) do update
         set status = case when programming.lesson_progress.status = 'completed'
                           then 'completed' else excluded.status end,
             completed_at = coalesce(programming.lesson_progress.completed_at, excluded.completed_at),
             updated_at = now()`,
      [auth.userId, lessonId, status],
    )
    return jsonResponse({ ok: true }, 200, headers)
  } catch (err: unknown) {
    return internalErrorResponse(err, headers, 'programming-progress')
  }
}
