// packages/core-startup/startupService.ts — Service cho Startup Domain (V2-16).
// Gate: AI-generated market claims NEVER become facts without evidence/provenance.
import type { Pool } from 'pg'
import { randomUUID } from 'node:crypto'
import { withTransaction } from '@dhcb/core-db/transaction'
import { NotFoundError } from '@dhcb/core-errors/appError'
import {
  VentureSchema,
  ProblemSchema,
  HypothesisSchema,
  ValidatedEvidenceSchema,
  STARTUP_SCHEMA_VERSION,
  type Venture,
  type Problem,
  type Hypothesis,
  type ValidatedEvidence,
  type VentureStageSchema,
  type HypothesisStatusSchema,
} from '@dhcb/core-contracts/startup'
import type { z } from 'zod'

export type VentureStage = z.infer<typeof VentureStageSchema>
export type HypothesisStatus = z.infer<typeof HypothesisStatusSchema>

interface VentureRow {
  id: string
  person_id: string
  name: string
  description: string | null
  stage: string
  version: number
  created_at: Date
  updated_at: Date
}

interface ProblemRow {
  id: string
  venture_id: string
  person_id: string
  statement: string
  customer_segment: string
  severity: string
  evidence_count: number
  version: number
  created_at: Date
  updated_at: Date
}

interface HypothesisRow {
  id: string
  venture_id: string
  person_id: string
  statement: string
  hypothesis_type: string
  status: string
  version: number
  created_at: Date
  updated_at: Date
}

interface EvidenceRow {
  id: string
  venture_id: string
  hypothesis_id: string | null
  person_id: string
  title: string
  evidence_type: string
  provenance: string
  findings: string
  supports_hypothesis: boolean
  collected_at: Date
  created_at: Date
}

function toVenture(r: VentureRow): Venture {
  return VentureSchema.parse({
    id: r.id,
    personId: r.person_id,
    name: r.name,
    ...(r.description ? { description: r.description } : {}),
    stage: r.stage,
    version: r.version,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
    schemaVersion: STARTUP_SCHEMA_VERSION,
  })
}

function toProblem(r: ProblemRow): Problem {
  return ProblemSchema.parse({
    id: r.id,
    ventureId: r.venture_id,
    personId: r.person_id,
    statement: r.statement,
    customerSegment: r.customer_segment,
    severity: r.severity,
    evidenceCount: r.evidence_count,
    version: r.version,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
    schemaVersion: STARTUP_SCHEMA_VERSION,
  })
}

function toHypothesis(r: HypothesisRow): Hypothesis {
  return HypothesisSchema.parse({
    id: r.id,
    ventureId: r.venture_id,
    personId: r.person_id,
    statement: r.statement,
    hypothesisType: r.hypothesis_type,
    status: r.status,
    version: r.version,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
    schemaVersion: STARTUP_SCHEMA_VERSION,
  })
}

function toEvidence(r: EvidenceRow): ValidatedEvidence {
  return ValidatedEvidenceSchema.parse({
    id: r.id,
    ventureId: r.venture_id,
    ...(r.hypothesis_id ? { hypothesisId: r.hypothesis_id } : {}),
    personId: r.person_id,
    title: r.title,
    evidenceType: r.evidence_type,
    provenance: r.provenance,
    findings: r.findings,
    supportsHypothesis: r.supports_hypothesis,
    collectedAt: r.collected_at.toISOString(),
    createdAt: r.created_at.toISOString(),
    schemaVersion: STARTUP_SCHEMA_VERSION,
  })
}

// ── Venture CRUD ────────────────────────────────────────────────────────────

export async function createVenture(
  pool: Pool,
  personId: string,
  input: { name: string; description?: string; stage?: VentureStage },
): Promise<Venture> {
  const id = randomUUID()
  const res = await pool.query<VentureRow>(
    `insert into startup.ventures (id, person_id, name, description, stage, version)
     values ($1, $2, $3, $4, $5, 1)
     returning *`,
    [id, personId, input.name, input.description ?? null, input.stage ?? 'ideation'],
  )
  return toVenture(res.rows[0]!)
}

export async function listVentures(pool: Pool, personId: string): Promise<Venture[]> {
  const res = await pool.query<VentureRow>(
    `select * from startup.ventures where person_id = $1 order by created_at desc`,
    [personId],
  )
  return res.rows.map(toVenture)
}

export async function updateVentureStage(
  pool: Pool,
  personId: string,
  ventureId: string,
  stage: VentureStage,
): Promise<Venture> {
  return await withTransaction(pool, async (client) => {
    const existing = await client.query<VentureRow>(
      `select * from startup.ventures where id = $1 and person_id = $2`,
      [ventureId, personId],
    )
    if (!existing.rows[0]) throw new NotFoundError('Không tìm thấy Venture')

    const res = await client.query<VentureRow>(
      `update startup.ventures set stage = $1, version = version + 1, updated_at = now()
       where id = $2 and person_id = $3 returning *`,
      [stage, ventureId, personId],
    )
    return toVenture(res.rows[0]!)
  })
}

// ── Problem CRUD ─────────────────────────────────────────────────────────────

export async function createProblem(
  pool: Pool,
  personId: string,
  input: {
    ventureId: string
    statement: string
    customerSegment: string
    severity: string
  },
): Promise<Problem> {
  const id = randomUUID()
  const res = await pool.query<ProblemRow>(
    `insert into startup.problems (id, venture_id, person_id, statement, customer_segment, severity, version)
     values ($1, $2, $3, $4, $5, $6, 1)
     returning *`,
    [id, input.ventureId, personId, input.statement, input.customerSegment, input.severity],
  )
  return toProblem(res.rows[0]!)
}

export async function listProblems(
  pool: Pool,
  personId: string,
  ventureId: string,
): Promise<Problem[]> {
  const res = await pool.query<ProblemRow>(
    `select * from startup.problems where venture_id = $1 and person_id = $2 order by created_at desc`,
    [ventureId, personId],
  )
  return res.rows.map(toProblem)
}

// ── Hypothesis CRUD ──────────────────────────────────────────────────────────

export async function createHypothesis(
  pool: Pool,
  personId: string,
  input: {
    ventureId: string
    statement: string
    hypothesisType: string
  },
): Promise<Hypothesis> {
  const id = randomUUID()
  const res = await pool.query<HypothesisRow>(
    `insert into startup.hypotheses (id, venture_id, person_id, statement, hypothesis_type, status, version)
     values ($1, $2, $3, $4, $5, 'unverified', 1)
     returning *`,
    [id, input.ventureId, personId, input.statement, input.hypothesisType],
  )
  return toHypothesis(res.rows[0]!)
}

export async function updateHypothesisStatus(
  pool: Pool,
  personId: string,
  hypothesisId: string,
  status: HypothesisStatus,
): Promise<Hypothesis> {
  return await withTransaction(pool, async (client) => {
    const existing = await client.query<HypothesisRow>(
      `select * from startup.hypotheses where id = $1 and person_id = $2`,
      [hypothesisId, personId],
    )
    if (!existing.rows[0]) throw new NotFoundError('Không tìm thấy Hypothesis')

    const res = await client.query<HypothesisRow>(
      `update startup.hypotheses set status = $1, version = version + 1, updated_at = now()
       where id = $2 and person_id = $3 returning *`,
      [status, hypothesisId, personId],
    )
    return toHypothesis(res.rows[0]!)
  })
}

export async function listHypotheses(
  pool: Pool,
  personId: string,
  ventureId: string,
): Promise<Hypothesis[]> {
  const res = await pool.query<HypothesisRow>(
    `select * from startup.hypotheses where venture_id = $1 and person_id = $2 order by created_at desc`,
    [ventureId, personId],
  )
  return res.rows.map(toHypothesis)
}

// ── Evidence CRUD — Gate: requires provenance, cannot be AI-hallucinated ─────

export async function recordEvidence(
  pool: Pool,
  personId: string,
  input: {
    ventureId: string
    hypothesisId?: string
    title: string
    evidenceType: string
    provenance: string
    findings: string
    supportsHypothesis: boolean
    collectedAt?: string
  },
): Promise<ValidatedEvidence> {
  const id = randomUUID()
  const res = await pool.query<EvidenceRow>(
    `insert into startup.evidence
      (id, venture_id, hypothesis_id, person_id, title, evidence_type, provenance, findings, supports_hypothesis, collected_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     returning *`,
    [
      id,
      input.ventureId,
      input.hypothesisId ?? null,
      personId,
      input.title,
      input.evidenceType,
      input.provenance,
      input.findings,
      input.supportsHypothesis,
      input.collectedAt ?? new Date().toISOString(),
    ],
  )

  // Update evidence_count on related problems
  if (input.hypothesisId) {
    await pool.query(
      `update startup.problems
       set evidence_count = evidence_count + 1
       where venture_id = $1 and person_id = $2`,
      [input.ventureId, personId],
    )
  }

  return toEvidence(res.rows[0]!)
}

export async function listEvidence(
  pool: Pool,
  personId: string,
  ventureId: string,
): Promise<ValidatedEvidence[]> {
  const res = await pool.query<EvidenceRow>(
    `select * from startup.evidence where venture_id = $1 and person_id = $2 order by collected_at desc`,
    [ventureId, personId],
  )
  return res.rows.map(toEvidence)
}
