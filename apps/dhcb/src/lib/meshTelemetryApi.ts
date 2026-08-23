// apps/dhcb/src/lib/meshTelemetryApi.ts — Client API giao tiếp WebSocket Mesh & Realtime Telemetry.
import { RealtimeSessionTelemetry, AiProviderType } from '@dhcb/core-contracts/meshTelemetry'

export interface MeshStatusSummary {
  activeNodes: number
  overallQuality: number
  region: string
}

export async function fetchMeshTelemetry(): Promise<{
  telemetry: RealtimeSessionTelemetry
  meshStatus: MeshStatusSummary
}> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/mesh-telemetry', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!res.ok) {
    throw new Error(`Lỗi tải telemetry: ${res.status}`)
  }

  const data = await res.json()
  return { telemetry: data.telemetry, meshStatus: data.meshStatus }
}

export async function recordLiveSessionMetric(params: {
  addedTokens: number
  addedAudioSeconds: number
  provider?: AiProviderType
  latencyMs?: number
}): Promise<RealtimeSessionTelemetry> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/mesh-telemetry?action=record_metric', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`Lỗi ghi nhận metric: ${res.status}`)
  }

  const data = await res.json()
  return data.telemetry
}

export async function resetSessionBudget(costCapUsd: number): Promise<RealtimeSessionTelemetry> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/mesh-telemetry?action=reset_budget', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ costCapUsd }),
  })

  if (!res.ok) {
    throw new Error(`Lỗi reset budget: ${res.status}`)
  }

  const data = await res.json()
  return data.telemetry
}
