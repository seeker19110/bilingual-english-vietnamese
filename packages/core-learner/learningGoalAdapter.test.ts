import { beforeEach, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const USER_ID = '22222222-2222-4222-8222-222222222222'
const NODE_ID = '33333333-3333-4333-8333-333333333333'
const getOrCreatePerson = vi.fn()
const upsertLearningGoalProjection = vi.fn()
const getNode = vi.fn()
const getLearningGoalSourceId = vi.fn()
vi.mock('../core-personal/personService.js', () => ({
  getOrCreatePerson: (...a: unknown[]) => getOrCreatePerson(...a),
}))
vi.mock('../core-personal/lifeGraphService.js', () => ({
  upsertLearningGoalProjection: (...a: unknown[]) => upsertLearningGoalProjection(...a),
  getNode: (...a: unknown[]) => getNode(...a),
  getLearningGoalSourceId: (...a: unknown[]) => getLearningGoalSourceId(...a),
}))
import {
  backfillCurrentLearningGoal,
  readLearningGoalFromLifeGraph,
} from './learningGoalAdapter.js'

const node = {
  id: NODE_ID,
  personId: PERSON_ID,
  type: 'Goal',
  label: 'work',
  createdAt: '2026-08-17T00:00:00.000Z',
  updatedAt: '2026-08-17T00:00:00.000Z',
  schemaVersion: 1,
}
const sourceRow: {
  id: string
  onboarded: boolean
  goal: string | null
  daily_minutes: number | null
  created_at: Date
} = {
  id: USER_ID,
  onboarded: true,
  goal: 'work',
  daily_minutes: 20,
  created_at: new Date('2026-01-01T00:00:00Z'),
}

beforeEach(() => {
  vi.clearAllMocks()
  getOrCreatePerson.mockResolvedValue({ id: PERSON_ID })
  upsertLearningGoalProjection.mockResolvedValue({ node, goal: { id: 'goal' } })
  getNode.mockResolvedValue({ value: node, version: 1 })
  getLearningGoalSourceId.mockResolvedValue(USER_ID)
})

function poolWith(row = sourceRow): Pool {
  return { query: vi.fn(async () => ({ rows: [row] })) } as unknown as Pool
}

it('backfill chạy lại dùng cùng projection và không sửa nguồn', async () => {
  const pool = poolWith()
  const first = await backfillCurrentLearningGoal(pool, USER_ID)
  const second = await backfillCurrentLearningGoal(pool, USER_ID)
  expect(first.nodeId).toBe(NODE_ID)
  expect(second.nodeId).toBe(NODE_ID)
  expect(first.learningGoal).toEqual(second.learningGoal)
  expect(upsertLearningGoalProjection).toHaveBeenCalledTimes(2)
  expect(
    vi.mocked(pool.query).mock.calls.every(([sql]) => String(sql).trim().startsWith('select')),
  ).toBe(true)
})

it('round-trip giữ nguyên label và targetMinutesPerDay', async () => {
  const pool = poolWith()
  const backfilled = await backfillCurrentLearningGoal(pool, USER_ID)
  const readView = await readLearningGoalFromLifeGraph(pool, USER_ID, NODE_ID)
  expect(readView).toEqual(backfilled.learningGoal)
  expect(readView).toMatchObject({
    learnerId: USER_ID,
    label: 'work',
    targetMinutesPerDay: 20,
    status: 'active',
  })
})

it('projection lệch label nguồn bị chặn, không âm thầm đổi nghĩa', async () => {
  getNode.mockResolvedValue({ value: { ...node, label: 'travel' }, version: 1 })
  await expect(readLearningGoalFromLifeGraph(poolWith(), USER_ID, NODE_ID)).rejects.toThrow(
    'lệch nghĩa',
  )
})

it('profile chưa onboarding không được backfill default giả', async () => {
  await expect(
    backfillCurrentLearningGoal(poolWith({ ...sourceRow, onboarded: false }), USER_ID),
  ).rejects.toThrow('chưa có learning goal')
})

it('chặn backfill nếu goal hoặc daily_minutes không hợp lệ', async () => {
  await expect(
    backfillCurrentLearningGoal(poolWith({ ...sourceRow, goal: null }), USER_ID),
  ).rejects.toThrow('Learning goal nguồn không hợp lệ để backfill')

  await expect(
    backfillCurrentLearningGoal(poolWith({ ...sourceRow, daily_minutes: 0 }), USER_ID),
  ).rejects.toThrow('Learning goal nguồn không hợp lệ để backfill')
})

it('chặn readLearningGoalFromLifeGraph nếu node không phải Goal hoặc không thuộc người dùng', async () => {
  getNode.mockResolvedValueOnce({ value: { ...node, type: 'Skill' }, version: 1 })
  await expect(readLearningGoalFromLifeGraph(poolWith(), USER_ID, NODE_ID)).rejects.toThrow(
    'Node không phải Goal',
  )

  getNode.mockResolvedValueOnce({ value: node, version: 1 })
  getLearningGoalSourceId.mockResolvedValueOnce('different-user-id')
  await expect(readLearningGoalFromLifeGraph(poolWith(), USER_ID, NODE_ID)).rejects.toThrow(
    'Goal không thuộc người dùng',
  )
})
