import { describe, it, expect } from 'vitest'
import {
  type ItemParameters,
  type CatSessionState,
  calculateProbability3Pl,
  calculateFisherInformation,
  selectNextOptimalItem,
  estimateThetaEap,
  mapThetaToCefr,
  processCatResponse,
} from './adaptiveTestingEngine'

describe('adaptiveTestingEngine (IRT 3PL & CAT)', () => {
  const sampleBank: ItemParameters[] = [
    { id: 'item-1', difficultyB: -2.0, discriminationA: 1.2, guessingC: 0.2, targetCefr: 'A1' },
    { id: 'item-2', difficultyB: -1.0, discriminationA: 1.4, guessingC: 0.2, targetCefr: 'A2' },
    { id: 'item-3', difficultyB: 0.0, discriminationA: 1.5, guessingC: 0.2, targetCefr: 'B1' },
    { id: 'item-4', difficultyB: 1.0, discriminationA: 1.6, guessingC: 0.2, targetCefr: 'B2' },
    { id: 'item-5', difficultyB: 2.0, discriminationA: 1.8, guessingC: 0.2, targetCefr: 'C1' },
  ]

  it('calculates 3PL probability correctly', () => {
    const item: ItemParameters = {
      id: 'test',
      difficultyB: 0.0,
      discriminationA: 1.0,
      guessingC: 0.2,
    }

    // When theta = b, logistic term is 0.5 -> P(theta) = c + (1 - c) * 0.5 = 0.2 + 0.8 * 0.5 = 0.6
    const pAtB = calculateProbability3Pl(0.0, item)
    expect(pAtB).toBeCloseTo(0.6, 2)

    // High theta -> P approaches 1.0
    const pHigh = calculateProbability3Pl(3.0, item)
    expect(pHigh).toBeGreaterThan(0.95)

    // Very low theta -> P approaches guessing c (0.2)
    const pLow = calculateProbability3Pl(-3.0, item)
    expect(pLow).toBeGreaterThanOrEqual(0.2)
    expect(pLow).toBeLessThan(0.25)
  })

  it('calculates Fisher Information peaked near difficulty B', () => {
    const item: ItemParameters = {
      id: 'test',
      difficultyB: 1.0,
      discriminationA: 1.5,
      guessingC: 0.2,
    }
    const infoAtB = calculateFisherInformation(1.0, item)
    const infoFar = calculateFisherInformation(-2.0, item)

    expect(infoAtB).toBeGreaterThan(infoFar)
    expect(infoAtB).toBeGreaterThan(0)
  })

  it('selects the item with maximal Fisher information for current theta', () => {
    // For theta = 1.0, item-4 (b = 1.0) should have highest info
    const nextItem = selectNextOptimalItem(1.0, sampleBank, [])
    expect(nextItem?.id).toBe('item-4')

    // For theta = -2.0, item-1 (b = -2.0) should have highest info
    const nextEasy = selectNextOptimalItem(-2.0, sampleBank, [])
    expect(nextEasy?.id).toBe('item-1')
  })

  it('estimates theta EAP accurately from response vector', () => {
    // Correct on easy questions, incorrect on hard questions -> theta around 0.0
    const responses = [
      { item: sampleBank[0]!, isCorrect: true },
      { item: sampleBank[1]!, isCorrect: true },
      { item: sampleBank[2]!, isCorrect: false },
      { item: sampleBank[3]!, isCorrect: false },
      { item: sampleBank[4]!, isCorrect: false },
    ]

    const { theta, se } = estimateThetaEap(responses)
    expect(theta).toBeGreaterThan(-1.5)
    expect(theta).toBeLessThan(0.5)
    expect(se).toBeLessThan(1.0)
  })

  it('maps theta values accurately to CEFR levels', () => {
    expect(mapThetaToCefr(-2.2)).toBe('A1')
    expect(mapThetaToCefr(-1.0)).toBe('A2')
    expect(mapThetaToCefr(0.0)).toBe('B1')
    expect(mapThetaToCefr(1.2)).toBe('B2')
    expect(mapThetaToCefr(1.8)).toBe('C1')
    expect(mapThetaToCefr(2.5)).toBe('C2')
  })

  it('processes CAT session responses step-by-step and updates state', () => {
    let state: CatSessionState = {
      thetaEstimate: 0.0,
      standardError: 1.0,
      answeredItemIds: [],
      responses: [],
      isComplete: false,
    }

    state = processCatResponse(state, sampleBank[2]!, true, sampleBank, {
      minItems: 2,
      maxItems: 3,
      targetSeThreshold: 0.35,
    })

    expect(state.answeredItemIds.length).toBe(1)
    expect(state.isComplete).toBe(false)
    expect(state.thetaEstimate).toBeGreaterThan(0.0) // Moving up after correct answer
  })
})
