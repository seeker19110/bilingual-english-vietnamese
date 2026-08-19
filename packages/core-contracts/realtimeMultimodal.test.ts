import { describe, it, expect } from 'vitest'
import {
  REALTIME_MULTIMODAL_VERSION,
  RealtimeSessionConfigSchema,
  MultimodalAudioChunkSchema,
  RealtimeSessionEventSchema,
  AcousticPhoneticsReportSchema,
} from './realtimeMultimodal.js'

describe('realtimeMultimodal contracts V4', () => {
  it('validates RealtimeSessionConfigSchema correctly', () => {
    const validConfig = {
      sessionId: '11111111-1111-4111-8111-111111111111',
      personId: '22222222-2222-4222-8222-222222222222',
      provider: 'gemini_2_live',
      voiceMode: 'conversational_tutor',
      sampleRate: 24000,
      enableVad: true,
      bargeInSensitivity: 0.04,
      targetLanguage: 'en-US',
      schemaVersion: REALTIME_MULTIMODAL_VERSION,
    }

    const parsed = RealtimeSessionConfigSchema.parse(validConfig)
    expect(parsed.provider).toBe('gemini_2_live')
    expect(parsed.schemaVersion).toBe('v4.0.0')
  })

  it('validates MultimodalAudioChunkSchema correctly', () => {
    const validChunk = {
      sessionId: '11111111-1111-4111-8111-111111111111',
      sequence: 1,
      pcmBase64: 'UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      sampleRate: 24000,
      isFinal: false,
      sender: 'user',
      timestamp: '2026-08-19T20:00:00.000Z',
      schemaVersion: REALTIME_MULTIMODAL_VERSION,
    }

    const parsed = MultimodalAudioChunkSchema.parse(validChunk)
    expect(parsed.sequence).toBe(1)
    expect(parsed.sender).toBe('user')
  })

  it('validates RealtimeSessionEventSchema correctly', () => {
    const validEvent = {
      eventId: '33333333-3333-4333-8333-333333333333',
      sessionId: '11111111-1111-4111-8111-111111111111',
      type: 'barge_in_triggered',
      payload: { rmsEnergy: 0.08, cutAudioMs: 320 },
      timestamp: '2026-08-19T20:00:01.000Z',
      schemaVersion: REALTIME_MULTIMODAL_VERSION,
    }

    const parsed = RealtimeSessionEventSchema.parse(validEvent)
    expect(parsed.type).toBe('barge_in_triggered')
    expect(parsed.payload.rmsEnergy).toBe(0.08)
  })

  it('validates AcousticPhoneticsReportSchema correctly with GOP phonemes', () => {
    const validReport = {
      id: '44444444-4444-4444-8444-444444444444',
      sessionId: '11111111-1111-4111-8111-111111111111',
      personId: '22222222-2222-4222-8222-222222222222',
      targetSentence: 'Think outside the box',
      spokenTranscript: 'Tink outside the bok',
      overallGopScore: 84.5,
      fluencyScore: 90.0,
      prosodyScore: 82.0,
      speechRateWpm: 135,
      pauseCount: 1,
      phonemes: [
        {
          phoneme: 'th',
          targetIpa: '/θ/',
          gopScore: 45.0,
          status: 'distorted',
          durationMs: 120,
          startTimeMs: 0,
          endTimeMs: 120,
          f0Hz: 185,
          f1Hz: 450,
          f2Hz: 1800,
          errorDiagnostic: 'Nhầm lẫn /θ/ thành /t/ (Tink thay vì Think).',
        },
      ],
      l1InterferenceDetected: ['TH_VOICELESS', 'FINAL_CLUSTER_KS'],
      correctiveDrillRecommendation: 'Đặt đầu lưỡi giữa 2 hàm răng khi phát âm "th".',
      evaluatedAt: '2026-08-19T20:00:02.000Z',
      schemaVersion: REALTIME_MULTIMODAL_VERSION,
    }

    const parsed = AcousticPhoneticsReportSchema.parse(validReport)
    expect(parsed.overallGopScore).toBe(84.5)
    expect(parsed.phonemes).toHaveLength(1)
    expect(parsed.phonemes[0]?.status).toBe('distorted')
  })
})
