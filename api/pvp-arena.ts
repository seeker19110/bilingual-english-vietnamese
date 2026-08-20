// api/pvp-arena.ts — REST handler cho Đấu Trường Đối Kháng 1v1 PvP & Ghost Matchmaking.
import { jsonResponse } from './_lib/http.js'
import { validateAuth } from '../packages/core-auth/security.js'
import {
  createPvPMatch,
  finalizePvPMatch,
  simulateGhostAction,
  calculatePoints,
  getWeeklyLeaderboard,
  getRankTierFromElo,
} from '../packages/core-ai/pvpArenaService.js'
import {
  type PvPMatchState,
  type PvPPlayerProfile,
  type PvPGameMode,
  type PvPRoundAction,
} from '../packages/core-contracts/pvpArena.js'

// In-memory match store
const activeMatches = new Map<string, PvPMatchState>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  const auth = await validateAuth(req)
  const userId = auth?.userId || 'guest-learner'
  const userName = auth?.userId ? 'Learner' : 'Khách Học Viên'

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
