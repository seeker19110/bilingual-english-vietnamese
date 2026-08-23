// apps/dhcb/src/lib/neuralCurriculumApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchNeuralCurriculum, generateMicroModule, completeDrill } from './neuralCurriculumApi.js'

describe('neuralCurriculumApi client library', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('fetches neural curriculum state', async () => {
    const mockState = { masteryScore: 80, modules: [] }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, state: mockState }),
    } as unknown as Response)

    const state = await fetchNeuralCurriculum()
    expect(state.masteryScore).toBe(80)
  })

  it('generates micro module via POST', async () => {
    const mockRes = {
      success: true,
      module: { title: 'Test Module' },
      state: { modules: [] },
    }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockRes,
    } as unknown as Response)

    const result = await generateMicroModule({ topicOrKeyword: 'Presentation' })
    expect(result.module.title).toBe('Test Module')
  })

  it('completes drill and returns review interval', async () => {
    const mockReview = { masteryDelta: 15, nextIntervalDays: 4 }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, review: mockReview }),
    } as unknown as Response)

    const review = await completeDrill({ isCorrect: true, previousInterval: 2 })
    expect(review.masteryDelta).toBe(15)
  })
})
