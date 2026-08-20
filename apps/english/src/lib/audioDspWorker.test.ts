import { describe, it, expect } from 'vitest'
import { calculateRms, detectPitchF0, estimateFormants, processAudioFrame } from './audioDspWorker'

describe('audioDspWorker', () => {
  it('calculates RMS correctly for silence and non-zero signals', () => {
    const silence = new Float32Array(1024).fill(0)
    expect(calculateRms(silence)).toBe(0)

    const constant = new Float32Array(1024).fill(0.5)
    expect(calculateRms(constant)).toBeCloseTo(0.5, 4)
  })

  it('detects pitch F0 accurately on synthetic sine wave', () => {
    const sampleRate = 44100
    const targetFreq = 200 // 200 Hz tone
    const numSamples = 2048
    const buffer = new Float32Array(numSamples)

    for (let i = 0; i < numSamples; i++) {
      buffer[i] = 0.5 * Math.sin((2 * Math.PI * targetFreq * i) / sampleRate)
    }

    const { pitchHz, isVoiced } = detectPitchF0(buffer, sampleRate)
    expect(isVoiced).toBe(true)
    // Autocorrelation should estimate frequency close to 200 Hz (+/- 5 Hz)
    expect(Math.abs(pitchHz - targetFreq)).toBeLessThanOrEqual(5)
  })

  it('returns unvoiced for silence', () => {
    const silence = new Float32Array(2048).fill(0)
    const { pitchHz, isVoiced } = detectPitchF0(silence, 44100)
    expect(pitchHz).toBe(0)
    expect(isVoiced).toBe(false)
  })

  it('estimates formants within physiological bounds', () => {
    const buffer = new Float32Array(1024).fill(0.2)
    const { f1, f2 } = estimateFormants(buffer, 150)
    expect(f1).toBeGreaterThanOrEqual(250)
    expect(f1).toBeLessThanOrEqual(1000)
    expect(f2).toBeGreaterThanOrEqual(800)
    expect(f2).toBeLessThanOrEqual(2800)
  })

  it('processes full audio frame and returns structured DSP result', () => {
    const buffer = new Float32Array(2048).fill(0.3)
    const result = processAudioFrame(buffer, 44100)
    expect(result.rms).toBeCloseTo(0.3, 2)
    expect(result.timestamp).toBeGreaterThan(0)
    expect(typeof result.isVoiced).toBe('boolean')
    expect(typeof result.pitchF0Hz).toBe('number')
  })
})
