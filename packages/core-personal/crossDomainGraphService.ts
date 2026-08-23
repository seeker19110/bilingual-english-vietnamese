// packages/core-personal/crossDomainGraphService.ts — V2-14 Cross-Domain Life Graph Sync Engine.
// Kết nối Career, Learning và Personal vào Life Graph mà không vi phạm ranh giới bảng.
import type { Pool } from 'pg'
import { randomUUID } from 'node:crypto'
import { listCareerGoals } from '@dhcb/core-career/careerService'
import { getLearningReadModel } from '@dhcb/core-learner/learningReadModelService'
import { listNodes, listEdges } from './lifeGraphService.js'
import {
  CrossDomainGraphProjectionSchema,
  CROSS_DOMAIN_GRAPH_SCHEMA_VERSION,
  type CrossDomainGraphProjection,
} from '@dhcb/core-contracts/crossDomainGraph'
import { type LifeGraphNodeType, type LifeRelation } from '@dhcb/core-contracts/lifeGraph'

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

async function ensureNode(
  pool: Pool,
  personId: string,
  type: LifeGraphNodeType,
  label: string,
): Promise<{ id: string; created: boolean }> {
  const existing = await pool.query<NodeRow>(
    `select id from personal.graph_nodes
     where person_id = $1 and type = $2 and label = $3 and archived_at is null
     limit 1`,
    [personId, type, label],
  )
  if (existing.rows[0]) {
    return { id: existing.rows[0].id, created: false }
  }

  const id = randomUUID()
  await pool.query(
    `insert into personal.graph_nodes (id, person_id, type, label, version)
     values ($1, $2, $3, $4, 1)`,
    [id, personId, type, label],
  )
  return { id, created: true }
}

async function ensureEdge(
  pool: Pool,
  personId: string,
  fromNodeId: string,
  toNodeId: string,
  relation: LifeRelation,
  provenance = 'cross_domain_sync',
): Promise<{ id: string; created: boolean }> {
  const existing = await pool.query<EdgeRow>(
    `select id from personal.graph_edges
     where person_id = $1 and from_node_id = $2 and to_node_id = $3 and relation = $4 and archived_at is null
     limit 1`,
    [personId, fromNodeId, toNodeId, relation],
  )
  if (existing.rows[0]) {
    return { id: existing.rows[0].id, created: false }
  }

  const id = randomUUID()
  await pool.query(
    `insert into personal.graph_edges (id, person_id, from_node_id, to_node_id, relation, provenance, version)
     values ($1, $2, $3, $4, $5, $6, 1)`,
    [id, personId, fromNodeId, toNodeId, relation, provenance],
  )
  return { id, created: true }
}

/**
 * Synchronizes Career and Learning domain states into Personal OS Life Graph.
 * Satisfies Gate Invariant: Reads Learning through typed Read Model, never direct query.
 */
export async function syncCrossDomainLifeGraph(
  pool: Pool,
  personId: string,
  userId: string,
): Promise<CrossDomainGraphProjection> {
  const careerGoals = await listCareerGoals(pool, personId, 'active')
  const learningModel = await getLearningReadModel(pool, {
    personId,
    userId,
    subject: 'english',
  })

  let nodesCount = 0
  let edgesCount = 0
  let skillsMapped = 0
  let masteryAligned = 0

  for (const goal of careerGoals) {
    const goalNodeResult = await ensureNode(pool, personId, 'Goal', `Career: ${goal.targetTitle}`)
    if (goalNodeResult.created) nodesCount++

    for (const skillName of goal.skillsRequired) {
      skillsMapped++
      const skillNodeResult = await ensureNode(pool, personId, 'Skill', skillName)
      if (skillNodeResult.created) nodesCount++

      const reqEdgeResult = await ensureEdge(
        pool,
        personId,
        goalNodeResult.id,
        skillNodeResult.id,
        'requires',
        'career_goal_requirement',
      )
      if (reqEdgeResult.created) edgesCount++

      const isEnglishSkill = /english|tiếng anh|ielts|toeic/i.test(skillName)
      if (isEnglishSkill && learningModel.currentLevel) {
        const isMastered = ['B2', 'C1', 'C2'].includes(learningModel.currentLevel)
        if (isMastered) {
          masteryAligned++
          const supportEdgeResult = await ensureEdge(
            pool,
            personId,
            skillNodeResult.id,
            goalNodeResult.id,
            'supports',
            'learning_mastery_evidence',
          )
          if (supportEdgeResult.created) edgesCount++
        }
      }
    }
  }

  const allNodes = await listNodes(pool, personId)
  const allEdges = await listEdges(pool, personId)

  return CrossDomainGraphProjectionSchema.parse({
    personId,
    nodes: allNodes,
    edges: allEdges,
    syncSummary: {
      careerGoalsProcessed: careerGoals.length,
      skillsMapped,
      nodesCreatedOrUpdated: nodesCount,
      edgesCreatedOrUpdated: edgesCount,
      learningMasteryAligned: masteryAligned,
    },
    syncedAt: new Date().toISOString(),
    schemaVersion: CROSS_DOMAIN_GRAPH_SCHEMA_VERSION,
  })
}
