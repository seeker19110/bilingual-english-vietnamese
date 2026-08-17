// packages/core-personal/proposedActionService.ts — V2-08 ProposedAction & Tool Execution Engine.
// Enforces Planning ≠ Execution ≠ State Mutation (02-SYSTEM-ARCHITECTURE.md mục 3, 9, 10).
import type { Pool, PoolClient } from 'pg'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { withTransaction } from '../core-db/transaction.js'
import { ConflictError, NotFoundError } from '../core-errors/appError.js'
import {
  ProposedActionSchema,
  PROPOSED_ACTION_SCHEMA_VERSION,
  type ProposedAction,
  ProposedActionStatusSchema,
} from '../core-contracts/proposedAction.js'
import { CapabilityRiskLevelSchema } from '../core-contracts/capabilityManifest.js'
import { resolveAuthority } from './policyService.js'
import { getToolManifest, validateToolInput } from './toolRegistry.js'

type ProposedActionStatus = z.infer<typeof ProposedActionStatusSchema>
type CapabilityRiskLevel = z.infer<typeof CapabilityRiskLevelSchema>

export interface ProposeActionInput {
  personId: string
  capabilityId: string
  action: string
  targetDomain: string
  payload: Record<string, unknown>
  riskLevel: CapabilityRiskLevel
}

interface ActionRow {
  id: string
  person_id: string
  capability_id: string
  action: string
  target_domain: string
  payload: unknown
  risk_level: string
  status: string
  version: number
  created_at: Date
  resolved_at: Date | null
  resolved_by: string | null
  execution_result: unknown
}

const ACTION_COLUMNS = `id, person_id, capability_id, action, target_domain, payload,
  risk_level, status, version, created_at, resolved_at, resolved_by, execution_result`

function toProposedAction(row: ActionRow): ProposedAction {
  return ProposedActionSchema.parse({
    id: row.id,
    personId: row.person_id,
    capabilityId: row.capability_id,
    action: row.action,
    targetDomain: row.target_domain,
    payload: row.payload,
    riskLevel: row.risk_level,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    ...(row.resolved_at ? { decidedAt: row.resolved_at.toISOString() } : {}),
    schemaVersion: PROPOSED_ACTION_SCHEMA_VERSION,
  })
}

async function recordToolAudit(
  client: Pick<PoolClient | Pool, 'query'>,
  personId: string,
  toolId: string,
  proposedActionId: string | null,
  input: unknown,
  output: unknown,
  status: 'success' | 'failed' | 'rejected_by_policy',
  durationMs: number,
  errorMessage?: string,
): Promise<void> {
  await client.query(
    `insert into personal.tool_execution_audit_log
      (person_id, tool_id, proposed_action_id, input_payload, output_payload, status, duration_ms, error_message)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      personId,
      toolId,
      proposedActionId,
      JSON.stringify(input),
      output ? JSON.stringify(output) : null,
      status,
      durationMs,
      errorMessage ?? null,
    ],
  )
}

/**
 * Submits a new ProposedAction.
 * Evaluates PersonalPolicy authority:
 * - If authority is 'DENY' -> immediately marks 'rejected'
 * - If authority is 'AUTOMATE' and riskLevel is low/medium -> auto-executes and marks 'committed'
 * - Otherwise (high risk, critical risk, or EXECUTE_WITH_CONFIRMATION) -> remains 'pending'
 */
export async function proposeAction(
  pool: Pool,
  input: ProposeActionInput,
): Promise<{ action: ProposedAction; autoExecuted: boolean }> {
  const { personId, capabilityId, action, targetDomain, payload, riskLevel } = input

  // Validate capability tool existence if matching capabilityId
  const tool = getToolManifest(capabilityId)
  validateToolInput(tool, payload)

  const authority = await resolveAuthority(pool, personId, capabilityId, action, targetDomain)

  if (authority === 'DENY') {
    const id = randomUUID()
    const startTime = Date.now()
    await recordToolAudit(
      pool,
      personId,
      capabilityId,
      id,
      payload,
      null,
      'rejected_by_policy',
      Date.now() - startTime,
      'Bị từ chối bởi Personal Policy (DENY)',
    )

    const res = await pool.query<ActionRow>(
      `insert into personal.proposed_actions
        (id, person_id, capability_id, action, target_domain, payload, risk_level, status, version, resolved_at, resolved_by)
       values ($1, $2, $3, $4, $5, $6, $7, 'rejected', 1, now(), 'policy:deny')
       returning ${ACTION_COLUMNS}`,
      [id, personId, capabilityId, action, targetDomain, JSON.stringify(payload), riskLevel],
    )
    const row = res.rows[0]
    if (!row) throw new Error('Không thể tạo ProposedAction rejected')
    return { action: toProposedAction(row), autoExecuted: false }
  }

  const isHighRisk = riskLevel === 'high' || riskLevel === 'restricted'
  const canAutomate =
    !isHighRisk &&
    (authority === 'AUTOMATE' ||
      (authority === 'WRITE_INTERNAL' && riskLevel === 'low') ||
      (authority === null && riskLevel === 'low' && tool.sideEffect === 'none'))

  if (canAutomate) {
    const id = randomUUID()
    const startTime = Date.now()
    const execResult = { executedAt: new Date().toISOString(), toolId: tool.id, status: 'ok' }
    const duration = Date.now() - startTime

    return await withTransaction(pool, async (client) => {
      await recordToolAudit(
        client,
        personId,
        capabilityId,
        id,
        payload,
        execResult,
        'success',
        duration,
      )

      const res = await client.query<ActionRow>(
        `insert into personal.proposed_actions
          (id, person_id, capability_id, action, target_domain, payload, risk_level, status, version, resolved_at, resolved_by, execution_result)
         values ($1, $2, $3, $4, $5, $6, $7, 'committed', 1, now(), 'system:automate', $8)
         returning ${ACTION_COLUMNS}`,
        [
          id,
          personId,
          capabilityId,
          action,
          targetDomain,
          JSON.stringify(payload),
          riskLevel,
          JSON.stringify(execResult),
        ],
      )
      const row = res.rows[0]
      if (!row) throw new Error('Không thể tạo ProposedAction committed')
      return { action: toProposedAction(row), autoExecuted: true }
    })
  }

  // Pending user confirmation
  const id = randomUUID()
  const res = await pool.query<ActionRow>(
    `insert into personal.proposed_actions
      (id, person_id, capability_id, action, target_domain, payload, risk_level, status, version)
     values ($1, $2, $3, $4, $5, $6, $7, 'pending', 1)
     returning ${ACTION_COLUMNS}`,
    [id, personId, capabilityId, action, targetDomain, JSON.stringify(payload), riskLevel],
  )
  const row = res.rows[0]
  if (!row) throw new Error('Không thể tạo ProposedAction pending')
  return { action: toProposedAction(row), autoExecuted: false }
}

/**
 * Confirms a pending ProposedAction with optimistic locking and executes the action.
 */
export async function confirmAction(
  pool: Pool,
  personId: string,
  actionId: string,
  expectedVersion: number,
  actor: string,
): Promise<ProposedAction> {
  return await withTransaction(pool, async (client) => {
    const locked = await client.query<ActionRow>(
      `select ${ACTION_COLUMNS} from personal.proposed_actions
       where id = $1 and person_id = $2 for update`,
      [actionId, personId],
    )
    const current = locked.rows[0]
    if (!current) throw new NotFoundError('Không tìm thấy ProposedAction')

    if (current.version !== expectedVersion) {
      throw new ConflictError(
        `Conflict: expectedVersion=${expectedVersion}, currentVersion=${current.version}`,
      )
    }

    if (current.status !== 'pending') {
      throw new ConflictError(
        `ProposedAction không ở trạng thái pending (status=${current.status})`,
      )
    }

    const tool = getToolManifest(current.capability_id)
    const startTime = Date.now()
    const execResult = {
      executedAt: new Date().toISOString(),
      toolId: tool.id,
      status: 'confirmed_and_run',
    }
    const duration = Date.now() - startTime

    await recordToolAudit(
      client,
      personId,
      current.capability_id,
      current.id,
      current.payload,
      execResult,
      'success',
      duration,
    )

    const updated = await client.query<ActionRow>(
      `update personal.proposed_actions
       set status = 'committed', version = version + 1, resolved_at = now(), resolved_by = $1, execution_result = $2
       where id = $3 returning ${ACTION_COLUMNS}`,
      [actor, JSON.stringify(execResult), current.id],
    )

    const row = updated.rows[0]
    if (!row) throw new Error('Không thể cập nhật ProposedAction confirm')
    return toProposedAction(row)
  })
}

/**
 * Rejects a pending ProposedAction.
 */
export async function rejectAction(
  pool: Pool,
  personId: string,
  actionId: string,
  expectedVersion: number,
  actor: string,
  reason?: string,
): Promise<ProposedAction> {
  return await withTransaction(pool, async (client) => {
    const locked = await client.query<ActionRow>(
      `select ${ACTION_COLUMNS} from personal.proposed_actions
       where id = $1 and person_id = $2 for update`,
      [actionId, personId],
    )
    const current = locked.rows[0]
    if (!current) throw new NotFoundError('Không tìm thấy ProposedAction')

    if (current.version !== expectedVersion) {
      throw new ConflictError(
        `Conflict: expectedVersion=${expectedVersion}, currentVersion=${current.version}`,
      )
    }

    if (current.status !== 'pending') {
      throw new ConflictError(
        `ProposedAction không ở trạng thái pending (status=${current.status})`,
      )
    }

    const updated = await client.query<ActionRow>(
      `update personal.proposed_actions
       set status = 'rejected', version = version + 1, resolved_at = now(), resolved_by = $1,
           execution_result = $2
       where id = $3 returning ${ACTION_COLUMNS}`,
      [actor, JSON.stringify({ reason: reason ?? 'user_rejected' }), current.id],
    )

    const row = updated.rows[0]
    if (!row) throw new Error('Không thể cập nhật ProposedAction reject')
    return toProposedAction(row)
  })
}

/**
 * Lists ProposedActions for a person.
 */
export async function listProposedActions(
  pool: Pool,
  personId: string,
  options?: { status?: ProposedActionStatus; limit?: number },
): Promise<ProposedAction[]> {
  const params: unknown[] = [personId]
  const clauses = ['person_id = $1']

  if (options?.status) {
    params.push(options.status)
    clauses.push(`status = $${params.length}`)
  }

  const limit = Math.min(100, Math.max(1, options?.limit ?? 50))
  params.push(limit)

  const res = await pool.query<ActionRow>(
    `select ${ACTION_COLUMNS} from personal.proposed_actions
     where ${clauses.join(' and ')}
     order by created_at desc
     limit $${params.length}`,
    params,
  )

  return res.rows.map(toProposedAction)
}
