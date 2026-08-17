// packages/core-personal/decisionLedgerService.ts — V2-10 Decision Ledger & Outcome Loop.
// Structured decision records & evidence-driven feedback loop theo 02-SYSTEM-ARCHITECTURE.md mục 8.
import type { Pool, PoolClient } from 'pg'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { withTransaction } from '../core-db/transaction.js'
import { ConflictError, NotFoundError, ValidationError } from '../core-errors/appError.js'
import {
  DecisionRecordSchema,
  DECISION_RECORD_SCHEMA_VERSION,
  type DecisionRecord,
  type EvidenceRefSchema,
  DecisionStatusSchema,
} from '../core-contracts/decisionRecord.js'

type DecisionStatus = z.infer<typeof DecisionStatusSchema>
type EvidenceRef = z.infer<typeof EvidenceRefSchema>

export interface CreateDecisionInput {
  personId: string
  problem: string
  domain?: string
  options: Array<{ id: string; summary: string }>
  assumptions?: EvidenceRef[]
  evidence?: EvidenceRef[]
  tradeoffs?: string[]
  expectedOutcomes?: Array<{ description: string; expectedBy?: string }>
}

export interface DecideInput {
  selectedOptionId: string
  rationale?: string
  expectedOutcomes?: Array<{ description: string; expectedBy?: string }>
  reviewAt?: string
  expectedVersion: number
  actor: string
}

export interface RecordOutcomeInput {
  observation: {
    description: string
    observedAt: string
    matchedExpectation: boolean
  }
  expectedVersion: number
  actor: string
}

export interface ReviewDecisionInput {
  resolutionSummary: string
  expectedVersion: number
  actor: string
}

interface DecisionRow {
  id: string
  person_id: string
  problem: string
  domain: string | null
  options: unknown
  assumptions: unknown
  evidence: unknown
  tradeoffs: unknown
  selected_option_id: string | null
  rationale: string | null
  expected_outcomes: unknown
  actual_outcomes: unknown
  status: string
  review_at: Date | null
  version: number
  created_at: Date
  updated_at: Date
}

const DECISION_COLUMNS = `id, person_id, problem, domain, options, assumptions, evidence,
  tradeoffs, selected_option_id, rationale, expected_outcomes, actual_outcomes,
  status, review_at, version, created_at, updated_at`

function toDecisionRecord(row: DecisionRow): DecisionRecord {
  return DecisionRecordSchema.parse({
    id: row.id,
    personId: row.person_id,
    problem: row.problem,
    ...(row.domain ? { domain: row.domain } : {}),
    options: row.options,
    assumptions: row.assumptions,
    evidence: row.evidence,
    tradeoffs: row.tradeoffs,
    ...(row.selected_option_id ? { selectedOptionId: row.selected_option_id } : {}),
    ...(row.rationale ? { rationale: row.rationale } : {}),
    expectedOutcomes: row.expected_outcomes,
    ...(row.actual_outcomes ? { actualOutcomes: row.actual_outcomes } : {}),
    status: row.status,
    ...(row.review_at ? { reviewAt: row.review_at.toISOString() } : {}),
    version: row.version,
    createdAt: row.created_at.toISOString(),
    schemaVersion: DECISION_RECORD_SCHEMA_VERSION,
  })
}

async function recordAudit(
  client: Pick<PoolClient | Pool, 'query'>,
  decisionId: string,
  personId: string,
  actor: string,
  action: 'create' | 'decide' | 'record_outcome' | 'mark_review_due' | 'review' | 'supersede',
  details: Record<string, unknown> = {},
): Promise<void> {
  await client.query(
    `insert into personal.decision_reviews_audit_log
      (decision_id, person_id, actor, action, details)
     values ($1, $2, $3, $4, $5)`,
    [decisionId, personId, actor, action, JSON.stringify(details)],
  )
}

/**
 * Creates a new DecisionRecord (initially in 'open' status).
 */
export async function createDecision(
  pool: Pool,
  input: CreateDecisionInput,
): Promise<DecisionRecord> {
  if (!input.options || input.options.length === 0) {
    throw new ValidationError('Quyết định phải có ít nhất 1 lựa chọn (option)')
  }

  const id = randomUUID()
  const optionsJson = JSON.stringify(input.options)
  const assumptionsJson = JSON.stringify(input.assumptions ?? [])
  const evidenceJson = JSON.stringify(input.evidence ?? [])
  const tradeoffsJson = JSON.stringify(input.tradeoffs ?? [])
  const expectedOutcomesJson = JSON.stringify(input.expectedOutcomes ?? [])

  return await withTransaction(pool, async (client) => {
    const res = await client.query<DecisionRow>(
      `insert into personal.decision_records
        (id, person_id, problem, domain, options, assumptions, evidence, tradeoffs, expected_outcomes, status, version)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open', 1)
       returning ${DECISION_COLUMNS}`,
      [
        id,
        input.personId,
        input.problem,
        input.domain ?? null,
        optionsJson,
        assumptionsJson,
        evidenceJson,
        tradeoffsJson,
        expectedOutcomesJson,
      ],
    )
    const row = res.rows[0]
    if (!row) throw new Error('Không thể tạo DecisionRecord')

    await recordAudit(client, id, input.personId, 'system', 'create', {
      problem: input.problem,
    })

    return toDecisionRecord(row)
  })
}

/**
 * Selects an option and moves decision from 'open' -> 'decided'.
 */
export async function decideDecision(
  pool: Pool,
  personId: string,
  decisionId: string,
  input: DecideInput,
): Promise<DecisionRecord> {
  return await withTransaction(pool, async (client) => {
    const locked = await client.query<DecisionRow>(
      `select ${DECISION_COLUMNS} from personal.decision_records
       where id = $1 and person_id = $2 for update`,
      [decisionId, personId],
    )
    const current = locked.rows[0]
    if (!current) throw new NotFoundError('Không tìm thấy DecisionRecord')

    if (current.version !== input.expectedVersion) {
      throw new ConflictError(
        `Conflict: expectedVersion=${input.expectedVersion}, currentVersion=${current.version}`,
      )
    }

    if (current.status !== 'open') {
      throw new ConflictError(`Decision không ở trạng thái open (status=${current.status})`)
    }

    const options = current.options as Array<{ id: string; summary: string }>
    if (!options.some((opt) => opt.id === input.selectedOptionId)) {
      throw new ValidationError(
        `Option id "${input.selectedOptionId}" không tồn tại trong danh sách lựa chọn`,
      )
    }

    const updated = await client.query<DecisionRow>(
      `update personal.decision_records
       set selected_option_id = $1,
           rationale = $2,
           expected_outcomes = coalesce($3, expected_outcomes),
           review_at = $4,
           status = 'decided',
           version = version + 1,
           updated_at = now()
       where id = $5 returning ${DECISION_COLUMNS}`,
      [
        input.selectedOptionId,
        input.rationale ?? null,
        input.expectedOutcomes ? JSON.stringify(input.expectedOutcomes) : null,
        input.reviewAt ? new Date(input.reviewAt) : null,
        decisionId,
      ],
    )
    const row = updated.rows[0]
    if (!row) throw new Error('Không thể cập nhật DecisionRecord decide')

    await recordAudit(client, decisionId, personId, input.actor, 'decide', {
      selectedOptionId: input.selectedOptionId,
      rationale: input.rationale,
      reviewAt: input.reviewAt,
    })

    return toDecisionRecord(row)
  })
}

/**
 * Records an actual outcome observation for a decided decision.
 * Invariant: Outcome cannot silently rewrite user-declared facts/policies.
 */
export async function recordOutcome(
  pool: Pool,
  personId: string,
  decisionId: string,
  input: RecordOutcomeInput,
): Promise<DecisionRecord> {
  return await withTransaction(pool, async (client) => {
    const locked = await client.query<DecisionRow>(
      `select ${DECISION_COLUMNS} from personal.decision_records
       where id = $1 and person_id = $2 for update`,
      [decisionId, personId],
    )
    const current = locked.rows[0]
    if (!current) throw new NotFoundError('Không tìm thấy DecisionRecord')

    if (current.version !== input.expectedVersion) {
      throw new ConflictError(
        `Conflict: expectedVersion=${input.expectedVersion}, currentVersion=${current.version}`,
      )
    }

    if (current.status !== 'decided' && current.status !== 'review_due') {
      throw new ConflictError(
        `Không thể ghi nhận kết quả cho decision ở trạng thái ${current.status}`,
      )
    }

    const existingOutcomes = Array.isArray(current.actual_outcomes) ? current.actual_outcomes : []
    const updatedOutcomes = [...existingOutcomes, input.observation]

    const updated = await client.query<DecisionRow>(
      `update personal.decision_records
       set actual_outcomes = $1,
           version = version + 1,
           updated_at = now()
       where id = $2 returning ${DECISION_COLUMNS}`,
      [JSON.stringify(updatedOutcomes), decisionId],
    )
    const row = updated.rows[0]
    if (!row) throw new Error('Không thể cập nhật DecisionRecord outcome')

    await recordAudit(client, decisionId, personId, input.actor, 'record_outcome', {
      observation: input.observation,
    })

    return toDecisionRecord(row)
  })
}

/**
 * Marks decided decisions whose review_at has passed as 'review_due'.
 */
export async function markReviewDueDecisions(pool: Pool, now: Date = new Date()): Promise<number> {
  const res = await pool.query(
    `update personal.decision_records
     set status = 'review_due', version = version + 1, updated_at = now()
     where status = 'decided' and review_at is not null and review_at <= $1`,
    [now],
  )
  return res.rowCount ?? 0
}

/**
 * Reviews and closes a decision ('review_due' / 'decided' -> 'reviewed').
 */
export async function reviewDecision(
  pool: Pool,
  personId: string,
  decisionId: string,
  input: ReviewDecisionInput,
): Promise<DecisionRecord> {
  return await withTransaction(pool, async (client) => {
    const locked = await client.query<DecisionRow>(
      `select ${DECISION_COLUMNS} from personal.decision_records
       where id = $1 and person_id = $2 for update`,
      [decisionId, personId],
    )
    const current = locked.rows[0]
    if (!current) throw new NotFoundError('Không tìm thấy DecisionRecord')

    if (current.version !== input.expectedVersion) {
      throw new ConflictError(
        `Conflict: expectedVersion=${input.expectedVersion}, currentVersion=${current.version}`,
      )
    }

    if (current.status !== 'decided' && current.status !== 'review_due') {
      throw new ConflictError(`Decision không ở trạng thái cần review (status=${current.status})`)
    }

    const updated = await client.query<DecisionRow>(
      `update personal.decision_records
       set status = 'reviewed',
           version = version + 1,
           updated_at = now()
       where id = $1 returning ${DECISION_COLUMNS}`,
      [decisionId],
    )
    const row = updated.rows[0]
    if (!row) throw new Error('Không thể cập nhật DecisionRecord review')

    await recordAudit(client, decisionId, personId, input.actor, 'review', {
      resolutionSummary: input.resolutionSummary,
    })

    return toDecisionRecord(row)
  })
}

/**
 * Marks an old decision as 'superseded' by a new decision.
 */
export async function supersedeDecision(
  pool: Pool,
  personId: string,
  oldDecisionId: string,
  newDecisionId: string,
  expectedVersion: number,
  actor: string,
): Promise<DecisionRecord> {
  return await withTransaction(pool, async (client) => {
    const locked = await client.query<DecisionRow>(
      `select ${DECISION_COLUMNS} from personal.decision_records
       where id = $1 and person_id = $2 for update`,
      [oldDecisionId, personId],
    )
    const current = locked.rows[0]
    if (!current) throw new NotFoundError('Không tìm thấy DecisionRecord cũ')

    if (current.version !== expectedVersion) {
      throw new ConflictError(
        `Conflict: expectedVersion=${expectedVersion}, currentVersion=${current.version}`,
      )
    }

    const updated = await client.query<DecisionRow>(
      `update personal.decision_records
       set status = 'superseded',
           version = version + 1,
           updated_at = now()
       where id = $1 returning ${DECISION_COLUMNS}`,
      [oldDecisionId],
    )
    const row = updated.rows[0]
    if (!row) throw new Error('Không thể cập nhật DecisionRecord supersede')

    await recordAudit(client, oldDecisionId, personId, actor, 'supersede', {
      supersededBy: newDecisionId,
    })

    return toDecisionRecord(row)
  })
}

/**
 * Gets a single DecisionRecord.
 */
export async function getDecision(
  pool: Pool,
  personId: string,
  decisionId: string,
): Promise<DecisionRecord> {
  const res = await pool.query<DecisionRow>(
    `select ${DECISION_COLUMNS} from personal.decision_records
     where id = $1 and person_id = $2`,
    [decisionId, personId],
  )
  const row = res.rows[0]
  if (!row) throw new NotFoundError('Không tìm thấy DecisionRecord')
  return toDecisionRecord(row)
}

/**
 * Lists DecisionRecords with optional filtering.
 */
export async function listDecisions(
  pool: Pool,
  personId: string,
  options?: { status?: DecisionStatus; domain?: string; limit?: number },
): Promise<DecisionRecord[]> {
  const params: unknown[] = [personId]
  const clauses = ['person_id = $1']

  if (options?.status) {
    params.push(options.status)
    clauses.push(`status = $${params.length}`)
  }

  if (options?.domain) {
    params.push(options.domain)
    clauses.push(`domain = $${params.length}`)
  }

  const limit = Math.min(100, Math.max(1, options?.limit ?? 50))
  params.push(limit)

  const res = await pool.query<DecisionRow>(
    `select ${DECISION_COLUMNS} from personal.decision_records
     where ${clauses.join(' and ')}
     order by created_at desc
     limit $${params.length}`,
    params,
  )

  return res.rows.map(toDecisionRecord)
}
