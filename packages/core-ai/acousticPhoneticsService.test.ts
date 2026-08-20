import { describe, it, expect } from 'vitest'
import { extractTargetPhonemes, analyzeAcousticPhonetics } from './acousticPhoneticsService.js'

describe('acousticPhoneticsService', () => {
  it('extracts target IPA phonemes accurately', () => {
    const phonemes = extractTargetPhonemes('Think outside the box')
    expect(phonemes.length).toBeGreaterThan(0)
    const keys = phonemes.map((p) => p.key)
    expect(keys).toContain('th')
    expect(keys).toContain('cluster_ks')
  })

  it('generates a complete AcousticPhoneticsReport with GOP and alignment', () => {
    const report = analyzeAcousticPhonetics({
      personId: '11111111-1111-4111-8111-111111111111',
      targetSentence: 'Think outside the box',
      spokenTranscript: 'Tink outside the box',
      pcmAudioLengthMs: 2000,
    })

    expect(report.overallGopScore).toBeGreaterThan(0)
    expect(report.overallGopScore).toBeLessThanOrEqual(100)
    expect(report.phonemes.length).toBeGreaterThan(0)
    expect(report.phonemes[0]?.durationMs).toBeGreaterThan(0)
    expect(report.schemaVersion).toBe('v4.0.0')
  })

  it('handles matched high-accuracy pronunciation smoothly', () => {
    const report = analyzeAcousticPhonetics({
      personId: '11111111-1111-4111-8111-111111111111',
      targetSentence: 'Excellent pronunciation',
      spokenTranscript: 'Excellent pronunciation',
      pcmAudioLengthMs: 1800,
    })

    expect(report.overallGopScore).toBeGreaterThanOrEqual(80)
    expect(report.l1InterferenceDetected).toEqual([])
    expect(report.correctiveDrillRecommendation).toContain('chuẩn xác')
  })

  it('handles fallback phoneme extraction and default audio length parameters', () => {
    // Sentence with no special phoneme keys
    const fallbackPhonemes = extractTargetPhonemes('you see me')
    expect(fallbackPhonemes[0]?.key).toBe('general')

    // Report with omitted transcript and omitted audio length (>3000ms long sentence)
    const longSentence =
      'We are learning English every single day with continuous improvement and dedication'
    const report = analyzeAcousticPhonetics({
      personId: '11111111-1111-4111-8111-111111111111',
      targetSentence: longSentence,
    })
    expect(report.pauseCount).toBeGreaterThan(0)
    expect(report.spokenTranscript).toBe(longSentence)
  })
})
