// api/pvp-arena.ts — REST handler cho Đấu Trường Đối Kháng 1v1 PvP & Ghost Matchmaking.
import { jsonResponse } from '@dhcb/core-http/http'
import { validateAuth, getCorsHeaders } from '@dhcb/core-auth/security'
import {
  createPvPMatch,
  finalizePvPMatch,
  simulateGhostAction,
  calculatePoints,
  getWeeklyLeaderboard,
  getRankTierFromElo,
} from '@dhcb/core-ai/pvpArenaService'
import {
  type PvPMatchState,
  type PvPPlayerProfile,
  type PvPGameMode,
  type PvPRoundAction,
} from '@dhcb/core-contracts/pvpArena'

// In-memory match store
const activeMatches = new Map<string, PvPMatchState>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const auth = await validateAuth(req)
  // Bắt buộc đăng nhập — trước đây fallback 'guest-learner' khiến mọi khách vãng lai dùng
  // chung một hồ sơ PvP (vá 2026-08-23, đề xuất N1 mục B1).
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }
  const userId = auth.userId
  const userName = 'Learner'

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (req.method === 'GET') {
    if (action === 'leaderboard') {
      const leaderboard = getWeeklyLeaderboard(userId)
      return jsonResponse({ success: true, leaderboard }, 200)
    }

    if (action === 'get_match') {
      const matchId = url.searchParams.get('matchId')
      if (!matchId) return jsonResponse({ error: 'Missing matchId' }, 400)
      const match = activeMatches.get(matchId)
      if (!match) return jsonResponse({ error: 'Match not found' }, 404)
      return jsonResponse({ success: true, match }, 200)
    }

    // Default: Trả về hồ sơ PvP & leaderboard
    const profile: PvPPlayerProfile = {
      id: userId,
      name: userName,
      avatar: '🦁',
      eloRating: 1250,
      rankTier: getRankTierFromElo(1250),
      winStreak: 2,
      totalMatches: 8,
      wins: 5,
      isGhostBot: false,
    }
    const leaderboard = getWeeklyLeaderboard(userId)
    return jsonResponse({ success: true, profile, leaderboard }, 200)
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'matchmake') {
        const mode: PvPGameMode = body.mode || 'vocab_speed_duel'
        const playerProfile: PvPPlayerProfile = body.playerProfile || {
          id: userId,
          name: userName,
          avatar: '🦁',
          eloRating: 1250,
          rankTier: getRankTierFromElo(1250),
          winStreak: 0,
          totalMatches: 0,
          wins: 0,
          isGhostBot: false,
        }

        const match = createPvPMatch(playerProfile, mode)
        activeMatches.set(match.matchId, match)
        return jsonResponse({ success: true, match }, 200)
      }

      if (action === 'submit_round') {
        const { matchId, roundIndex, selectedOption, responseTimeMs } = body
        if (!matchId || roundIndex === undefined || selectedOption === undefined) {
          return jsonResponse({ error: 'Missing required parameters' }, 400)
        }

        let match = activeMatches.get(matchId)
        if (!match) {
          return jsonResponse({ error: 'Match not found or expired' }, 404)
        }

        const currentQ = match.questions[roundIndex]
        if (!currentQ) {
          return jsonResponse({ error: 'Invalid roundIndex' }, 400)
        }

        const isCorrect = selectedOption === currentQ.correctIndex
        const p1Points = calculatePoints(
          isCorrect,
          responseTimeMs,
          currentQ.timeLimitSec,
          match.player1.winStreak,
        )

        const p1Action: PvPRoundAction = {
          roundIndex,
          playerId: match.player1.id,
          selectedOption,
          responseTimeMs,
          isCorrect,
          pointsEarned: p1Points,
        }

        // Mô phỏng lượt của đối thủ Ghost Rival
        const p2Action = simulateGhostAction(currentQ, match.player2, roundIndex, 1)

        match.scores.player1Score += p1Points
        match.scores.player2Score += p2Action.pointsEarned
        match.actions.push(p1Action, p2Action)
        match.currentRound = roundIndex + 1

        let isMatchCompleted = false
        if (match.currentRound >= match.totalRounds) {
          match = finalizePvPMatch(match)
          isMatchCompleted = true
        } else {
          match.updatedAt = new Date().toISOString()
        }

        activeMatches.set(matchId, match)

        return jsonResponse(
          {
            success: true,
            p1Action,
            p2Action,
            match,
            isMatchCompleted,
          },
          200,
        )
      }

      return jsonResponse({ error: 'Invalid action parameter' }, 400)
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON payload', details: String(err) }, 400)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
