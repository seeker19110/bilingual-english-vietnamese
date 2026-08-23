// src/lib/leaderboardApi.ts — Gọi /api/leaderboard (Giải đấu tuần, ② M5).
// Điểm tính Ở SERVER (api/leaderboard.ts + api/_lib/leaderboard.ts) — file này CHỈ gọi API,
// không tự tính gì ở client (đúng nguyên tắc "không tin client", CLAUDE.md §4.2).

import { getAuthHeader } from '@core/authHeader'

export interface LeaderboardEntry {
  nickname: string
  points: number
  rank: number
}

export interface LeaderboardResponse {
  week: { start: string; end: string }
  me: { optedIn: boolean; nickname: string | null; points: number | null; rank: number | null }
  top: LeaderboardEntry[]
}

async function readErrorMessage(resp: Response, fallback: string): Promise<string> {
  const body = await resp.json().catch(() => ({}))
  const msg = (body as { error?: string }).error
  return typeof msg === 'string' && msg ? msg : fallback
}

export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const auth = await getAuthHeader()
  const resp = await fetch('/api/leaderboard', { headers: auth })
  if (!resp.ok) {
    throw new Error(await readErrorMessage(resp, `Lỗi tải bảng xếp hạng (${resp.status})`))
  }
  return (await resp.json()) as LeaderboardResponse
}

export async function setLeagueNickname(nickname: string): Promise<{ nickname: string }> {
  const auth = await getAuthHeader()
  const resp = await fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...auth },
    body: JSON.stringify({ action: 'set-nickname', nickname }),
  })
  if (!resp.ok) {
    throw new Error(await readErrorMessage(resp, `Không lưu được biệt danh (${resp.status})`))
  }
  return (await resp.json()) as { nickname: string }
}

export async function optOutLeague(): Promise<void> {
  const auth = await getAuthHeader()
  const resp = await fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...auth },
    body: JSON.stringify({ action: 'opt-out' }),
  })
  if (!resp.ok) {
    throw new Error(await readErrorMessage(resp, `Không cập nhật được (${resp.status})`))
  }
}
