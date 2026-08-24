// api/domains/career-interview.ts — Phòng Luyện Phỏng Vấn (trụ CAREER), chạy AI THẬT.
//
// [2026-08-24, Đợt 2] Trước đây toàn bộ phòng phỏng vấn là mô phỏng giả ở client (3 câu hỏi
// cứng + điểm 8.5 cứng). Nay câu hỏi và nhận xét đều do model thật sinh — nghĩa là đây là
// ĐƯỜNG AI TRẢ TIỀN, nên bắt buộc có rate-limit + đếm lượt + hoàn lượt khi không dùng được AI
// (đúng khuôn /api/debate-arena và luật CLAUDE.md mục 7).
//
// POST ?action=start    → tạo phiên, sinh bộ câu hỏi theo hồ sơ thật. Trừ 1 lượt 'chat'.
// POST ?action=answer   → chấm 1 câu trả lời, mở câu kế tiếp. Trừ 1 lượt 'chat'.
// GET                   → phiên gần nhất (để người dùng xem lại buổi luyện trước).
//
// Phiên lưu ở platform.feature_state (theo user) — cùng khuôn đã dùng ở Đợt 1, không cần bảng mới.

import { z } from 'zod'
import { getPgPool } from '@dhcb/core-db/pgPool'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { checkAndConsumeUsage, refundUsage } from '@dhcb/core-billing/usage'
import { getOrCreatePerson } from '@dhcb/core-personal/personService'
import { getOrCreateCareerProfile, listCareerGoals } from '@dhcb/core-domains/careerService'
import { CareerInterviewService, type InterviewContext } from '@dhcb/core-ai/careerInterviewService'
import {
  InterviewKindSchema,
  CAREER_INTERVIEW_SCHEMA_VERSION,
  type InterviewSession,
} from '@dhcb/core-contracts/careerInterview'
import { getFeatureState, setFeatureState } from '@dhcb/core-db/featureState'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'

const FEATURE = 'career_interview'
const QUESTIONS_PER_SESSION = 3

const StartSchema = z.object({ kind: InterviewKindSchema }).strict()
const AnswerSchema = z
  .object({ questionId: z.string().min(1).max(100), answer: z.string().min(1).max(5000) })
  .strict()

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'career-interview'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/career-interview' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)

  try {
    const pool = getPgPool()
    const person = await getOrCreatePerson(pool, auth.userId)

    if (req.method === 'GET') {
      const session = await getFeatureState<InterviewSession>(auth.userId, FEATURE)
      return jsonResponse({ session }, 200, headers)
    }

    if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, headers)

    const action = new URL(req.url).searchParams.get('action')
    const parsed = await readJsonBody(req)
    if (!parsed.ok)
      return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)

    // Hồ sơ nghề nghiệp THẬT của người dùng — thứ làm câu hỏi bám đúng người, thay vì hỏi mẫu.
    const profile = await getOrCreateCareerProfile(pool, person.id)
    const goals = await listCareerGoals(pool, person.id, 'active')
    const ctx: InterviewContext = {
      targetRole: profile.targetRole || 'Chuyên viên',
      ...(profile.currentTitle ? { currentTitle: profile.currentTitle } : {}),
      yearsOfExperience: profile.yearsOfExperience,
      ...(profile.industry ? { industry: profile.industry } : {}),
      ...(goals[0]?.skillsRequired?.length ? { skillsRequired: goals[0].skillsRequired } : {}),
    }

    if (action === 'start') {
      const validated = validateBody(StartSchema, parsed.raw)
      if (!validated.ok)
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)
      const { kind } = validated.data

      // Trừ lượt TRƯỚC khi gọi model (server authoritative), hoàn lại nếu AI không chạy được.
      const gate = await checkAndConsumeUsage(auth.userId, 'chat')
      if (!gate.ok) {
        logSecurityEvent('USAGE_LIMIT', clientIp, { path: '/api/career-interview' })
        return jsonResponse({ error: gate.message }, 429, headers)
      }

      const aiQuestions = await CareerInterviewService.generateQuestions(
        ctx,
        kind,
        QUESTIONS_PER_SESSION,
      )
      // Không gọi được AI → người dùng nhận bộ câu hỏi mặc định và KHÔNG bị tính lượt.
      if (!aiQuestions) await refundUsage(auth.userId, 'chat', gate.day).catch(() => {})

      const questions = aiQuestions ?? CareerInterviewService.fallbackQuestions(ctx, kind)
      const now = new Date().toISOString()
      const session: InterviewSession = {
        id: crypto.randomUUID(),
        personId: person.id,
        kind,
        targetRole: ctx.targetRole,
        turns: questions.map((question) => ({ question })),
        createdAt: now,
        updatedAt: now,
        schemaVersion: CAREER_INTERVIEW_SCHEMA_VERSION,
      }
      await setFeatureState(auth.userId, FEATURE, session)
      return jsonResponse({ session, isFallback: !aiQuestions }, 200, headers)
    }

    if (action === 'answer') {
      const validated = validateBody(AnswerSchema, parsed.raw)
      if (!validated.ok)
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)
      const { questionId, answer } = validated.data

      const session = await getFeatureState<InterviewSession>(auth.userId, FEATURE)
      if (!session) return jsonResponse({ error: 'Chưa có phiên phỏng vấn nào' }, 404, headers)

      const turnIndex = session.turns.findIndex((t) => t.question.id === questionId)
      const turn = session.turns[turnIndex]
      if (!turn) return jsonResponse({ error: 'Không tìm thấy câu hỏi' }, 404, headers)

      const gate = await checkAndConsumeUsage(auth.userId, 'chat')
      if (!gate.ok) {
        logSecurityEvent('USAGE_LIMIT', clientIp, { path: '/api/career-interview' })
        return jsonResponse({ error: gate.message }, 429, headers)
      }

      const aiFeedback = await CareerInterviewService.evaluateAnswer({
        ctx,
        kind: session.kind,
        question: turn.question.question,
        answer,
      })
      // Chưa chấm được thì không được tính tiền lượt đó.
      if (!aiFeedback) await refundUsage(auth.userId, 'chat', gate.day).catch(() => {})

      const feedback = aiFeedback ?? CareerInterviewService.fallbackFeedback()
      session.turns[turnIndex] = {
        question: turn.question,
        answer,
        feedback,
        answeredAt: new Date().toISOString(),
      }
      session.updatedAt = new Date().toISOString()
      await setFeatureState(auth.userId, FEATURE, session)

      return jsonResponse({ session, feedback, isFallback: feedback.isFallback }, 200, headers)
    }

    return jsonResponse({ error: 'action không hợp lệ' }, 400, headers)
  } catch (err: unknown) {
    if (isAppError(err)) return jsonResponse(toErrorBody(err), err.status, headers)
    const message = err instanceof Error ? err.message : String(err)
    return jsonResponse({ error: 'Internal server error', message }, 500, headers)
  }
}
