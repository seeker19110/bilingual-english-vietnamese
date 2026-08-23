// apps/english/src/lib/knowledgeFabricApi.ts — Client API for Personal Knowledge Fabric, Facts, Memories, Automation & Privacy
import { getAuthHeader } from '@core/authHeader'
import type { PersonalFact, Sensitivity } from '@dhcb/core-contracts/personalFact'
import type { MemoryRecord, MemoryNamespace } from '@dhcb/core-contracts/personalMemory'
import type { AutomationGrant, ActionReceipt } from '@dhcb/core-contracts/automation'
import type {
  CrossDomainGraphProjection,
  CrossDomainSyncSummary,
} from '@dhcb/core-contracts/crossDomainGraph'

// ── Personal Facts ────────────────────────────────────────────────────────────

export async function listPersonalFacts(): Promise<PersonalFact[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/personal-facts', { headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  const data = await res.json()
  return data.facts
}

export async function declarePersonalFact(params: {
  category: string
  key: string
  value: string
  sensitivity?: Sensitivity
  confidence?: number
}): Promise<{ fact: PersonalFact }> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/personal-facts', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'declare',
      ...params,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function deletePersonalFact(id: string): Promise<{ success: boolean }> {
  const headers = await getAuthHeader()
  const res = await fetch(`/api/personal-facts?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

// ── Memory Records ────────────────────────────────────────────────────────────

export async function listMemories(namespace?: MemoryNamespace): Promise<MemoryRecord[]> {
  const url = new URL(window.location.origin + '/api/memories')
  if (namespace) url.searchParams.set('namespace', namespace)

  const headers = await getAuthHeader()
  const res = await fetch(url.toString(), { headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  const data = await res.json()
  return data.memories
}

export async function ingestMemory(candidate: {
  namespace: MemoryNamespace
  content: string
  provenance: string
  sensitivity: Sensitivity
  confidence?: number
}): Promise<{ outcome: string; memory?: MemoryRecord }> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/memories', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'ingest',
      candidate,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function deleteMemory(id: string): Promise<{ success: boolean }> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/memories', {
    method: 'DELETE',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

// ── Automation Grants & Receipts ──────────────────────────────────────────────

export async function listAutomation(): Promise<{
  grants: AutomationGrant[]
  receipts: ActionReceipt[]
}> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/automation', { headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function updateAutomationGrantStatus(
  id: string,
  action: 'pause' | 'resume' | 'revoke',
  expectedVersion: number,
  reason?: string,
): Promise<{ grant: AutomationGrant }> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/automation', {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      id,
      expectedVersion,
      ...(reason ? { reason } : {}),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

// ── Cross Domain Projection & Sync ────────────────────────────────────────────

export async function getCrossDomainProjection(): Promise<CrossDomainGraphProjection> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life-graph?kind=cross_domain', { headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  const data = await res.json()
  return data.projection
}

export async function syncCrossDomainGraph(): Promise<CrossDomainSyncSummary> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life-graph', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'cross_domain_sync' }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  const data = await res.json()
  return data.summary
}

// ── Data Portability & GDPR Erasure ───────────────────────────────────────────

export async function exportPersonalData(): Promise<Record<string, unknown>> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/persons?action=export', { headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function erasePersonalData(): Promise<{
  success: boolean
  erasedRecordsCount: number
}> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/persons?action=full_erase', {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(err.error || `HTTP error ${res.status}`)
  }
  return res.json()
}
