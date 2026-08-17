import { describe, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'
import { ConflictError, NotFoundError } from '../core-errors/appError.js'
import {
  createEdge,
  createNode,
  softDeleteNode,
  transitionGoalStatus,
  updateNode,
  upsertLearningGoalProjection,
  validateGraphIntegrity,
} from './lifeGraphService.js'

const NOW = new Date('2026-08-17T00:00:00Z')
const PERSON = '11111111-1111-4111-8111-111111111111'
const NODE = '22222222-2222-4222-8222-222222222222'
const NODE_2 = '33333333-3333-4333-8333-333333333333'
const EDGE = '44444444-4444-4444-8444-444444444444'
const GOAL = '55555555-5555-4555-8555-555555555555'

function nodeRow(over: Record<string, unknown> = {}) {
  return {
    id: NODE,
    person_id: PERSON,
    type: 'Project',
    label: 'Dự án',
    version: 1,
    created_at: NOW,
    updated_at: NOW,
    archived_at: null,
    ...over,
  }
}
function edgeRow(over: Record<string, unknown> = {}) {
  return {
    id: EDGE,
    person_id: PERSON,
    from_node_id: NODE,
    to_node_id: NODE_2,
    relation: 'supports',
    provenance: 'user_declared',
    version: 1,
    created_at: NOW,
    archived_at: null,
    ...over,
  }
}
function goalRow(over: Record<string, unknown> = {}) {
  return {
    id: GOAL,
    person_id: PERSON,
    node_id: NODE,
    label: 'work',
    status: 'active',
    target_date: null,
    version: 1,
    created_at: NOW,
    updated_at: NOW,
    ...over,
  }
}

function mockPool(handler: (sql: string, params: unknown[]) => unknown[]) {
  const query = vi.fn(async (sql: string, params: unknown[] = []) => {
    const command = sql.trim().toLowerCase()
    if (command === 'begin' || command === 'commit' || command === 'rollback') return { rows: [] }
    return { rows: handler(sql, params) }
  })
  const client = { query, release: vi.fn() }
  return { pool: { query, connect: vi.fn(async () => client) } as unknown as Pool, query }
}

describe('node service', () => {
  it('create node ghi audit và trả contract hiện có', async () => {
    const { pool, query } = mockPool((sql) =>
      sql.includes('insert into personal.life_graph_nodes') ? [nodeRow()] : [],
    )
    const result = await createNode(pool, { personId: PERSON, type: 'Project', label: 'Dự án' })
    expect(result.value.type).toBe('Project')
    expect(query.mock.calls.some(([sql]) => String(sql).includes('life_graph_audit_log'))).toBe(
      true,
    )
  })

  it('create Goal node đồng thời tạo LifeGoal detail trong cùng transaction', async () => {
    const { pool, query } = mockPool((sql) => {
      if (sql.includes('insert into personal.life_graph_nodes'))
        return [nodeRow({ type: 'Goal', label: 'work' })]
      if (sql.includes('insert into personal.life_goals')) return [goalRow()]
      return []
    })
    await createNode(pool, { personId: PERSON, type: 'Goal', label: 'work' })
    expect(
      query.mock.calls.some(([sql]) => String(sql).includes('insert into personal.life_goals')),
    ).toBe(true)
  })

  it('update dùng expectedVersion, mismatch trả 409', async () => {
    const { pool } = mockPool((sql) =>
      sql.includes('for update') ? [nodeRow({ version: 2 })] : [],
    )
    await expect(
      updateNode(pool, PERSON, NODE, { label: 'Mới', expectedVersion: 1 }),
    ).rejects.toBeInstanceOf(ConflictError)
  })

  it('soft delete archive node và edge, không hard delete', async () => {
    const { pool, query } = mockPool((sql) => {
      if (sql.includes('for update')) return [nodeRow()]
      if (sql.includes('update personal.life_graph_edges'))
        return [edgeRow({ archived_at: NOW, version: 2 })]
      if (sql.includes('update personal.life_graph_nodes'))
        return [nodeRow({ archived_at: NOW, version: 2 })]
      return []
    })
    await softDeleteNode(pool, PERSON, NODE, 1)
    expect(
      query.mock.calls.some(([sql]) => String(sql).toLowerCase().includes('delete from')),
    ).toBe(false)
    expect(query.mock.calls.some(([sql]) => String(sql).includes('archived_at = now()'))).toBe(true)
  })
})

describe('edge integrity và ownership', () => {
  it('orphan hoặc cross-user endpoint bị coi như không tồn tại', async () => {
    const { pool, query } = mockPool((sql) => (sql.includes('id = any') ? [nodeRow()] : []))
    await expect(
      createEdge(pool, {
        personId: PERSON,
        fromNodeId: NODE,
        toNodeId: NODE_2,
        relation: 'supports',
        provenance: 'test',
      }),
    ).rejects.toBeInstanceOf(NotFoundError)
    expect(query.mock.calls.some(([, params]) => (params as unknown[])?.[0] === PERSON)).toBe(true)
  })

  it('đủ hai endpoint cùng owner thì tạo edge', async () => {
    const { pool } = mockPool((sql) => {
      if (sql.includes('id = any')) return [nodeRow(), nodeRow({ id: NODE_2 })]
      if (sql.includes('insert into personal.life_graph_edges')) return [edgeRow()]
      return []
    })
    expect(
      (
        await createEdge(pool, {
          personId: PERSON,
          fromNodeId: NODE,
          toNodeId: NODE_2,
          relation: 'supports',
          provenance: 'test',
        })
      ).value.id,
    ).toBe(EDGE)
  })

  it('validator trả issue từ DB audit query', async () => {
    const { pool } = mockPool(() => [{ id: EDGE, issue: 'orphan_edge' }])
    expect(await validateGraphIntegrity(pool, PERSON)).toEqual([
      { code: 'orphan_edge', entityId: EDGE },
    ])
  })
})

describe('Goal lifecycle', () => {
  it('active → achieved hợp lệ', async () => {
    const { pool } = mockPool((sql) => {
      if (sql.includes('for update')) return [goalRow()]
      if (sql.includes('update personal.life_goals'))
        return [goalRow({ status: 'achieved', version: 2 })]
      return []
    })
    expect((await transitionGoalStatus(pool, PERSON, NODE, 'achieved', 1)).value.status).toBe(
      'achieved',
    )
  })

  it('achieved là terminal, không quay lại active', async () => {
    const { pool } = mockPool((sql) =>
      sql.includes('for update') ? [goalRow({ status: 'achieved' })] : [],
    )
    await expect(transitionGoalStatus(pool, PERSON, NODE, 'active', 1)).rejects.toBeInstanceOf(
      ConflictError,
    )
  })
})

describe('Learning Goal projection', () => {
  it('source đã tồn tại → trả cùng node, không insert trùng (idempotent)', async () => {
    const existing = {
      ...goalRow(),
      node_label: 'work',
      node_created_at: NOW,
      node_updated_at: NOW,
      node_archived_at: null,
    }
    const { pool, query } = mockPool((sql) => {
      if (sql.includes('from personal.persons')) return [{ id: PERSON }]
      if (sql.includes('from personal.life_goal_sources')) return [existing]
      return []
    })
    const result = await upsertLearningGoalProjection(pool, {
      personId: PERSON,
      sourceId: 'learner-1',
      label: 'work',
    })
    expect(result.node.id).toBe(NODE)
    expect(
      query.mock.calls.some(([sql]) =>
        String(sql).includes('insert into personal.life_graph_nodes'),
      ),
    ).toBe(false)
  })

  it('khóa Person trước khi kiểm source để serialize concurrent backfill', async () => {
    const { pool, query } = mockPool((sql) => {
      if (sql.includes('from personal.persons')) return [{ id: PERSON }]
      if (sql.includes('insert into personal.life_graph_nodes'))
        return [nodeRow({ type: 'Goal', label: 'work' })]
      if (sql.includes('insert into personal.life_goals')) return [goalRow()]
      return []
    })
    await upsertLearningGoalProjection(pool, {
      personId: PERSON,
      sourceId: 'learner-1',
      label: 'work',
    })
    const ownerLock = query.mock.calls.findIndex(([sql]) =>
      String(sql).includes('from personal.persons'),
    )
    const sourceRead = query.mock.calls.findIndex(([sql]) =>
      String(sql).includes('from personal.life_goal_sources'),
    )
    expect(ownerLock).toBeGreaterThanOrEqual(0)
    expect(ownerLock).toBeLessThan(sourceRead)
  })
})
