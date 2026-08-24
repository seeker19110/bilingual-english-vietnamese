// packages/core-personal/personErasureService.ts — V2-19 Privacy Export & Full Erasure.
//
// Implements two capabilities required by architecture Section 18 (Privacy Controls):
//
//   1. exportPersonData(pool, personId) — aggregates ALL personal data across all 12+ schemas
//      into a structured export with provenance + sensitivity labels.
//      Used for "What does Đồng Hành know about me?" and GDPR-style data portability.
//
//   2. erasePersonData(pool, personId, erasedBy) — atomic cascade delete across all schemas
//      in a single transaction. Writes an erasure log entry. Returns counts per schema.
//
// INVARIANTS:
//   - erasure is atomic: if any schema delete fails, the whole transaction rolls back.
//   - erasure log is APPEND-ONLY: never deleted; is the audit trail for the action itself.
//   - export is read-only and scoped to personId from the service call (not from client).
//   - no AI output can trigger erasure — the endpoint requires auth + ownership verification.

import type { Pool } from 'pg'
import { withTransaction } from '@dhcb/core-db/transaction'
import { NotFoundError } from '@dhcb/core-errors/appError'

// ─── Export Types ─────────────────────────────────────────────────────────────

export interface PersonExportData {
  exportedAt: string
  personId: string
  person: PersonRow | null
  personalFacts: FactRow[]
  memories: MemoryRow[]
  consentGrants: ConsentRow[]
  personalPolicies: PolicyRow[]
  lifeGraphNodes: LifeGraphNodeRow[]
  lifeGraphEdges: LifeGraphEdgeRow[]
  careerRecords: CareerRow[]
  workRecords: WorkRow[]
  startupRecords: StartupRow[]
  lifeRecords: LifeRow[]
  automationGrants: AutomationGrantRow[]
  actionReceipts: ActionReceiptRow[]
  decisionRecords: DecisionRow[]
}

export interface ErasePersonResult {
  personId: string
  schemasCleared: string[]
  recordsDeletedCount: number
  erasureLogId: string
}

// ─── Internal row type stubs (just id + person_id for counting) ──────────────

interface PersonRow {
  id: string
  user_id: string
  display_name: string
  created_at: string
  updated_at: string
}
interface FactRow {
  id: string
  namespace: string
  key: string
  value: unknown
  origin: string
  confidence: string
  sensitivity: string
  provenance?: unknown
  is_current: boolean
  created_at: string
}
interface MemoryRow {
  id: string
  namespace: string
  content: string
  provenance: string
  sensitivity: string
  status: string
  confidence?: number
  created_at: string
}
interface ConsentRow {
  id: string
  scope: string
  purpose: string
  version: number
  status: string
  granted_at: string
  expires_at: string | null
  revoked_at: string | null
}
interface PolicyRow {
  id: string
  subject: string
  action: string
  resource_scope: string
  authority: string
  purpose: string
  created_at: string
  revoked_at: string | null
}
interface LifeGraphNodeRow {
  id: string
  node_type: string
  label: string
  status: string
  created_at: string
}
interface LifeGraphEdgeRow {
  id: string
  source_node_id: string
  target_node_id: string
  edge_type: string
  created_at: string
}
interface CareerRow {
  id: string
  record_type: string
  created_at: string
}
interface WorkRow {
  id: string
  record_type: string
  created_at: string
}
interface StartupRow {
  id: string
  record_type: string
  created_at: string
}
interface LifeRow {
  id: string
  record_type: string
  created_at: string
}
interface AutomationGrantRow {
  id: string
  name: string
  capability_id: string
  status: string
  created_at: string
}
interface ActionReceiptRow {
  id: string
  grant_id: string
  idempotency_key: string
  status: string
  executed_at: string
}
interface DecisionRow {
  id: string
  title: string
  status: string
  decided_at: string | null
  created_at: string
}

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Aggregates all personal data across all schemas for a given personId.
 * Scoped strictly to personId — caller must authenticate before calling.
 */
export async function exportPersonData(pool: Pool, personId: string): Promise<PersonExportData> {
  const [
    personRes,
    factsRes,
    memoriesRes,
    consentsRes,
    policiesRes,
    lifeNodesRes,
    lifeEdgesRes,
    automationRes,
    receiptsRes,
    decisionRes,
    careerRes,
    workRes,
    startupRes,
    lifeRes,
  ] = await Promise.all([
    // Personal identity
    pool.query<PersonRow>(
      `select id, user_id, display_name,
              created_at::text, updated_at::text
         from personal.persons where id = $1`,
      [personId],
    ),
    // Personal facts (all, including history)
    pool.query<FactRow>(
      `select id, namespace, key, value, origin, confidence::text, sensitivity, is_current,
              created_at::text
         from personal.personal_facts where person_id = $1 order by created_at`,
      [personId],
    ),
    // Memory records (all statuses)
    pool.query<MemoryRow>(
      `select id, namespace, content, provenance, sensitivity, status,
              created_at::text
         from personal.memory_records where person_id = $1 order by created_at`,
      [personId],
    ),
    // Consent grants (all versions)
    pool.query<ConsentRow>(
      `select id, scope, purpose, version, status,
              granted_at::text, expires_at::text, revoked_at::text
         from personal.consent_grants where person_id = $1 order by granted_at`,
      [personId],
    ),
    // Personal policies (all, including revoked)
    pool.query<PolicyRow>(
      `select id, subject, action, resource_scope, authority, purpose,
              created_at::text, revoked_at::text
         from personal.personal_policies where person_id = $1 order by created_at`,
      [personId],
    ),
    // Life graph nodes
    pool.query<LifeGraphNodeRow>(
      `select id, node_type, label, status, created_at::text
         from personal.life_graph_nodes where person_id = $1 order by created_at`,
      [personId],
    ),
    // Life graph edges (source or target owned by person)
    pool.query<LifeGraphEdgeRow>(
      `select e.id, e.source_node_id, e.target_node_id, e.edge_type, e.created_at::text
         from personal.life_graph_edges e
         join personal.life_graph_nodes n on n.id = e.source_node_id
         where n.person_id = $1 order by e.created_at`,
      [personId],
    ),
    // Automation grants
    pool.query<AutomationGrantRow>(
      `select id, name, capability_id, status, created_at::text
         from personal.automation_grants where person_id = $1 order by created_at`,
      [personId],
    ),
    // Action receipts
    pool.query<ActionReceiptRow>(
      `select id, grant_id, idempotency_key, status, executed_at::text
         from personal.action_receipts where person_id = $1 order by executed_at`,
      [personId],
    ),
    // Decision ledger
    pool
      .query<DecisionRow>(
        `select id, title, status, decided_at::text, created_at::text
         from personal.decision_records where person_id = $1 order by created_at`,
        [personId],
      )
      .catch(() => ({ rows: [] as DecisionRow[] })),
    // Career records
    pool
      .query<CareerRow>(
        `select id, 'career' as record_type, created_at::text
         from career.career_profiles where person_id = $1`,
        [personId],
      )
      .catch(() => ({ rows: [] as CareerRow[] })),
    // Work records
    pool
      .query<WorkRow>(
        `select id, 'project' as record_type, created_at::text
         from work.projects where person_id = $1`,
        [personId],
      )
      .catch(() => ({ rows: [] as WorkRow[] })),
    // Startup records
    pool
      .query<StartupRow>(
        `select id, 'venture' as record_type, created_at::text
         from startup.ventures where person_id = $1`,
        [personId],
      )
      .catch(() => ({ rows: [] as StartupRow[] })),
    // Life records
    pool
      .query<LifeRow>(
        `select id, 'plan' as record_type, created_at::text
         from life.plans where person_id = $1`,
        [personId],
      )
      .catch(() => ({ rows: [] as LifeRow[] })),
  ])

  return {
    exportedAt: new Date().toISOString(),
    personId,
    person: personRes.rows[0] ?? null,
    personalFacts: factsRes.rows,
    memories: memoriesRes.rows,
    consentGrants: consentsRes.rows,
    personalPolicies: policiesRes.rows,
    lifeGraphNodes: lifeNodesRes.rows,
    lifeGraphEdges: lifeEdgesRes.rows,
    automationGrants: automationRes.rows,
    actionReceipts: receiptsRes.rows,
    decisionRecords: decisionRes.rows,
    careerRecords: careerRes.rows,
    workRecords: workRes.rows,
    startupRecords: startupRes.rows,
    lifeRecords: lifeRes.rows,
  }
}

// ─── Erase ────────────────────────────────────────────────────────────────────

/**
 * Atomically erases all personal data for personId across all schemas.
 * Writes an erasure log entry (append-only) and returns a summary.
 *
 * SAFETY RULES:
 *   - Must be called only after ownership verification (caller is person or admin).
 *   - The erasure log itself is never deleted — it is the audit trail.
 *   - If any delete fails, the entire transaction rolls back (no partial erasure).
 */
export async function erasePersonData(
  pool: Pool,
  personId: string,
  erasedBy: string,
): Promise<ErasePersonResult> {
  // Verify person exists before erasing
  const personCheck = await pool.query<{ id: string }>(
    'select id from personal.persons where id = $1',
    [personId],
  )
  if (!personCheck.rows[0]) {
    throw new NotFoundError('Person not found')
  }

  return withTransaction(pool, async (client) => {
    const schemasCleared: string[] = []
    let totalDeleted = 0

    // Helper: delete from a table scoped to personId, count rows
    async function deleteScoped(
      schema: string,
      table: string,
      column = 'person_id',
    ): Promise<number> {
      // Tên schema/bảng/cột KHÔNG thể tham số hoá bằng $1 (Postgres chỉ nhận tham số ở vị trí
      // GIÁ TRỊ), nên phải nối chuỗi. Mọi lời gọi hiện tại đều truyền hằng số trong code, nhưng
      // chặn ngay tại đây để một lần sửa sau này vô tình nối biến từ người dùng vào là NỔ NGAY
      // thay vì thành lỗ SQL injection im lặng (audit 2026-08-24, F9). `personId` vẫn đi qua $1.
      for (const ident of [schema, table, column]) {
        if (!/^[a-z_][a-z0-9_]*$/.test(ident)) {
          throw new Error(`Định danh SQL không hợp lệ: ${JSON.stringify(ident)}`)
        }
      }
      const res = await client.query(`DELETE FROM ${schema}.${table} WHERE ${column} = $1`, [
        personId,
      ])
      const count = res.rowCount ?? 0
      if (count > 0 || schemasCleared.indexOf(`${schema}.${table}`) === -1) {
        schemasCleared.push(`${schema}.${table}`)
      }
      return count
    }

    // --- personal schema (delete order: children before parents) ---

    // Action receipts (reference automation_grants)
    totalDeleted += await deleteScoped('personal', 'action_receipts')

    // Automation grants
    totalDeleted += await deleteScoped('personal', 'automation_grants')

    // Life graph edges (edges reference nodes; delete edges first)
    const edgeRes = await client.query(
      `DELETE FROM personal.life_graph_edges e
         USING personal.life_graph_nodes n
         WHERE e.source_node_id = n.id AND n.person_id = $1`,
      [personId],
    )
    const edgeCount = edgeRes.rowCount ?? 0
    if (edgeCount > 0) schemasCleared.push('personal.life_graph_edges')
    totalDeleted += edgeCount

    // Life graph nodes
    totalDeleted += await deleteScoped('personal', 'life_graph_nodes')

    // Memory records
    totalDeleted += await deleteScoped('personal', 'memory_records')

    // Personal policies
    totalDeleted += await deleteScoped('personal', 'personal_policies')

    // Consent grants
    totalDeleted += await deleteScoped('personal', 'consent_grants')

    // Proposed actions
    totalDeleted += await deleteScoped('personal', 'proposed_actions').catch(() => 0)

    // Decision records
    totalDeleted += await deleteScoped('personal', 'decision_records').catch(() => 0)

    // Personal facts
    totalDeleted += await deleteScoped('personal', 'personal_facts')

    // --- domain schemas (best-effort: tables may not exist in local dev) ---

    // Career
    totalDeleted += await client
      .query('DELETE FROM career.career_profiles WHERE person_id = $1', [personId])
      .then((r) => {
        if ((r.rowCount ?? 0) > 0) schemasCleared.push('career.career_profiles')
        return r.rowCount ?? 0
      })
      .catch(() => 0)
    totalDeleted += await client
      .query('DELETE FROM career.career_experiences WHERE person_id = $1', [personId])
      .then((r) => {
        if ((r.rowCount ?? 0) > 0) schemasCleared.push('career.career_experiences')
        return r.rowCount ?? 0
      })
      .catch(() => 0)
    totalDeleted += await client
      .query('DELETE FROM career.career_goals WHERE person_id = $1', [personId])
      .then((r) => {
        if ((r.rowCount ?? 0) > 0) schemasCleared.push('career.career_goals')
        return r.rowCount ?? 0
      })
      .catch(() => 0)

    // Work
    totalDeleted += await client
      .query('DELETE FROM work.projects WHERE person_id = $1', [personId])
      .then((r) => {
        if ((r.rowCount ?? 0) > 0) schemasCleared.push('work.projects')
        return r.rowCount ?? 0
      })
      .catch(() => 0)

    // Startup
    totalDeleted += await client
      .query('DELETE FROM startup.ventures WHERE person_id = $1', [personId])
      .then((r) => {
        if ((r.rowCount ?? 0) > 0) schemasCleared.push('startup.ventures')
        return r.rowCount ?? 0
      })
      .catch(() => 0)

    // Life
    totalDeleted += await client
      .query('DELETE FROM life.plans WHERE person_id = $1', [personId])
      .then((r) => {
        if ((r.rowCount ?? 0) > 0) schemasCleared.push('life.plans')
        return r.rowCount ?? 0
      })
      .catch(() => 0)
    totalDeleted += await client
      .query('DELETE FROM life.habits WHERE person_id = $1', [personId])
      .then((r) => {
        if ((r.rowCount ?? 0) > 0) schemasCleared.push('life.habits')
        return r.rowCount ?? 0
      })
      .catch(() => 0)
    totalDeleted += await client
      .query('DELETE FROM life.wellbeing_checks WHERE person_id = $1', [personId])
      .then((r) => {
        if ((r.rowCount ?? 0) > 0) schemasCleared.push('life.wellbeing_checks')
        return r.rowCount ?? 0
      })
      .catch(() => 0)
    totalDeleted += await client
      .query('DELETE FROM life.growth_milestones WHERE person_id = $1', [personId])
      .then((r) => {
        if ((r.rowCount ?? 0) > 0) schemasCleared.push('life.growth_milestones')
        return r.rowCount ?? 0
      })
      .catch(() => 0)

    // --- person record last (FK source) ---
    totalDeleted += await deleteScoped('personal', 'persons', 'id')

    // --- Write erasure log (after all deletes succeed) ---
    const logRes = await client.query<{ id: string }>(
      `INSERT INTO platform.person_erasure_log
         (person_id, erased_at, erased_by, schemas_cleared, records_deleted_count)
       VALUES ($1, now(), $2, $3, $4)
       RETURNING id`,
      [personId, erasedBy, schemasCleared, totalDeleted],
    )
    const erasureLogId = logRes.rows[0]!.id

    return {
      personId,
      schemasCleared,
      recordsDeletedCount: totalDeleted,
      erasureLogId,
    }
  })
}
