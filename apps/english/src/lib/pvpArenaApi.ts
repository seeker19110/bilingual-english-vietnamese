// apps/english/src/lib/pvpArenaApi.ts — Client API cho Đấu Trường Đối Kháng 1v1 PvP.
import type {
  PvPMatchState,
  PvPPlayerProfile,
  PvPGameMode,
  PvPLeaderboardEntry,
  PvPRoundAction,
} from '../../../../packages/core-contracts/pvpArena'

function getAuthHeader(): Record<string, string> {
  try {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

export async function fetchPvPProfile(): Promise<{
  profile: PvPPlayerProfile
  leaderboard: PvPLeaderboardEntry[]
}> {
  try {
    const res = await fetch('/api/pvp-arena', {
      headers: { ...getAuthHeader() },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return {
      profile: data.profile,
      leaderboard: data.leaderboard || [],
    }
  } catch {
    return {
      profile: {
        id: 'local-player',
        name: 'Học Viên Tiên Phong',
        avatar: '🦁',
        eloRating: 1250,
        rankTier: 'gold',
        winStreak: 2,
        totalMatches: 8,
        wins: 5,
        isGhostBot: false,
      },
      leaderboard: [
        {
          rank: 1,
          playerId: 'top-1',
          name: 'Nguyen Hoang Long',
          avatar: '👑',
          eloRating: 2450,
          rankTier: 'master',
          winStreak: 12,
          winRate: 84.5,
        },
        {
          rank: 2,
          playerId: 'top-2',
          name: 'Elena Vu',
          avatar: '💎',
          eloRating: 2280,
          rankTier: 'master',
          winStreak: 8,
          winRate: 79.2,
        },
        {
          rank: 3,
          playerId: 'local-player',
          name: 'Bạn (Learner)',
          avatar: '🦁',
          eloRating: 1250,
          rankTier: 'gold',
          winStreak: 2,
          winRate: 62.5,
        },
      ],
    }
  }
}

export async function matchmakePvPMatch(
  mode: PvPGameMode,
  playerProfile?: PvPPlayerProfile,
): Promise<PvPMatchState> {
  try {
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
  } catch {
    // Fallback offline match state
    const now = new Date().toISOString()
    return {
      matchId: `local-match-${Date.now()}`,
      mode,
      player1: playerProfile || {
        id: 'local-p1',
        name: 'Bạn (Learner)',
        avatar: '🦁',
        eloRating: 1250,
        rankTier: 'gold',
        winStreak: 2,
        totalMatches: 8,
        wins: 5,
        isGhostBot: false,
      },
      player2: {
        id: 'rival-bot',
        name: 'Cyber Rival AI',
        avatar: '🤖',
        eloRating: 1240,
        rankTier: 'gold',
        winStreak: 1,
        totalMatches: 45,
        wins: 28,
        isGhostBot: true,
      },
      questions: [
        {
          id: 'q-demo-1',
          prompt: 'Từ đồng nghĩa với "Eloquent" là gì?',
          subPrompt: 'Choose the closest synonym for "Eloquent".',
          options: ['Articulate', 'Hesitant', 'Ambiguous', 'Hostile'],
          correctIndex: 0,
          explanation: '"Eloquent" và "Articulate" đều chỉ khả năng diễn đạt lưu loát, hùng hồn.',
          timeLimitSec: 5,
          cefrLevel: 'C1',
        },
        {
          id: 'q-demo-2',
          prompt: 'Từ trái nghĩa với "Meticulous" là gì?',
          subPrompt: 'Choose the antonym for "Meticulous".',
          options: ['Thorough', 'Careless', 'Punctual', 'Pragmatic'],
          correctIndex: 1,
          explanation: '"Meticulous" là tỉ mỉ; trái nghĩa là "Careless" (bất cẩn).',
          timeLimitSec: 5,
          cefrLevel: 'B2',
        },
        {
          id: 'q-demo-3',
          prompt: 'Điền từ: "Take something for ______"',
          options: ['granted', 'given', 'true', 'sure'],
          correctIndex: 0,
          explanation: '"Take for granted" nghĩa là coi điều gì là hiển nhiên.',
          timeLimitSec: 5,
          cefrLevel: 'B2',
        },
      ],
      currentRound: 0,
      totalRounds: 3,
      scores: { player1Score: 0, player2Score: 0 },
      actions: [],
      status: 'in_progress',
      winnerId: null,
      rewardExp: 0,
      createdAt: now,
      updatedAt: now,
    }
  }
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
  try {
    const res = await fetch('/api/pvp-arena?action=submit_round', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    // Offline simulated response
    const isCorrect = payload.selectedOption === 0
    const points = isCorrect ? 150 : 0
    const p1Action: PvPRoundAction = {
      roundIndex: payload.roundIndex,
      playerId: 'local-p1',
      selectedOption: payload.selectedOption,
      responseTimeMs: payload.responseTimeMs,
      isCorrect,
      pointsEarned: points,
    }
    const p2Action: PvPRoundAction = {
      roundIndex: payload.roundIndex,
      playerId: 'rival-bot',
      selectedOption: 0,
      responseTimeMs: 2100,
      isCorrect: true,
      pointsEarned: 130,
    }
    return {
      success: true,
      p1Action,
      p2Action,
      match: {
        matchId: payload.matchId,
        mode: 'vocab_speed_duel',
        player1: {
          id: 'local-p1',
          name: 'Bạn',
          avatar: '🦁',
          eloRating: 1250,
          rankTier: 'gold',
          winStreak: 2,
          totalMatches: 8,
          wins: 5,
          isGhostBot: false,
        },
        player2: {
          id: 'rival-bot',
          name: 'Cyber Rival',
          avatar: '🤖',
          eloRating: 1240,
          rankTier: 'gold',
          winStreak: 1,
          totalMatches: 45,
          wins: 28,
          isGhostBot: true,
        },
        questions: [],
        currentRound: payload.roundIndex + 1,
        totalRounds: 3,
        scores: { player1Score: points, player2Score: 130 },
        actions: [p1Action, p2Action],
        status: payload.roundIndex >= 2 ? 'completed' : 'in_progress',
        winnerId: payload.roundIndex >= 2 ? 'local-p1' : null,
        rewardExp: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isMatchCompleted: payload.roundIndex >= 2,
    }
  }
}
