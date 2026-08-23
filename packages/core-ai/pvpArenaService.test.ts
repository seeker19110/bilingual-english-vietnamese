// packages/core-ai/pvpArenaService.test.ts
import { describe, it, expect } from 'vitest'
import {
  getRankTierFromElo,
  calculateEloDelta,
  generatePvPQuestions,
  matchmakeGhostRival,
  calculatePoints,
  simulateGhostAction,
  createPvPMatch,
  finalizePvPMatch,
} from './pvpArenaService.js'
import { type PvPPlayerProfile } from '@dhcb/core-contracts/pvpArena'

describe('pvpArenaService (1v1 PvP & Ghost Matchmaking Engine)', () => {
  it('maps elo ratings to correct rank tiers', () => {
    expect(getRankTierFromElo(950)).toBe('bronze')
    expect(getRankTierFromElo(1150)).toBe('silver')
    expect(getRankTierFromElo(1450)).toBe('gold')
    expect(getRankTierFromElo(1750)).toBe('platinum')
    expect(getRankTierFromElo(2050)).toBe('diamond')
    expect(getRankTierFromElo(2300)).toBe('master')
  })

  it('calculates Elo deltas accurately for win/loss/draw', () => {
    const deltaWin = calculateEloDelta(1200, 1200, 'win')
    expect(deltaWin).toBe(16)

    const deltaLoss = calculateEloDelta(1200, 1200, 'loss')
    expect(deltaLoss).toBe(-16)

    // Higher elo player beating lower elo player gains less elo
    const deltaFavored = calculateEloDelta(1600, 1200, 'win')
    expect(deltaFavored).toBeLessThan(16)
    expect(deltaFavored).toBeGreaterThanOrEqual(1)

    // Lower elo player beating higher elo player gains massive elo
    const deltaUnderdog = calculateEloDelta(1200, 1600, 'win')
    expect(deltaUnderdog).toBeGreaterThan(16)
  })

  it('generates questions for specified mode', () => {
    const vocabQuestions = generatePvPQuestions('vocab_speed_duel', 3)
    expect(vocabQuestions.length).toBe(3)
    expect(vocabQuestions[0]!.options.length).toBeGreaterThanOrEqual(2)

    const grammarQuestions = generatePvPQuestions('grammar_clash', 2)
    expect(grammarQuestions.length).toBe(2)
  })

  it('matchmakes a ghost rival close to player elo', () => {
    const player: PvPPlayerProfile = {
      id: 'p-1',
      name: 'Tester',
      avatar: '🌟',
      eloRating: 1500,
      rankTier: 'gold',
      winStreak: 2,
      totalMatches: 10,
      wins: 7,
      isGhostBot: false,
    }
    const rival = matchmakeGhostRival(player, 'vocab_speed_duel')
    expect(rival.isGhostBot).toBe(true)
    expect(Math.abs(rival.eloRating - player.eloRating)).toBeLessThanOrEqual(50)
  })

  it('calculates round points factoring speed and streak', () => {
    // Incorrect answer gives 0
    expect(calculatePoints(false, 1000, 5, 0)).toBe(0)

    // Perfect instant answer with streak 0
    const perfectPoints = calculatePoints(true, 0, 5, 0)
    expect(perfectPoints).toBe(200) // 100 base + 100 speed

    // Answer with remaining time
    const halfTimePoints = calculatePoints(true, 2500, 5, 0)
    expect(halfTimePoints).toBe(150) // 100 base + 50 speed

    // Multiplier with streak = 3
    const streakPoints = calculatePoints(true, 0, 5, 3)
    expect(streakPoints).toBe(260) // 200 * 1.3
  })

  it('simulates realistic ghost action', () => {
    const question = generatePvPQuestions('vocab_speed_duel', 1)[0]!
    const rival: PvPPlayerProfile = {
      id: 'bot-1',
      name: 'Cyber Bot',
      avatar: '🤖',
      eloRating: 1400,
      rankTier: 'gold',
      winStreak: 1,
      totalMatches: 50,
      wins: 30,
      isGhostBot: true,
    }
    const action = simulateGhostAction(question, rival, 0, 1)
    expect(action.playerId).toBe('bot-1')
    expect(action.responseTimeMs).toBeGreaterThan(0)
    expect(typeof action.isCorrect).toBe('boolean')
  })

  it('creates and finalizes a complete match flow', () => {
    const player: PvPPlayerProfile = {
      id: 'p-1',
      name: 'Player 1',
      avatar: '🦁',
      eloRating: 1300,
      rankTier: 'gold',
      winStreak: 0,
      totalMatches: 5,
      wins: 3,
      isGhostBot: false,
    }
    const match = createPvPMatch(player, 'vocab_speed_duel')
    expect(match.status).toBe('in_progress')
    expect(match.questions.length).toBe(5)

    // Simulate match completion
    match.scores.player1Score = 650
    match.scores.player2Score = 400

    const finalMatch = finalizePvPMatch(match)
    expect(finalMatch.status).toBe('completed')
    expect(finalMatch.winnerId).toBe('p-1')
    expect(finalMatch.eloChanges?.player1Delta).toBeGreaterThan(0)
    expect(finalMatch.rewardExp).toBe(120)
  })
})
