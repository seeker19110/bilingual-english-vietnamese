// apps/dhcb/src/lib/dailyQuestsApi.ts — Client API cho Daily Quests & Streak Vault.
import { getAuthHeader } from '@core/authHeader'
import type { DailyQuestsState, QuestCategory } from '@dhcb/core-contracts/dailyQuests'

export async function fetchDailyQuests(): Promise<DailyQuestsState> {
  const res = await fetch('/api/daily-quests', {
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.state
}

export async function updateQuestProgress(
  category: QuestCategory,
  amount = 1,
): Promise<DailyQuestsState> {
  const res = await fetch('/api/daily-quests?action=update_progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ category, amount }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.state
}

export async function claimMysteryChest(): Promise<{
  state: DailyQuestsState
  rewards: { streakFreeze: number; bonusExp: number; vipHours: number }
}> {
  const res = await fetch('/api/daily-quests?action=claim_chest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({}),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return {
    state: data.state,
    rewards: data.rewards,
  }
}
