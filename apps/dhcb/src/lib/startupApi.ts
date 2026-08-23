// apps/dhcb/src/lib/startupApi.ts — Client API wrapper for Startup Domain (V2-16)
import { getAuthHeader } from '@core/authHeader'
import type { Venture, Problem, Hypothesis, ValidatedEvidence } from '@dhcb/core-contracts/startup'

export interface CreateVentureParams {
  name: string
  description?: string
  stage?: 'ideation' | 'validation' | 'mvp' | 'growth' | 'scale' | 'exited'
}

export interface CreateProblemParams {
  ventureId: string
  statement: string
  customerSegment: string
  severity: 'critical' | 'major' | 'minor'
}

export interface CreateHypothesisParams {
  ventureId: string
  statement: string
  hypothesisType: 'market' | 'customer' | 'problem' | 'solution' | 'business_model'
}

export interface RecordEvidenceParams {
  ventureId: string
  hypothesisId?: string
  title: string
  evidenceType: 'interview' | 'survey' | 'analytics' | 'test' | 'revenue' | 'observation'
  provenance: string
  findings: string
  supportsHypothesis: boolean
}

export async function listVentures(): Promise<Venture[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/startup?kind=ventures', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function createVenture(params: CreateVentureParams): Promise<Venture> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/startup', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'venture', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function updateVentureStage(
  id: string,
  stage: 'ideation' | 'validation' | 'mvp' | 'growth' | 'scale' | 'exited',
): Promise<Venture> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/startup', {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'venture_stage', id, stage }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function listProblems(ventureId: string): Promise<Problem[]> {
  const headers = await getAuthHeader()
  const res = await fetch(`/api/startup?kind=problems&ventureId=${encodeURIComponent(ventureId)}`, {
    headers,
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function createProblem(params: CreateProblemParams): Promise<Problem> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/startup', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'problem', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function listHypotheses(ventureId: string): Promise<Hypothesis[]> {
  const headers = await getAuthHeader()
  const res = await fetch(
    `/api/startup?kind=hypotheses&ventureId=${encodeURIComponent(ventureId)}`,
    {
      headers,
    },
  )
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function createHypothesis(params: CreateHypothesisParams): Promise<Hypothesis> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/startup', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'hypothesis', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function updateHypothesisStatus(
  id: string,
  status: 'unverified' | 'supported' | 'refuted' | 'pivoted',
): Promise<Hypothesis> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/startup', {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'hypothesis_status', id, status }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function listEvidence(
  ventureId: string,
  hypothesisId?: string,
): Promise<ValidatedEvidence[]> {
  const headers = await getAuthHeader()
  const url = hypothesisId
    ? `/api/startup?kind=evidence&ventureId=${encodeURIComponent(ventureId)}&hypothesisId=${encodeURIComponent(hypothesisId)}`
    : `/api/startup?kind=evidence&ventureId=${encodeURIComponent(ventureId)}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function recordEvidence(params: RecordEvidenceParams): Promise<ValidatedEvidence> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/startup', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'evidence', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}
