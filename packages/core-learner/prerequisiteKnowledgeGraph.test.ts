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

  // --- Nhánh chưa phủ: targetNode không tồn tại (lines 82-89) ---
  it('targetNodeId không có trong knowledgeNodes → trả report mặc định Unknown Node', () => {
    const emptyNodes = new Map<string, KnowledgeNode>()
    const emptyStates = new Map<string, BktMasteryState>()
    const report = tracePrerequisiteGaps('nonexistent-node', emptyNodes, emptyStates)
    expect(report.targetNodeTitle).toBe('Unknown Node')
    expect(report.isMastered).toBe(false)
    expect(report.pMastery).toBe(0)
    expect(report.unmasteredPrerequisites).toHaveLength(0)
  })

  // --- Nhánh: tiền đề node ID tồn tại trong queue nhưng không có trong knowledgeNodes (line 106) ---
  it('tiền đề node không có trong knowledgeNodes → bỏ qua, không crash', () => {
    const nodes = new Map<string, KnowledgeNode>([
      [
        'target',
        {
          id: 'target',
          code: 'TARGET',
          title: 'Target Node',
          domain: 'grammar',
          cefrLevel: 'B1',
          prerequisiteNodeIds: ['ghost-node'], // không có trong map
        },
      ],
    ])
    const states = new Map<string, BktMasteryState>()
    const report = tracePrerequisiteGaps('target', nodes, states)
    expect(report.unmasteredPrerequisites).toHaveLength(0)
    expect(report.recommendedBridgingLesson).toBeUndefined()
  })

  // --- Nhánh: tiền đề đã vững → không push vào unmasteredPrerequisites + không có bridging ---
  it('tiền đề đã vững (pMastery >= threshold) → recommendedBridgingLesson là undefined', () => {
    const nodes = new Map<string, KnowledgeNode>([
      [
        'pre',
        {
          id: 'pre',
          code: 'PRE',
          title: 'Pre Node',
          domain: 'grammar',
          cefrLevel: 'A2',
          prerequisiteNodeIds: [],
        },
      ],
      [
        'target',
        {
          id: 'target',
          code: 'TARGET',
          title: 'Target Node',
          domain: 'grammar',
          cefrLevel: 'B1',
          prerequisiteNodeIds: ['pre'],
        },
      ],
    ])
    const states = new Map<string, BktMasteryState>([
      [
        'pre',
        {
          nodeId: 'pre',
          pMastery: 0.9,
          pSlip: 0.1,
          pGuess: 0.2,
          pTransit: 0.15,
          totalAttempts: 10,
          lastUpdated: Date.now(),
        },
      ],
      [
        'target',
        {
          nodeId: 'target',
          pMastery: 0.85,
          pSlip: 0.1,
          pGuess: 0.2,
          pTransit: 0.15,
          totalAttempts: 5,
          lastUpdated: Date.now(),
        },
      ],
    ])
    const report = tracePrerequisiteGaps('target', nodes, states, 0.7)
    expect(report.isMastered).toBe(true)
    expect(report.unmasteredPrerequisites).toHaveLength(0)
    expect(report.recommendedBridgingLesson).toBeUndefined()
  })

  // --- Nhánh: BKT denominator=0 fallback (line 53/58) ---
  it('BKT correct với pGuess=0 và pMastery=0 → denominator=0, fallback pOld', () => {
    const state: BktMasteryState = {
      nodeId: 'x',
      pMastery: 0.0,
      pSlip: 0.1,
      pGuess: 0.0,
      pTransit: 0.15,
      totalAttempts: 0,
      lastUpdated: Date.now(),
    }
    const result = updateBktMastery(state, true)
    expect(result.pMastery).toBeGreaterThanOrEqual(0.01)
  })

  it('BKT incorrect với pMastery=1, pSlip=0, pGuess=1 → denominator=0 branch fallback', () => {
    const state: BktMasteryState = {
      nodeId: 'x',
      pMastery: 1.0,
      pSlip: 0.0,
      pGuess: 1.0,
      pTransit: 0.0,
      totalAttempts: 0,
      lastUpdated: Date.now(),
    }
    const result = updateBktMastery(state, false)
    // denominator incorrect = 1*0 + (1-1)*(1-1) = 0 → fallback = pOld = 1.0 → clamped 0.99
    expect(result.pMastery).toBeLessThanOrEqual(0.99)
  })
})
