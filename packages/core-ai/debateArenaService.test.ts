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

  it('generates AI turn and evaluates overall match rubric', async () => {
    const session = DebateArenaService.createDebateSession('11111111-1111-4111-8111-111111111111', {
      topicId: 'macroeconomics',
      motion: 'Universal Basic Income promotes innovation.',
      category: 'economics',
      userStance: 'support',
      difficulty: 'advanced_c1',
      maxRounds: 2,
    })

    const aiTurn = await DebateArenaService.generateAiTurn(session, 'negative')
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

  it('detects other fallacies: false_dilemma, slippery_slope, circular_reasoning', () => {
    const dilemma = DebateArenaService.analyzeArgumentTurn(
      'Either we ban all cars now or we will completely collapse by tomorrow.',
    )
    expect(dilemma.detectedFallacy).toBe('false_dilemma')
    expect(dilemma.fallacyExplanation).toBeDefined()

    const slope = DebateArenaService.analyzeArgumentTurn(
      'If we allow this, then everything will be destroyed without doubt.',
    )
    expect(slope.detectedFallacy).toBe('slippery_slope')

    const circular = DebateArenaService.analyzeArgumentTurn(
      'We must accept this conclusion because it is just true.',
    )
    expect(circular.detectedFallacy).toBe('circular_reasoning')
  })

  it('detects rebuttal markers and increases persuasion score', () => {
    const analysis = DebateArenaService.analyzeArgumentTurn(
      'Although opponents claim it is costly, research indicates long-term gains. Consequently, the proposal stands.',
    )
    expect(analysis.toulmin.rebuttal).toBeDefined()
    expect(analysis.toulmin.warrant).toBeDefined()
    expect(analysis.persuasionScore).toBeGreaterThanOrEqual(75)
  })

  it('creates debate session with userStance=oppose and generates affirmative/moderator turns', async () => {
    const session = DebateArenaService.createDebateSession('11111111-1111-4111-8111-111111111111', {
      topicId: 't-oppose',
      motion: 'Nuclear energy should be phased out.',
      category: 'environment',
      userStance: 'oppose',
      difficulty: 'mastery_c2',
      maxRounds: 3,
    })

    expect(session.personas.some((p) => p.role === 'affirmative')).toBe(true)

    const affTurn = await DebateArenaService.generateAiTurn(session, 'affirmative')
    expect(affTurn.speakerRole).toBe('affirmative')
    // Môi trường test KHÔNG có key AI → rơi về mẫu cứng VÀ phải gắn cờ isFallback.
    expect(affTurn.isFallback).toBe(true)
    expect(affTurn.content).toContain('ethical imperative')

    const modTurn = await DebateArenaService.generateAiTurn(session, 'socratic_moderator')
    expect(modTurn.speakerRole).toBe('socratic_moderator')
    expect(modTurn.isFallback).toBe(true)
    expect(modTurn.content).toContain('probing line of inquiry')
  })

  it('evaluates match rubric when there are no user turns', () => {
    const session = DebateArenaService.createDebateSession('11111111-1111-4111-8111-111111111111', {
      topicId: 't1',
      motion: 'Motion',
      category: 'philosophy',
      userStance: 'support',
      difficulty: 'intermediate_b2',
      maxRounds: 2,
    })

    const rubric = DebateArenaService.evaluateDebateMatch(session)
    expect(rubric.overallScore).toBe(73.75)
    expect(rubric.strengths).toContain('Active participation in opening arguments.')
  })

  it('evaluates match rubric with low scores triggering areasForImprovement branches', () => {
    const session = DebateArenaService.createDebateSession('11111111-1111-4111-8111-111111111111', {
      topicId: 't2',
      motion: 'Motion',
      category: 'education',
      userStance: 'support',
      difficulty: 'intermediate_b2',
      maxRounds: 2,
    })

    // Add weak user turn with low logic, fallacy, low vocab
    session.turns.push({
      id: 'turn-weak',
      speakerId: 'u',
      speakerName: 'User',
      speakerRole: 'user',
      content: 'You are stupid and because it is just true.',
      detectedFallacy: 'ad_hominem',
      toulmin: { claim: 'Weak', hasValidStructure: false },
      advancedVocabulary: [],
      logicScore: 45,
      persuasionScore: 45,
      timestamp: new Date().toISOString(),
    })

    const rubric = DebateArenaService.evaluateDebateMatch(session)
    expect(rubric.areasForImprovement.length).toBe(3)
    expect(rubric.areasForImprovement[0]).toContain('Cần bổ sung bằng chứng')
    expect(rubric.areasForImprovement[1]).toContain('Chú ý tránh khái quát hóa')
  })
})
