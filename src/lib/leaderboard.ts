// Lấy dữ liệu bảng xếp hạng toàn server từ Supabase.
// Dùng hàm RPC get_leaderboard() (SECURITY DEFINER) để đọc qua RLS an toàn.

import { supabase } from './supabase'

export type LeaderboardEntry = {
  id: string
  name: string
  user_level: string
  score: number
  words_learned: number
}

export type Period = 'week' | 'month'

export async function fetchLeaderboard(period: Period): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('get_leaderboard', { period })
  if (error) {
    console.warn('[leaderboard] lỗi:', error.message)
    return []
  }
  return (data ?? []) as LeaderboardEntry[]
}
