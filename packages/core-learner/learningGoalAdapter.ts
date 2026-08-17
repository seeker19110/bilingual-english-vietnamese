// Adapter V2-05: Learning giữ source of truth; Life Graph chỉ là projection/read view.
import type { Pool } from 'pg'
import { GoalSchema, GOAL_SCHEMA_VERSION, type Goal } from '../core-contracts/goal.js'
import { ConflictError, NotFoundError } from '../core-errors/appError.js'
import { getOrCreatePerson } from '../core-personal/personService.js'
import {
  getLearningGoalSourceId,
  getNode,
  upsertLearningGoalProjection,
} from '../core-personal/lifeGraphService.js'

interface LearningGoalRow {
  id: string
  onboarded: boolean
  goal: string | null
  daily_minutes: number | null
  created_at: Date
}

async function readSource(pool: Pool, userId: string): Promise<LearningGoalRow> {
  const { rows } = await pool.query<LearningGoalRow>(
    `select id, onboarded, goal, daily_minutes, created_at
     from public.profiles where id = $1`,
    [userId],
  )
  const row = rows[0]
  if (!row || !row.onboarded) throw new NotFoundError('Người dùng chưa có learning goal đã chọn')
  if (!row.goal || !row.daily_minutes || row.daily_minutes <= 0) {
    throw new ConflictError('Learning goal nguồn không hợp lệ để backfill')
  }
  return row
}

function toLearningGoal(row: LearningGoalRow, nodeId: string, nodeCreatedAt: string): Goal {
  return GoalSchema.parse({
    id: nodeId,
    learnerId: row.id,
    label: row.goal,
    targetMinutesPerDay: row.daily_minutes,
    status: 'active',
    createdAt: nodeCreatedAt,
    schemaVersion: GOAL_SCHEMA_VERSION,
  })
}

/** Backfill idempotent đúng goal onboarding hiện tại của một user đã xác thực. */
export async function backfillCurrentLearningGoal(
  pool: Pool,
  userId: string,
): Promise<{ nodeId: string; learningGoal: Goal }> {
  const source = await readSource(pool, userId)
  const person = await getOrCreatePerson(pool, userId)
  const projection = await upsertLearningGoalProjection(pool, {
    personId: person.id,
    sourceId: source.id,
    label: source.goal as string,
  })
  return {
    nodeId: projection.node.id,
    learningGoal: toLearningGoal(source, projection.node.id, projection.node.createdAt),
  }
}

/** Goal Graph read view: node xác định goal; payload Learning luôn đọc lại từ source thật. */
export async function readLearningGoalFromLifeGraph(
  pool: Pool,
  userId: string,
  nodeId: string,
): Promise<Goal> {
  const person = await getOrCreatePerson(pool, userId)
  const node = await getNode(pool, person.id, nodeId)
  if (node.value.type !== 'Goal') throw new ConflictError('Node không phải Goal')
  const sourceId = await getLearningGoalSourceId(pool, person.id, nodeId)
  if (sourceId !== userId) throw new NotFoundError('Goal không thuộc người dùng')
  const source = await readSource(pool, sourceId)
  if (node.value.label !== source.goal) {
    throw new ConflictError('Goal projection đã lệch nghĩa so với nguồn Learning')
  }
  return toLearningGoal(source, node.value.id, node.value.createdAt)
}
