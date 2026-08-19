// packages/core-ai/debateArenaService.test.ts
import { describe, it, expect } from 'vitest'
import { DebateArenaService } from './debateArenaService.js'

describe('DebateArenaService', () => {
  it('creates debate session with correct opposing personas', () => {
    const session = DebateArenaService.createDebateSession('11111111-1111-4111-8111-111111111111', {
      topicId: 'ai-governance',
      motion: 'AI systems must undergo mandatory ethical auditing.',
      category: 'technology',
      userStance: 'support',
      difficulty: 'advanced_c1',
      maxRounds: 4,
    })

    expect(session.id).toBeDefined()
    expect(session.personas.length).toBe(2)
    expect(session.personas.some((p) => p.role === 'negative')).toBe(true)
    expect(session.personas.some((p) => p.role === 'socratic_moderator')).toBe(true)
  })

  it('analyzes user argument, detecting advanced vocab and Toulmin structures', () => {
    const analysis = DebateArenaService.analyzeArgumentTurn(
      'It is paramount to mitigate risks because empirical evidence shows high vulnerability. Therefore, regulation is indispensable.',
    )

    expect(analysis.detectedFallacy).toBe('none')
    expect(analysis.advancedVocabulary).toContain('paramount')
    expect(analysis.advancedVocabulary).toContain('mitigate')
    expect(analysis.advancedVocabulary).toContain('indispensable')
    expect(analysis.toulmin.hasValidStructure).toBe(true)
    expect(analysis.logicScore).toBeGreaterThanOrEqual(80)
    expect(analysis.persuasionScore).toBeGreaterThanOrEqual(80)
  })

  it('detects logical fallacies like ad hominem', () => {
    const analysis = DebateArenaService.analyzeArgumentTurn(
      'The opponent is an idiot and they do not know anything about this topic.',
    )

    expect(analysis.detectedFallacy).toBe('ad_hominem')
    expect(analysis.fallacyExplanation).toBeDefined()
    expect(analysis.logicScore).toBeLessThan(60)
  })

  it('generates AI turn and evaluates overall match rubric', () => {
    const session = DebateArenaService.createDebateSession('11111111-1111-4111-8111-111111111111', {
      topicId: 'macroeconomics',
      motion: 'Universal Basic Income promotes innovation.',
      category: 'economics',
      userStance: 'support',
      difficulty: 'advanced_c1',
      maxRounds: 2,
    })

    const aiTurn = DebateArenaService.generateAiTurn(session, 'negative')
    expect(aiTurn.speakerRole).toBe('negative')
    expect(aiTurn.content.length).toBeGreaterThan(20)

    const userTurn = {
      id: 'turn-u',
      speakerId: 'user',
      speakerName: 'Learner',
      speakerRole: 'user' as const,
      content:
        'UBI provides security because people can afford higher education. Therefore, entrepreneurship thrives.',
      detectedFallacy: 'none' as const,
      toulmin: { claim: 'UBI boosts business', hasValidStructure: true },
      advancedVocabulary: ['entrepreneurship'],
      logicScore: 85,
      persuasionScore: 85,
      timestamp: new Date().toISOString(),
    }

    session.turns.push(userTurn)
    session.turns.push(aiTurn)

    const rubric = DebateArenaService.evaluateDebateMatch(session)
    expect(rubric.overallScore).toBeGreaterThanOrEqual(70)
    expect(rubric.strengths.length).toBeGreaterThan(0)
    expect(rubric.recommendedPhrases.length).toBeGreaterThan(0)
  })
})
