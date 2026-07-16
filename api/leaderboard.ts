// api/leaderboard.ts — Giải đấu tuần (② M5, docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md).
//
// GET  /api/leaderboard (cần đăng nhập)
//   → { week: {start,end}, me: {optedIn, nickname, points, rank}, top: RankedEntry[] }
//   Chỉ user đã opt-in (`profiles.league_opt_in`) mới xuất hiện trong `top`; `me` luôn trả về
//   (kể cả chưa opt-in — points/rank là null) để UI hiện đúng trạng thái "chưa tham gia".
//
// POST /api/leaderboard (cần đăng nhập), body { action, ... }:
//   action="set-nickname" { nickname } → validate (3-20 ký tự, lọc từ bậy) + kiểm tra trùng tên
//     (unique index case-insensitive `profiles_nickname_unique_idx`) → lưu + tự bật opt-in.
//   action="opt-out" → tắt hiện diện trên bảng xếp hạng (giữ nickname để bật lại không cần gõ lại).
//
// Điểm tính Ở SERVER từ dữ liệu server-side đã có (daily_usage + challenge_entries) — xem
// api/_lib/leaderboard.ts. Client KHÔNG gửi điểm lên.

import { z } from 'zod'
import { getSupabaseAdmin } from './_lib/supabaseAdmin'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from './_lib/security'
import { validateBody, readJsonBody } from './_lib/validation'
import { jsonResponse, getClientIp } from './_lib/http'
import { vnDateStr } from './_lib/date'
import {
  currentWeekRange,
  computeWeeklyPoints,
  rankEntries,
  validateNickname,
  LEADERBOARD_TOP_LIMIT,
  type WeeklyUsageRow,
  type LeagueEntry,
  type RankedEntry,
} from './_lib/leaderboard'

interface ProfileRow {
  id: string
  nickname: string | null
  league_opt_in: boolean
}
interface UsageRow extends WeeklyUsageRow {
  user_id: string
}
interface ChallengeRow {
  user_id: string
}

// Cache 5 phút — bảng xếp hạng KHÔNG cần tươi tuyệt đối, đỡ query lại toàn bộ mỗi request
// (xem đặc tả "Cache server 5 phút"). In-memory, mất khi restart process — chấp nhận (giống
// checkRateLimit ở security.ts).
const CACHE_TTL_MS = 5 * 60_000
let cache: { weekStart: string; computedAt: number; entries: RankedEntry[] } | null = null

async function computeRankedEntries(weekStart: string, weekEnd: string): Promise<RankedEntry[]> {
  if (cache && cache.weekStart === weekStart && Date.now() - cache.computedAt < CACHE_TTL_MS) {
    return cache.entries
  }

  const supabase = getSupabaseAdmin()
  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('id, nickname, league_opt_in')
    .eq('league_opt_in', true)
  if (profilesErr) throw new Error(profilesErr.message)

  const opted = (profiles ?? []) as ProfileRow[]
  if (opted.length === 0) {
    const entries = rankEntries([])
    cache = { weekStart, computedAt: Date.now(), entries }
    return entries
  }
  const optedIds = opted.map((p) => p.id)

  const [{ data: usageRows, error: usageErr }, { data: challengeRows, error: challengeErr }] =
    await Promise.all([
      supabase
        .from('daily_usage')
        .select('user_id, learn_count, chat_count, writing_count, speaking_count')
        .in('user_id', optedIds)
        .gte('day', weekStart)
        .lte('day', weekEnd),
      supabase
        .from('challenge_entries')
        .select('user_id')
        .in('user_id', optedIds)
        .gte('day', weekStart)
        .lte('day', weekEnd),
    ])
  if (usageErr) throw new Error(usageErr.message)
  // challenge_entries có thể chưa tồn tại (migration 0010 chưa chạy) — best-effort, không vỡ
  // bảng xếp hạng nếu thiếu, chỉ thiếu điểm challenge.
  if (challengeErr)
    console.warn('[leaderboard] không đọc được challenge_entries:', challengeErr.message)

  const usageByUser = new Map<string, WeeklyUsageRow[]>()
  for (const r of (usageRows ?? []) as UsageRow[]) {
    const list = usageByUser.get(r.user_id) ?? []
    list.push(r)
    usageByUser.set(r.user_id, list)
  }
  const challengeCountByUser = new Map<string, number>()
  for (const r of (challengeRows ?? []) as ChallengeRow[]) {
    challengeCountByUser.set(r.user_id, (challengeCountByUser.get(r.user_id) ?? 0) + 1)
  }

  const leagueEntries: LeagueEntry[] = opted.map((p) => ({
    userId: p.id,
    nickname: p.nickname ?? '(chưa đặt tên)',
    points: computeWeeklyPoints(usageByUser.get(p.id) ?? [], challengeCountByUser.get(p.id) ?? 0),
  }))

  const entries = rankEntries(leagueEntries)
  cache = { weekStart, computedAt: Date.now(), entries }
  return entries
}

const SetNicknameSchema = z.object({
  action: z.literal('set-nickname'),
  nickname: z.string().min(1).max(64),
})
const OptOutSchema = z.object({ action: z.literal('opt-out') })
const BodySchema = z.union([SetNicknameSchema, OptOutSchema])

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!checkRateLimit(clientIp, 30, 'leaderboard')) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/leaderboard' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  if (req.method === 'GET') {
    const { start, end } = currentWeekRange(vnDateStr())
    let ranked: RankedEntry[]
    try {
      ranked = await computeRankedEntries(start, end)
    } catch (err) {
      console.error('[leaderboard] lỗi tính bảng xếp hạng:', err)
      return jsonResponse({ error: 'Không tải được bảng xếp hạng' }, 500, allHeaders)
    }
    const mine = ranked.find((e) => e.userId === auth.userId) ?? null

    // Trạng thái opt-in/nickname của MÌNH luôn cần chính xác (kể cả chưa vào top) — đọc riêng.
    const supabase = getSupabaseAdmin()
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('nickname, league_opt_in')
      .eq('id', auth.userId)
      .maybeSingle()

    return jsonResponse(
      {
        week: { start, end },
        me: {
          optedIn: !!myProfile?.league_opt_in,
          nickname: myProfile?.nickname ?? null,
          points: mine?.points ?? null,
          rank: mine?.rank ?? null,
        },
        top: ranked.slice(0, LEADERBOARD_TOP_LIMIT).map((e) => ({
          nickname: e.nickname,
          points: e.points,
          rank: e.rank,
        })),
      },
      200,
      allHeaders,
    )
  }

  if (req.method === 'POST') {
    const parsedBody = await readJsonBody(req)
    if (!parsedBody.ok)
      return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)
    const result = validateBody(BodySchema, parsedBody.raw)
    if (!result.ok)
      return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)

    const supabase = getSupabaseAdmin()

    if (result.data.action === 'set-nickname') {
      const validation = validateNickname(result.data.nickname)
      if (!validation.ok) return jsonResponse({ error: validation.reason }, 400, allHeaders)

      const { error } = await supabase
        .from('profiles')
        .update({ nickname: validation.nickname, league_opt_in: true })
        .eq('id', auth.userId)

      if (error) {
        // 23505 = unique_violation (Postgres) — trùng nickname với người khác.
        if (error.code === '23505') {
          return jsonResponse(
            { error: 'Biệt danh này đã có người dùng, chọn tên khác nhé' },
            409,
            allHeaders,
          )
        }
        console.error('[leaderboard] lỗi lưu nickname:', error.message)
        return jsonResponse({ error: 'Không lưu được biệt danh' }, 500, allHeaders)
      }
      cache = null // bảng xếp hạng vừa đổi thành viên — bỏ cache cũ
      return jsonResponse({ ok: true, nickname: validation.nickname }, 200, allHeaders)
    }

    // action === 'opt-out'
    const { error } = await supabase
      .from('profiles')
      .update({ league_opt_in: false })
      .eq('id', auth.userId)
    if (error) {
      console.error('[leaderboard] lỗi opt-out:', error.message)
      return jsonResponse({ error: 'Không cập nhật được trạng thái' }, 500, allHeaders)
    }
    cache = null
    return jsonResponse({ ok: true }, 200, allHeaders)
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
}
