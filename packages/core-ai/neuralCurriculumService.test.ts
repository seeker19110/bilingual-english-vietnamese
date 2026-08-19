// packages/core-ai/neuralCurriculumService.test.ts
import { describe, it, expect } from 'vitest'
import { NeuralCurriculumService } from './neuralCurriculumService.js'

describe('NeuralCurriculumService', () => {
  it('generates micro-curriculum module with collocations and drills', () => {
    const moduleItem = NeuralCurriculumService.generateMicroCurriculumModule({
      moduleId: '11111111-1111-4111-8111-111111111111',
      targetDomain: 'work',
      topicOrKeyword: 'Project Management',
      cefrLevel: 'B2',
    })

    expect(moduleItem.title).toContain('Project Management')
    expect(moduleItem.collocations.length).toBeGreaterThan(0)
    expect(moduleItem.drills.length).toBeGreaterThan(0)
    expect(moduleItem.estimatedMinutes).toBe(2)
  })

  it('computes spaced interval expansion on correct answer', () => {
    const result = NeuralCurriculumService.computeNextSpacedReview(2, true)
    expect(result.nextIntervalDays).toBeGreaterThan(2)
    expect(result.masteryDelta).toBe(15)
  })

  it('resets spaced interval to 1 on incorrect answer', () => {
    const result = NeuralCurriculumService.computeNextSpacedReview(10, false)
    expect(result.nextIntervalDays).toBe(1)
    expect(result.masteryDelta).toBe(-10)
  })

  it('creates default state for person', () => {
    const state = NeuralCurriculumService.createDefaultState('11111111-1111-4111-8111-111111111111')
    expect(state.personId).toBe('11111111-1111-4111-8111-111111111111')
    expect(state.modules.length).toBe(1)
    expect(state.schemaVersion).toBe('v4.3.0')
  })
})
