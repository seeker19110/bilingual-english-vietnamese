// packages/core-ai/visemeMorphingService.test.ts
import { describe, it, expect } from 'vitest'
import { VisemeMorphingService } from './visemeMorphingService.js'

describe('VisemeMorphingService', () => {
  it('maps IPA phonetic symbols to correct 15-Oculus visemes', () => {
    expect(VisemeMorphingService.mapIpaToViseme('æ')).toBe('aa')
    expect(VisemeMorphingService.mapIpaToViseme('iː')).toBe('I')
    expect(VisemeMorphingService.mapIpaToViseme('p')).toBe('PP')
    expect(VisemeMorphingService.mapIpaToViseme('tʃ')).toBe('CH')
    expect(VisemeMorphingService.mapIpaToViseme('θ')).toBe('TH')
    expect(VisemeMorphingService.mapIpaToViseme('unknown_symbol')).toBe('sil')
  })

  it('calculates dynamic morph target dimensions proportionally with amplitude', () => {
    const quietTarget = VisemeMorphingService.calculateMorphTarget('aa', 0.2, 100)
    const loudTarget = VisemeMorphingService.calculateMorphTarget('aa', 0.9, 200)

    expect(loudTarget.mouthHeight).toBeGreaterThan(quietTarget.mouthHeight)
    expect(loudTarget.ledIntensity).toBeGreaterThan(quietTarget.ledIntensity)
    expect(loudTarget.weight).toBe(0.9)
    expect(quietTarget.weight).toBe(0.2)
  })

  it('smooths transitions using exponential moving average', () => {
    const start = 0.1
    const target = 0.9
    const step1 = VisemeMorphingService.smoothStep(start, target, 0.5)
    expect(step1).toBe(0.5)
    const step2 = VisemeMorphingService.smoothStep(step1, target, 0.5)
    expect(step2).toBe(0.7)
  })

  it('generates rich natural idle breathing and gaze tracking states', () => {
    const state = VisemeMorphingService.computeNaturalIdleState(
      10000,
      { x: 0.4, y: -0.2 },
      'celebrating',
    )
    expect(state.gazeX).toBe(0.4)
    expect(state.gazeY).toBe(-0.2)
    expect(state.emotion.emotion).toBe('celebrating')
    expect(state.emotion.eyeGlowColor).toBe('#a855f7')
    expect(state.breathPhase).toBeGreaterThanOrEqual(0)
    expect(state.breathPhase).toBeLessThanOrEqual(1)
  })
})
