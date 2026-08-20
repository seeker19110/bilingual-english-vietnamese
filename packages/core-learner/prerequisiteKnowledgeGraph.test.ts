import { describe, it, expect } from 'vitest'
import {
  type KnowledgeNode,
  type BktMasteryState,
  updateBktMastery,
  tracePrerequisiteGaps,
} from './prerequisiteKnowledgeGraph'

describe('prerequisiteKnowledgeGraph (Bayesian Knowledge Tracing & DAG Backtracking)', () => {
  it('updates BKT mastery state accurately on correct and incorrect responses', () => {
    const initialState: BktMasteryState = {
      nodeId: 'node-1',
      pMastery: 0.3,
      pSlip: 0.1,
      pGuess: 0.2,
      pTransit: 0.15,
      totalAttempts: 0,
      lastUpdated: Date.now(),
    }

    // After 1 correct answer, mastery probability should increase
    const afterCorrect = updateBktMastery(initialState, true)
    expect(afterCorrect.pMastery).toBeGreaterThan(0.3)
    expect(afterCorrect.totalAttempts).toBe(1)

    // After 1 incorrect answer from high state, mastery probability should drop
    const highState: BktMasteryState = { ...initialState, pMastery: 0.8 }
    const afterIncorrect = updateBktMastery(highState, false)
    expect(afterIncorrect.pMastery).toBeLessThan(0.8)
  })

  it('traces prerequisite gaps and recommends bridging lessons', () => {
    const nodes = new Map<string, KnowledgeNode>([
      [
        'node-basic-inversion',
        {
          id: 'node-basic-inversion',
          code: 'GRAMMAR_INVERSION_BASIC',
          title: 'Đảo ngữ với trạng từ tần suất (Never, Rarely)',
          domain: 'grammar',
          cefrLevel: 'B1',
          prerequisiteNodeIds: [],
        },
      ],
      [
        'node-advanced-conditionals',
        {
          id: 'node-advanced-conditionals',
          code: 'GRAMMAR_INVERSION_CONDITIONALS',
          title: 'Đảo ngữ câu điều kiện loại 1, 2, 3 (Had I known, Were you to)',
          domain: 'grammar',
          cefrLevel: 'C1',
          prerequisiteNodeIds: ['node-basic-inversion'],
        },
      ],
    ])

    const states = new Map<string, BktMasteryState>([
      [
        'node-basic-inversion',
        {
          nodeId: 'node-basic-inversion',
          pMastery: 0.35, // Low mastery in prerequisite!
          pSlip: 0.1,
          pGuess: 0.2,
          pTransit: 0.15,
          totalAttempts: 3,
          lastUpdated: Date.now(),
        },
      ],
      [
        'node-advanced-conditionals',
        {
          nodeId: 'node-advanced-conditionals',
          pMastery: 0.2,
          pSlip: 0.1,
          pGuess: 0.2,
          pTransit: 0.15,
          totalAttempts: 1,
          lastUpdated: Date.now(),
        },
      ],
    ])

    const report = tracePrerequisiteGaps('node-advanced-conditionals', nodes, states, 0.7)

    expect(report.isMastered).toBe(false)
    expect(report.unmasteredPrerequisites.length).toBe(1)
    expect(report.unmasteredPrerequisites[0]?.nodeId).toBe('node-basic-inversion')
    expect(report.recommendedBridgingLesson).toBeDefined()
    expect(report.recommendedBridgingLesson?.lessonTitle).toContain('Củng cố nền tảng')
    expect(report.recommendedBridgingLesson?.focusNodeId).toBe('node-basic-inversion')
  })
})
