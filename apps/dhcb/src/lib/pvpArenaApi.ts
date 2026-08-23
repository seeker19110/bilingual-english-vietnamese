// apps/dhcb/src/lib/pvpArenaApi.ts — Client API cho Đấu Trường Đối Kháng 1v1 PvP.
import { getAuthHeader } from '@core/authHeader'
import type {
  PvPMatchState,
  PvPPlayerProfile,
  PvPGameMode,
  PvPLeaderboardEntry,
  PvPRoundAction,
} from '@dhcb/core-contracts/pvpArena'

export async function fetchPvPProfile(): Promise<{
  profile: PvPPlayerProfile
  leaderboard: PvPLeaderboardEntry[]
}> {
  const res = await fetch('/api/pvp-arena', {
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return {
    profile: data.profile,
    leaderboard: data.leaderboard || [],
  }
}

export async function matchmakePvPMatch(
  mode: PvPGameMode,
  playerProfile?: PvPPlayerProfile,
): Promise<PvPMatchState> {
  const res = await fetch('/api/pvp-arena?action=matchmake', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ mode, playerProfile }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.match
}

export async function submitPvPRoundAction(payload: {
  matchId: string
  roundIndex: number
  selectedOption: number
  responseTimeMs: number
}): Promise<{
  success: boolean
  p1Action: PvPRoundAction
  p2Action: PvPRoundAction
  match: PvPMatchState
  isMatchCompleted: boolean
}> {
  const res = await fetch('/api/pvp-arena?action=submit_round', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || `HTTP ${res.status}`)
  }
  return await res.json()
}
