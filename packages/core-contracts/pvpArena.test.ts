// packages/core-contracts/pvpArena.test.ts
import { describe, it, expect } from 'vitest'
import {
  PvPGameModeSchema,
  PvPRankTierSchema,
  PvPPlayerProfileSchema,
  PvPQuestionItemSchema,
  PvPMatchStateSchema,
  PvPRoundActionSchema,
} from './pvpArena.js'

describe('pvpArena contracts', () => {
  it('validates PvP game modes, question items and rank tiers', () => {
    expect(PvPGameModeSchema.parse('vocab_speed_duel')).toBe('vocab_speed_duel')
    expect(PvPRankTierSchema.parse('diamond')).toBe('diamond')
    expect(() => PvPRankTierSchema.parse('unranked')).toThrow()
    expect(PvPQuestionItemSchema.shape.prompt).toBeDefined()
  })

  it('validates player profile schema with defaults', () => {
    const profile = PvPPlayerProfileSchema.parse({
      id: 'player-1',
      name: 'Nguyen Van A',
      avatar: '⚡',
    })
    expect(profile.eloRating).toBe(1000)
    expect(profile.rankTier).toBe('bronze')
    expect(profile.winStreak).toBe(0)
    expect(profile.isGhostBot).toBe(false)
  })

  it('validates complete match state schema', () => {
    const now = new Date().toISOString()
    const match = PvPMatchStateSchema.parse({
      matchId: 'match-101',
      mode: 'vocab_speed_duel',
      player1: {
        id: 'p1',
        name: 'Alex',
        avatar: '🦁',
        eloRating: 1250,
        rankTier: 'silver',
      },
      player2: {
        id: 'p2',
        name: 'Cyber Rival',
        avatar: '🤖',
        eloRating: 1240,
        rankTier: 'silver',
        isGhostBot: true,
      },
      questions: [
        {
          id: 'q1',
          prompt: 'What is the synonym of "Ubiquitous"?',
          options: ['Omnipresent', 'Scarcity', 'Ephemeral', 'Obsolete'],
          correctIndex: 0,
          explanation: 'Ubiquitous means present, appearing, or found everywhere.',
          timeLimitSec: 5,
        },
      ],
      currentRound: 0,
      totalRounds: 1,
      scores: {
        player1Score: 0,
        player2Score: 0,
      },
      status: 'in_progress',
      createdAt: now,
      updatedAt: now,
    })
    expect(match.matchId).toBe('match-101')
    expect(match.questions[0]!.options.length).toBe(4)
  })

  it('validates round action schema', () => {
    const action = PvPRoundActionSchema.parse({
      roundIndex: 0,
      playerId: 'p1',
      selectedOption: 0,
      responseTimeMs: 1420,
      isCorrect: true,
      pointsEarned: 185,
    })
    expect(action.isCorrect).toBe(true)
    expect(action.pointsEarned).toBe(185)
  })
})
