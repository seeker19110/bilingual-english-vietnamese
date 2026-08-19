// packages/core-contracts/debateArena.test.ts
import { describe, it, expect } from 'vitest'
import {
  DebatePersonaSchema,
  DebateTurnSchema,
  DebateSessionStateSchema,
  DebateRubricScoreSchema,
} from './debateArena.js'

describe('DebateArena Contracts', () => {
  it('validates DebatePersonaSchema successfully', () => {
    const persona = {
      id: 'p-1',
      name: 'Dr. Evelyn Vance',
      avatar: '👩‍🏫',
      role: 'socratic_moderator',
      stance: 'Neutral and inquiry-driven',
      style: 'philosophical',
      cefrTargetLevel: 'C1',
    }
    const result = DebatePersonaSchema.safeParse(persona)
    expect(result.success).toBe(true)
  })

  it('validates DebateTurnSchema with Toulmin elements', () => {
    const turn = {
      id: 'turn-1',
      speakerId: 'user-1',
      speakerName: 'Alex',
      speakerRole: 'user',
      content: 'AI accelerates medical breakthroughs, hence governments should subsidize research.',
      detectedFallacy: 'none',
      toulmin: {
        claim: 'Governments should subsidize AI medical research.',
        evidence: 'AI accelerates medical breakthroughs.',
        warrant: 'Public funding speeds up life-saving healthcare innovations.',
        hasValidStructure: true,
      },
      advancedVocabulary: ['accelerate', 'breakthrough', 'subsidize'],
      logicScore: 88,
      persuasionScore: 85,
      timestamp: '2026-08-20T00:00:00.000Z',
    }
    const result = DebateTurnSchema.safeParse(turn)
    expect(result.success).toBe(true)
  })

  it('validates DebateSessionStateSchema with full lifecycle', () => {
    const session = {
      id: 'deb-session-1',
      personId: '11111111-1111-4111-8111-111111111111',
      config: {
        topicId: 'ai-ethics-1',
        motion: 'This house believes that AI development should be paused for safety audits.',
        category: 'technology',
        userStance: 'oppose',
        difficulty: 'advanced_c1',
        maxRounds: 4,
      },
      personas: [
        {
          id: 'ai-aff',
          name: 'Marcus Reed',
          avatar: '🏛️',
          role: 'affirmative',
          stance: 'Immediate pause is essential to establish alignment safeguards.',
          style: 'analytical',
          cefrTargetLevel: 'C1',
        },
      ],
      turns: [],
      currentRound: 1,
      status: 'active',
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: '2026-08-20T00:00:00.000Z',
    }
    const result = DebateSessionStateSchema.safeParse(session)
    expect(result.success).toBe(true)
  })

  it('validates DebateRubricScoreSchema', () => {
    const rubric = {
      toulminStructureScore: 90,
      fallacyAvoidanceScore: 95,
      lexicalResourceScore: 85,
      rebuttalEffectivenessScore: 88,
      overallScore: 89.5,
      strengths: ['Clear claims backed by data', 'Effective rhetorical questions'],
      areasForImprovement: ['Elaborate warrants more explicitly'],
      recommendedPhrases: ['It is incumbent upon us to consider', 'Notwithstanding the assertion'],
    }
    const result = DebateRubricScoreSchema.safeParse(rubric)
    expect(result.success).toBe(true)
  })
})
