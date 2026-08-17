// packages/core-learner/learningReadModelService.ts — V2-11 Learning Domain Read Model Service.
// Encapsulates Learning domain state & exposes typed Read Model for Companion & Context Engine.
import type { Pool } from 'pg'
import {
  LearningReadModelSchema,
  LEARNING_READ_MODEL_SCHEMA_VERSION,
  type LearningReadModel,
} from '../core-contracts/learningReadModel.js'
import {
  CefrLevelSchema,
  DirectionSchema,
  type ContractDirection,
  type ContractCefrLevel,
} from '../core-contracts/shared.js'

export interface GetLearningReadModelOptions {
  personId: string
  userId: string
  subject?: string
}

interface ProfileRow {
  onboarded: boolean
  goal: string | null
  daily_minutes: number | null
}

interface ProgressRow {
  settings: unknown
  placement: unknown
  stats: unknown
  updated_at: Date
}

function parseDirection(settings: unknown): ContractDirection {
  if (settings && typeof settings === 'object' && 'direction' in settings) {
    const result = DirectionSchema.safeParse((settings as { direction?: unknown }).direction)
    if (result.success) return result.data
  }
  return 'A'
}

function parseCurrentLevel(placement: unknown): ContractCefrLevel | null {
  if (placement && typeof placement === 'object' && 'cefr' in placement) {
    const result = CefrLevelSchema.safeParse((placement as { cefr?: unknown }).cefr)
    if (result.success) return result.data
  }
  return null
}

/**
 * Returns a strongly-typed Learning Domain Read Model for a learner.
 */
export async function getLearningReadModel(
  pool: Pool,
  options: GetLearningReadModelOptions,
): Promise<LearningReadModel> {
  const { personId, userId, subject = 'english' } = options

  // Query profiles for onboarding / goal info
  const profileRes = await pool.query<ProfileRow>(
    `select onboarded, goal, daily_minutes from public.profiles where id = $1`,
    [userId],
  )
  const profile = profileRes.rows[0]

  // Query learning_progress for settings, placement, stats
  const progressRes = await pool.query<ProgressRow>(
    `select settings, placement, stats, updated_at from english.learning_progress where user_id = $1`,
    [userId],
  )
  const progress = progressRes.rows[0]

  const direction = parseDirection(progress?.settings)
  const currentLevel = parseCurrentLevel(progress?.placement)
  const onboarded = Boolean(profile?.onboarded)
  const activeGoal = profile?.goal ?? null
  const dailyMinutes = profile?.daily_minutes ?? 15

  // Daily speed from settings or default 10
  const dailySpeed =
    progress?.settings && typeof progress.settings === 'object' && 'dailySpeed' in progress.settings
      ? Number((progress.settings as { dailySpeed?: unknown }).dailySpeed) || 10
      : 10

  // Count SRS items due (if any)
  let srsDueCount = 0
  let masteredCount = 0
  let inProgressCount = 0
  let dueForReviewCount = 0

  if (progress?.stats && typeof progress.stats === 'object') {
    const stats = progress.stats as Record<string, unknown>
    masteredCount = Number(stats.masteredCount) || 0
    inProgressCount = Number(stats.inProgressCount) || 0
    dueForReviewCount = Number(stats.dueForReviewCount) || 0
    srsDueCount = Number(stats.srsDueCount) || dueForReviewCount
  }

  const updatedAt = progress?.updated_at
    ? progress.updated_at.toISOString()
    : new Date().toISOString()

  return LearningReadModelSchema.parse({
    personId,
    subject,
    direction,
    currentLevel,
    dailySpeed,
    dailyMinutes,
    onboarded,
    activeGoal,
    masterySummary: {
      masteredCount,
      inProgressCount,
      dueForReviewCount,
    },
    recentEvidenceCount: masteredCount + inProgressCount,
    srsDueCount,
    updatedAt,
    schemaVersion: LEARNING_READ_MODEL_SCHEMA_VERSION,
  })
}

/**
 * Formats a LearningReadModel into a high-signal text snippet for Context Engine.
 */
export function formatLearningReadModelForContext(model: LearningReadModel): string {
  const parts: string[] = [
    `[Domain: Learning | Subject: ${model.subject}]`,
    `Level: ${model.currentLevel ?? 'Chưa xác định'}`,
    `Direction: ${model.direction === 'A' ? 'EN -> VI' : 'VI -> EN'}`,
    `Speed: ${model.dailySpeed} từ/ngày (${model.dailyMinutes} phút/ngày)`,
  ]

  if (model.activeGoal) {
    parts.push(`Mục tiêu: "${model.activeGoal}"`)
  }

  if (model.srsDueCount > 0) {
    parts.push(`SRS cần ôn: ${model.srsDueCount} từ`)
  }

  if (model.masterySummary.masteredCount > 0) {
    parts.push(`Đã thành thạo: ${model.masterySummary.masteredCount} từ`)
  }

  return parts.join(' | ')
}
