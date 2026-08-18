// apps/english/src/lib/proactiveBriefingApi.ts — Client API for Proactive Companion Briefings.
import type { ProactiveBriefing } from '../../../../packages/core-contracts/proactiveBriefing'

export async function fetchProactiveBriefing(
  type?: 'morning' | 'evening',
): Promise<ProactiveBriefing> {
  const url = type ? `/api/proactive-briefing?type=${type}` : '/api/proactive-briefing'
  const resp = await fetch(url)

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}))
    throw new Error(data.error || `Lỗi tải bản tin chủ động (${resp.status})`)
  }

  const data = await resp.json()
  return data.briefing
}
