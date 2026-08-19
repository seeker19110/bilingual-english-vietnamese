import { describe, it, expect } from 'vitest'
import {
  ShadowingPassageSchema,
  ShadowingSessionSchema,
  SHADOWING_SCHEMA_VERSION,
} from './echoShadowing.js'

describe('echoShadowing contracts', () => {
  it('validates a shadowing passage', () => {
    const passage = {
      id: 'steve_jobs_stanford',
      title: 'Trích đoạn Diễn văn Stanford — Steve Jobs',
      targetText: 'Your time is limited, so do not waste it living someone else life.',
      speakerAccent: 'us_standard',
      audioUrl: 'https://cdn.donghanh.org/audio/shadowing/jobs_stanford.mp3',
      bpmPacing: 120,
      syllableCount: 19,
      difficulty: 'intermediate',
      schemaVersion: SHADOWING_SCHEMA_VERSION,
    }

    const parsed = ShadowingPassageSchema.parse(passage)
    expect(parsed.id).toBe('steve_jobs_stanford')
    expect(parsed.bpmPacing).toBe(120)
  })

  it('validates a completed shadowing session', () => {
    const session = {
      sessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      personId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      passageId: 'steve_jobs_stanford',
      averageDriftLatencyMs: 420,
      rhythmSyncScore: 92,
      fluencyScore: 89,
      overallShadowingBand: 8.0,
      driftSamples: [
        { timeOffsetMs: 0, driftLatencyMs: 400, phonemeMatchScore: 95 },
        { timeOffsetMs: 1500, driftLatencyMs: 430, phonemeMatchScore: 90 },
      ],
      coachingFeedback:
        'Độ trễ nhại âm 420ms rất chuẩn, ngữ điệu và trọng âm câu khớp 92% với diễn giả.',
      createdAt: new Date().toISOString(),
      schemaVersion: SHADOWING_SCHEMA_VERSION,
    }

    const parsed = ShadowingSessionSchema.parse(session)
    expect(parsed.overallShadowingBand).toBe(8.0)
    expect(parsed.driftSamples).toHaveLength(2)
  })
})
