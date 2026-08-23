import { getAuthHeader } from '@core/authHeader'
import type {
  LifeGraphNode,
  LifeGraphEdge,
  LifeGraphNodeType,
  LifeRelation,
} from '@dhcb/core-contracts/lifeGraph'
import type { Goal } from '@dhcb/core-contracts/goal'

export async function listLifeGraphNodes(type?: LifeGraphNodeType): Promise<LifeGraphNode[]> {
  const url = new URL(window.location.origin + '/api/life-graph')
  url.searchParams.set('kind', 'nodes')
  if (type) url.searchParams.set('type', type)

  const headers = await getAuthHeader()
  const res = await fetch(url.toString(), { headers })
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  const data = await res.json()
  return data.nodes
}

export async function listLifeGraphEdges(): Promise<LifeGraphEdge[]> {
  const url = new URL(window.location.origin + '/api/life-graph')
  url.searchParams.set('kind', 'edges')

  const headers = await getAuthHeader()
  const res = await fetch(url.toString(), { headers })
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  const data = await res.json()
  return data.edges
}

export async function createLifeGraphNode(
  type: LifeGraphNodeType,
  label: string,
): Promise<{ node: LifeGraphNode }> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life-graph', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'node', type, label }),
  })
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  return res.json()
}

export async function createLifeGraphEdge(
  fromNodeId: string,
  toNodeId: string,
  relation: LifeRelation,
  provenance: string,
): Promise<{ edge: LifeGraphEdge }> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life-graph', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'edge', fromNodeId, toNodeId, relation, provenance }),
  })
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  return res.json()
}

export async function backfillLifeGoal(): Promise<{ nodeId: string; learningGoal: Goal }> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life-goals', {
    method: 'POST',
    headers,
  })
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  return res.json()
}
