// apps/english/src/lib/lifeSynthesisApi.ts — REST Client cho Cross-Domain Life Synthesis Engine V5.4.
import type {
  LifeSynthesisReport,
  LifeDomainType,
} from '../../../../packages/core-contracts/lifeSynthesis.js'

export async function fetchLifeSynthesisReport(
  timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly',
): Promise<LifeSynthesisReport> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch(`/api/life-synthesis?timeframe=${timeframe}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!res.ok) {
    throw new Error(`Lỗi tải báo cáo tổng hợp đa miền: ${res.status}`)
  }

  const data = await res.json()
  return data.report
}

export async function generateCustomLifeSynthesisReport(params: {
  timeframe?: 'daily' | 'weekly' | 'monthly'
  domainActivityCounts?: Partial<Record<LifeDomainType, number>>
  metacognitiveAwarenessIndex?: number
  neuroEnergyScore?: number
  activeGoals?: Array<{
    id: string
    title: string
    domain: LifeDomainType
    targetDaysRemaining: number
    progressPercent: number
  }>
}): Promise<LifeSynthesisReport> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/life-synthesis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`Lỗi sinh báo cáo tổng hợp đa miền: ${res.status}`)
  }

  const data = await res.json()
  return data.report
}
