// V2-05 Life Graph foundation. Tái sử dụng trực tiếp contract LifeGraph/LifeGoal hiện có.
import type { Pool, PoolClient } from 'pg'
import { withTransaction } from '../core-db/transaction.js'
import { ConflictError, NotFoundError, ValidationError } from '../core-errors/appError.js'
import {
  LifeGraphNodeSchema,
  LifeGraphEdgeSchema,
  LIFE_GRAPH_NODE_SCHEMA_VERSION,
  LIFE_GRAPH_EDGE_SCHEMA_VERSION,
  type LifeGraphNode,
  type LifeGraphNodeType,
  type LifeGraphEdge,
  type LifeRelation,
} from '../core-contracts/lifeGraph.js'
import {
  LifeGoalSchema,
  LIFE_GOAL_SCHEMA_VERSION,
  type LifeGoal,
} from '../core-contracts/lifeGoal.js'

type LifeGoalStatus = LifeGoal['status']

type Runner = Pick<Pool | PoolClient, 'query'>

interface NodeRow {
  id: string
  person_id: string
  type: string
  label: string
  version: number
  created_at: Date
  updated_at: Date
  archived_at: Date | null
}

interface EdgeRow {
  id: string
  person_id: string
  from_node_id: string
  to_node_id: string
  relation: string
  provenance: string
  version: number
  created_at: Date
  archived_at: Date | null
}

interface GoalRow {
  id: string
  person_id: string
  node_id: string
  label: string
  status: string
  target_date: Date | null
  version: number
  created_at: Date
  updated_at: Date
}

const NODE_COLUMNS = 'id, person_id, type, label, version, created_at, updated_at, archived_at'
const EDGE_COLUMNS =
  'id, person_id, from_node_id, to_node_id, relation, provenance, version, created_at, archived_at'
const GOAL_COLUMNS =
  'id, person_id, node_id, label, status, target_date, version, created_at, updated_at'

function toNode(row: NodeRow): LifeGraphNode {
  return LifeGraphNodeSchema.parse({
    id: row.id,
    personId: row.person_id,
    type: row.type,
    label: row.label,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    ...(row.archived_at ? { archivedAt: row.archived_at.toISOString() } : {}),
    schemaVersion: LIFE_GRAPH_NODE_SCHEMA_VERSION,
  })
}

function toEdge(row: EdgeRow): LifeGraphEdge {
  return LifeGraphEdgeSchema.parse({
    id: row.id,
    personId: row.person_id,
    fromNodeId: row.from_node_id,
    toNodeId: row.to_node_id,
    relation: row.relation,
    provenance: row.provenance,
    createdAt: row.created_at.toISOString(),
    ...(row.archived_at ? { archivedAt: row.archived_at.toISOString() } : {}),
    schemaVersion: LIFE_GRAPH_EDGE_SCHEMA_VERSION,
  })
}

function toGoal(row: GoalRow): LifeGoal {
  return LifeGoalSchema.parse({
    id: row.id,
    personId: row.person_id,
    nodeId: row.node_id,
    label: row.label,
    status: row.status,
    ...(row.target_date ? { targetDate: row.target_date.toISOString() } : {}),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    schemaVersion: LIFE_GOAL_SCHEMA_VERSION,
  })
}

async function audit(
  runner: Runner,
  personId: string,
  entityType: 'node' | 'edge' | 'goal',
  entityId: string,
  action: 'create' | 'update' | 'archive' | 'transition',
  beforeData: unknown,
  afterData: unknown,
): Promise<void> {
  await runner.query(
    `insert into personal.life_graph_audit_log
       (person_id, entity_type, entity_id, action, before_data, after_data)
     values ($1, $2, $3, $4, $5, $6)`,
    [personId, entityType, entityId, action, beforeData, afterData],
  )
}

export interface Versioned<T> {
  value: T
  version: number
}

export async function createNode(
  pool: Pool,
  input: { personId: string; type: LifeGraphNodeType; label: string },
): Promise<Versioned<LifeGraphNode>> {
  return withTransaction(pool, async (client) => {
    let rows: NodeRow[]
    try {
      ;({ rows } = await client.query<NodeRow>(
        `insert into personal.life_graph_nodes (person_id, type, label)
         values ($1, $2, $3) returning ${NODE_COLUMNS}`,
        [input.personId, input.type, input.label],
      ))
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictError('Node đang hiệu lực đã tồn tại')
      }
      throw err
    }
    const row = rows[0]
    if (!row) throw new Error('Không tạo được Life Graph node')
    const value = toNode(row)
    await audit(client, input.personId, 'node', row.id, 'create', null, value)
    if (input.type === 'Goal') {
      const goalResult = await client.query<GoalRow>(
        `insert into personal.life_goals (person_id, node_id, label)
         values ($1, $2, $3) returning ${GOAL_COLUMNS}`,
        [input.personId, row.id, input.label],
      )
      const goalRow = goalResult.rows[0]
      if (!goalRow) throw new Error('Không tạo được LifeGoal cho Goal node')
      await audit(client, input.personId, 'goal', goalRow.id, 'create', null, toGoal(goalRow))
    }
    return { value, version: row.version }
  })
}

export async function listNodes(
  runner: Runner,
  personId: string,
  options: { type?: LifeGraphNodeType; includeArchived?: boolean } = {},
): Promise<Array<Versioned<LifeGraphNode>>> {
  const params: unknown[] = [personId]
  const clauses = ['person_id = $1']
  if (!options.includeArchived) clauses.push('archived_at is null')
  if (options.type) {
    params.push(options.type)
    clauses.push(`type = $${params.length}`)
  }
  const { rows } = await runner.query<NodeRow>(
    `select ${NODE_COLUMNS} from personal.life_graph_nodes
     where ${clauses.join(' and ')} order by created_at, id`,
    params,
  )
  return rows.map((row) => ({ value: toNode(row), version: row.version }))
}

export async function getNode(
  runner: Runner,
  personId: string,
  nodeId: string,
  includeArchived = false,
): Promise<Versioned<LifeGraphNode>> {
  const { rows } = await runner.query<NodeRow>(
    `select ${NODE_COLUMNS} from personal.life_graph_nodes
     where id = $1 and person_id = $2 ${includeArchived ? '' : 'and archived_at is null'}`,
    [nodeId, personId],
  )
  const row = rows[0]
  if (!row) throw new NotFoundError('Không tìm thấy node')
  return { value: toNode(row), version: row.version }
}

export async function updateNode(
  pool: Pool,
  personId: string,
  nodeId: string,
  input: { label: string; expectedVersion: number },
): Promise<Versioned<LifeGraphNode>> {
  return withTransaction(pool, async (client) => {
    const locked = await client.query<NodeRow>(
      `select ${NODE_COLUMNS} from personal.life_graph_nodes
       where id = $1 and person_id = $2 for update`,
      [nodeId, personId],
    )
    const before = locked.rows[0]
    if (!before) throw new NotFoundError('Không tìm thấy node')
    if (before.archived_at) throw new ConflictError('Node đã bị lưu trữ')
    if (before.version !== input.expectedVersion) throw new ConflictError('Node đã được thay đổi')
    if (before.type === 'Goal') {
      const imported = await client.query(
        `select 1 from personal.life_goal_sources s
         join personal.life_goals g on g.id = s.goal_id
         where g.node_id = $1 and s.person_id = $2`,
        [nodeId, personId],
      )
      if (imported.rows.length > 0) {
        throw new ConflictError('Goal import từ Learning chỉ được đổi tại nguồn Learning')
      }
    }
    const { rows } = await client.query<NodeRow>(
      `update personal.life_graph_nodes
       set label = $1, version = version + 1, updated_at = now()
       where id = $2 and person_id = $3 returning ${NODE_COLUMNS}`,
      [input.label, nodeId, personId],
    )
    const after = rows[0]
    if (!after) throw new Error('Không cập nhật được node')
    const value = toNode(after)
    await audit(client, personId, 'node', nodeId, 'update', toNode(before), value)
    if (before.type === 'Goal') {
      const goals = await client.query<GoalRow>(
        `update personal.life_goals
         set label = $1, version = version + 1, updated_at = now()
         where node_id = $2 and person_id = $3 returning ${GOAL_COLUMNS}`,
        [input.label, nodeId, personId],
      )
      const goal = goals.rows[0]
      if (!goal) throw new Error('Goal node thiếu LifeGoal detail')
      await audit(client, personId, 'goal', goal.id, 'update', null, toGoal(goal))
    }
    return { value, version: after.version }
  })
}

export async function softDeleteNode(
  pool: Pool,
  personId: string,
  nodeId: string,
  expectedVersion: number,
): Promise<void> {
  await withTransaction(pool, async (client) => {
    const locked = await client.query<NodeRow>(
      `select ${NODE_COLUMNS} from personal.life_graph_nodes
       where id = $1 and person_id = $2 for update`,
      [nodeId, personId],
    )
    const before = locked.rows[0]
    if (!before) throw new NotFoundError('Không tìm thấy node')
    if (before.archived_at) throw new ConflictError('Node đã bị lưu trữ')
    if (before.version !== expectedVersion) throw new ConflictError('Node đã được thay đổi')

    const edgeRows = await client.query<EdgeRow>(
      `update personal.life_graph_edges set archived_at = now(), version = version + 1
       where person_id = $1 and archived_at is null
         and (from_node_id = $2 or to_node_id = $2)
       returning ${EDGE_COLUMNS}`,
      [personId, nodeId],
    )
    for (const edge of edgeRows.rows) {
      await audit(client, personId, 'edge', edge.id, 'archive', null, toEdge(edge))
    }

    const { rows } = await client.query<NodeRow>(
      `update personal.life_graph_nodes
       set archived_at = now(), version = version + 1, updated_at = now()
       where id = $1 and person_id = $2 returning ${NODE_COLUMNS}`,
      [nodeId, personId],
    )
    const after = rows[0]
    if (!after) throw new Error('Không lưu trữ được node')
    await audit(client, personId, 'node', nodeId, 'archive', toNode(before), toNode(after))
  })
}

export async function createEdge(
  pool: Pool,
  input: {
    personId: string
    fromNodeId: string
    toNodeId: string
    relation: LifeRelation
    provenance: string
  },
): Promise<Versioned<LifeGraphEdge>> {
  if (input.fromNodeId === input.toNodeId) throw new ValidationError('Self-loop không hợp lệ')
  return withTransaction(pool, async (client) => {
    const nodes = await client.query<NodeRow>(
      `select ${NODE_COLUMNS} from personal.life_graph_nodes
       where person_id = $1 and id = any($2::uuid[]) and archived_at is null for update`,
      [input.personId, [input.fromNodeId, input.toNodeId]],
    )
    if (nodes.rows.length !== 2) {
      throw new NotFoundError('Node không tồn tại, đã lưu trữ hoặc không thuộc người dùng')
    }
    try {
      const { rows } = await client.query<EdgeRow>(
        `insert into personal.life_graph_edges
           (person_id, from_node_id, to_node_id, relation, provenance)
         values ($1, $2, $3, $4, $5) returning ${EDGE_COLUMNS}`,
        [input.personId, input.fromNodeId, input.toNodeId, input.relation, input.provenance],
      )
      const row = rows[0]
      if (!row) throw new Error('Không tạo được edge')
      const value = toEdge(row)
      await audit(client, input.personId, 'edge', row.id, 'create', null, value)
      return { value, version: row.version }
    } catch (err) {
      if ((err as { code?: string }).code === '23505') throw new ConflictError('Edge đã tồn tại')
      throw err
    }
  })
}

export async function listEdges(
  runner: Runner,
  personId: string,
  includeArchived = false,
): Promise<Array<Versioned<LifeGraphEdge>>> {
  const { rows } = await runner.query<EdgeRow>(
    `select ${EDGE_COLUMNS} from personal.life_graph_edges
     where person_id = $1 ${includeArchived ? '' : 'and archived_at is null'}
     order by created_at, id`,
    [personId],
  )
  return rows.map((row) => ({ value: toEdge(row), version: row.version }))
}

export async function softDeleteEdge(
  pool: Pool,
  personId: string,
  edgeId: string,
  expectedVersion: number,
): Promise<void> {
  await withTransaction(pool, async (client) => {
    const locked = await client.query<EdgeRow>(
      `select ${EDGE_COLUMNS} from personal.life_graph_edges
       where id = $1 and person_id = $2 for update`,
      [edgeId, personId],
    )
    const before = locked.rows[0]
    if (!before) throw new NotFoundError('Không tìm thấy edge')
    if (before.archived_at) throw new ConflictError('Edge đã bị lưu trữ')
    if (before.version !== expectedVersion) throw new ConflictError('Edge đã được thay đổi')
    const { rows } = await client.query<EdgeRow>(
      `update personal.life_graph_edges set archived_at = now(), version = version + 1
       where id = $1 and person_id = $2 returning ${EDGE_COLUMNS}`,
      [edgeId, personId],
    )
    const after = rows[0]
    if (!after) throw new Error('Không lưu trữ được edge')
    await audit(client, personId, 'edge', edgeId, 'archive', toEdge(before), toEdge(after))
  })
}

const GOAL_TRANSITIONS: Record<LifeGoalStatus, readonly LifeGoalStatus[]> = {
  active: ['achieved', 'abandoned', 'blocked'],
  blocked: ['active', 'abandoned'],
  achieved: [],
  abandoned: [],
}

export async function transitionGoalStatus(
  pool: Pool,
  personId: string,
  nodeId: string,
  nextStatus: LifeGoalStatus,
  expectedVersion: number,
): Promise<Versioned<LifeGoal>> {
  return withTransaction(pool, async (client) => {
    const locked = await client.query<GoalRow>(
      `select ${GOAL_COLUMNS} from personal.life_goals
       where node_id = $1 and person_id = $2 for update`,
      [nodeId, personId],
    )
    const before = locked.rows[0]
    if (!before) throw new NotFoundError('Không tìm thấy goal')
    if (before.version !== expectedVersion) throw new ConflictError('Goal đã được thay đổi')
    const imported = await client.query(
      `select 1 from personal.life_goal_sources
       where goal_id = $1 and person_id = $2`,
      [before.id, personId],
    )
    if (imported.rows.length > 0) {
      throw new ConflictError('Goal import từ Learning chỉ được đổi tại nguồn Learning')
    }
    const current = before.status as LifeGoalStatus
    if (!GOAL_TRANSITIONS[current].includes(nextStatus)) {
      throw new ConflictError(`Không thể chuyển goal từ ${current} sang ${nextStatus}`)
    }
    const { rows } = await client.query<GoalRow>(
      `update personal.life_goals
       set status = $1, version = version + 1, updated_at = now()
       where node_id = $2 and person_id = $3 returning ${GOAL_COLUMNS}`,
      [nextStatus, nodeId, personId],
    )
    const after = rows[0]
    if (!after) throw new Error('Không cập nhật được goal')
    const value = toGoal(after)
    await audit(client, personId, 'goal', before.id, 'transition', toGoal(before), value)
    return { value, version: after.version }
  })
}

export interface IntegrityIssue {
  code: 'orphan_edge' | 'cross_person_edge' | 'invalid_goal_node' | 'archived_endpoint'
  entityId: string
}

export async function validateGraphIntegrity(
  runner: Runner,
  personId: string,
): Promise<IntegrityIssue[]> {
  const { rows } = await runner.query<{ id: string; issue: IntegrityIssue['code'] }>(
    `select e.id,
       case
         when f.id is null or t.id is null then 'orphan_edge'
         when f.person_id <> e.person_id or t.person_id <> e.person_id then 'cross_person_edge'
         else 'archived_endpoint'
       end as issue
     from personal.life_graph_edges e
     left join personal.life_graph_nodes f on f.id = e.from_node_id
     left join personal.life_graph_nodes t on t.id = e.to_node_id
     where e.person_id = $1 and e.archived_at is null
       and (f.id is null or t.id is null or f.person_id <> e.person_id
            or t.person_id <> e.person_id or f.archived_at is not null or t.archived_at is not null)
     union all
     select g.id, 'invalid_goal_node' as issue
     from personal.life_goals g
     left join personal.life_graph_nodes n on n.id = g.node_id
     where g.person_id = $1 and (n.id is null or n.person_id <> g.person_id or n.type <> 'Goal')`,
    [personId],
  )
  return rows.map((row) => ({ code: row.issue, entityId: row.id }))
}

export interface LearningGoalProjectionInput {
  personId: string
  sourceId: string
  label: string
}

/** Upsert idempotent projection của Goal Learning; không lưu targetMinutes hay payload nguồn. */
export async function upsertLearningGoalProjection(
  pool: Pool,
  input: LearningGoalProjectionInput,
): Promise<{ node: LifeGraphNode; goal: LifeGoal }> {
  return withTransaction(pool, async (client) => {
    // Serialize theo Person: hai backfill đồng thời không cùng thấy "chưa có" rồi đua insert.
    const owner = await client.query('select id from personal.persons where id = $1 for update', [
      input.personId,
    ])
    if (owner.rows.length === 0) throw new NotFoundError('Không tìm thấy Person')
    const existing = await client.query<
      GoalRow & {
        node_label: string
        node_created_at: Date
        node_updated_at: Date
        node_archived_at: Date | null
      }
    >(
      `select g.*, n.label as node_label, n.created_at as node_created_at,
              n.updated_at as node_updated_at, n.archived_at as node_archived_at
       from personal.life_goal_sources s
       join personal.life_goals g on g.id = s.goal_id
       join personal.life_graph_nodes n on n.id = g.node_id
       where s.person_id = $1 and s.source_domain = 'learning'
         and s.source_type = 'english_onboarding_goal' and s.source_id = $2
       for update of g, n`,
      [input.personId, input.sourceId],
    )
    const found = existing.rows[0]
    if (found) {
      if (found.label !== input.label || found.node_label !== input.label) {
        throw new ConflictError('Learning goal projection đã lệch nguồn; cần reconciliation')
      }
      return {
        node: toNode({
          id: found.node_id,
          person_id: found.person_id,
          type: 'Goal',
          label: found.node_label,
          version: found.version,
          created_at: found.node_created_at,
          updated_at: found.node_updated_at,
          archived_at: found.node_archived_at,
        }),
        goal: toGoal(found),
      }
    }

    const nodeResult = await client.query<NodeRow>(
      `insert into personal.life_graph_nodes (person_id, type, label)
       values ($1, 'Goal', $2) returning ${NODE_COLUMNS}`,
      [input.personId, input.label],
    )
    const nodeRow = nodeResult.rows[0]
    if (!nodeRow) throw new Error('Không tạo được Goal node')
    const goalResult = await client.query<GoalRow>(
      `insert into personal.life_goals (person_id, node_id, label)
       values ($1, $2, $3) returning ${GOAL_COLUMNS}`,
      [input.personId, nodeRow.id, input.label],
    )
    const goalRow = goalResult.rows[0]
    if (!goalRow) throw new Error('Không tạo được LifeGoal')
    await client.query(
      `insert into personal.life_goal_sources
         (goal_id, person_id, source_domain, source_type, source_id)
       values ($1, $2, 'learning', 'english_onboarding_goal', $3)`,
      [goalRow.id, input.personId, input.sourceId],
    )
    const node = toNode(nodeRow)
    const goal = toGoal(goalRow)
    await audit(client, input.personId, 'node', node.id, 'create', null, node)
    await audit(client, input.personId, 'goal', goal.id, 'create', null, goal)
    return { node, goal }
  })
}

export async function getLearningGoalSourceId(
  runner: Runner,
  personId: string,
  nodeId: string,
): Promise<string> {
  const { rows } = await runner.query<{ source_id: string }>(
    `select s.source_id
     from personal.life_goal_sources s
     join personal.life_goals g on g.id = s.goal_id
     join personal.life_graph_nodes n on n.id = g.node_id
     where s.person_id = $1 and n.id = $2 and n.person_id = $1
       and n.archived_at is null and s.source_domain = 'learning'
       and s.source_type = 'english_onboarding_goal'`,
    [personId, nodeId],
  )
  const row = rows[0]
  if (!row) throw new NotFoundError('Không tìm thấy nguồn Learning của Goal node')
  return row.source_id
}
