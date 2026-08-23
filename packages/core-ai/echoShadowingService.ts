// packages/core-ai/echoShadowingService.ts — V3 Real-Time Echo Shadowing Service.
import { randomUUID } from 'node:crypto'
import {
  type ShadowingPassage,
  type ShadowingSession,
  type AcousticDriftSample,
  SHADOWING_SCHEMA_VERSION,
} from '@dhcb/core-contracts/echoShadowing'

export const PREDEFINED_PASSAGES: ShadowingPassage[] = [
  {
    id: 'jobs_stanford_commencement',
    title: 'Steve Jobs — Diễn văn Khai giảng Đại học Stanford (2005)',
    targetText:
      'Your time is limited, so do not waste it living someone else life. Do not be trapped by dogma, which is living with the results of other people thinking.',
    speakerAccent: 'us_standard',
    audioUrl: 'https://cdn.donghanh.org/audio/shadowing/jobs_stanford.mp3',
    bpmPacing: 120,
    syllableCount: 38,
    difficulty: 'intermediate',
    schemaVersion: SHADOWING_SCHEMA_VERSION,
  },
  {
    id: 'churchill_we_shall_fight',
    title: 'Winston Churchill — We Shall Fight on the Beaches (1940)',
    targetText:
      'We shall fight on the seas and oceans, we shall fight with growing confidence and growing strength in the air, we shall defend our island, whatever the cost may be.',
    speakerAccent: 'uk_rp',
    audioUrl: 'https://cdn.donghanh.org/audio/shadowing/churchill_fight.mp3',
    bpmPacing: 105,
    syllableCount: 42,
    difficulty: 'advanced',
    schemaVersion: SHADOWING_SCHEMA_VERSION,
  },
  {
    id: 'tech_startup_pitch_fast',
    title: 'Silicon Valley Pitch — Realtime AI Architecture (Tốc độ Cao)',
    targetText:
      'Our distributed real-time AI companion dynamically synchronizes context packages across five life domains with sub-second latency and zero-knowledge privacy.',
    speakerAccent: 'us_standard',
    audioUrl: 'https://cdn.donghanh.org/audio/shadowing/startup_pitch.mp3',
    bpmPacing: 150,
    syllableCount: 46,
    difficulty: 'native_fast',
    schemaVersion: SHADOWING_SCHEMA_VERSION,
  },
]

export function listShadowingPassages(): ShadowingPassage[] {
  return [...PREDEFINED_PASSAGES]
}

export function getShadowingPassage(id: string): ShadowingPassage | undefined {
  return PREDEFINED_PASSAGES.find((p) => p.id === id)
}

export function evaluateShadowingSession(
  personId: string,
  passageId: string,
  measuredLatencyMs: number = 420,
  phonemeAccuracy: number = 88,
): ShadowingSession {
  const passage = getShadowingPassage(passageId)
  if (!passage) {
    throw new Error(`Đoạn văn Shadowing ${passageId} không tồn tại`)
  }

  // Lý tưởng cho Shadowing là nhại lại sau 350ms - 500ms
  const isLatencyOptimal = measuredLatencyMs >= 300 && measuredLatencyMs <= 550
  const rhythmSyncScore = isLatencyOptimal
    ? Math.min(100, Math.max(70, 100 - Math.abs(measuredLatencyMs - 400) / 10))
    : Math.max(50, 80 - Math.abs(measuredLatencyMs - 400) / 15)

  const fluencyScore = Math.min(100, Math.max(50, phonemeAccuracy * 0.6 + rhythmSyncScore * 0.4))
  const calculatedBand = Number(Math.min(9.0, Math.max(5.0, (fluencyScore / 100) * 9)).toFixed(1))

  // Sinh mẫu drift timeline
  const driftSamples: AcousticDriftSample[] = [
    { timeOffsetMs: 0, driftLatencyMs: measuredLatencyMs, phonemeMatchScore: phonemeAccuracy },
    {
      timeOffsetMs: 1500,
      driftLatencyMs: measuredLatencyMs + 20,
      phonemeMatchScore: Math.min(100, phonemeAccuracy + 4),
    },
    {
      timeOffsetMs: 3000,
      driftLatencyMs: measuredLatencyMs - 15,
      phonemeMatchScore: Math.max(60, phonemeAccuracy - 2),
    },
    {
      timeOffsetMs: 4500,
      driftLatencyMs: measuredLatencyMs + 10,
      phonemeMatchScore: phonemeAccuracy,
    },
  ]

  let coachingFeedback = ''
  if (calculatedBand >= 8.0) {
    coachingFeedback =
      'Phản xạ nhại âm siêu tốc tuyệt vời! Độ trễ bắt nhịp 400ms và ngữ điệu ăn khớp hoàn hảo với diễn giả bản xứ.'
  } else if (calculatedBand >= 6.5) {
    coachingFeedback =
      'Bắt nhịp tương đối tốt. Cần chú ý không ngắt nghỉ giữa các cụm từ liền mạch (Connected Speech) để nâng cao điểm Fluency.'
  } else {
    coachingFeedback =
      'Độ trễ hơi cao so với nhịp nói của diễn giả. Hãy luyện nghe từng câu ngắn trước khi nhại đồng thời theo thời gian thực.'
  }

  return {
    sessionId: randomUUID(),
    personId,
    passageId,
    averageDriftLatencyMs: measuredLatencyMs,
    rhythmSyncScore: Math.round(rhythmSyncScore),
    fluencyScore: Math.round(fluencyScore),
    overallShadowingBand: calculatedBand,
    driftSamples,
    coachingFeedback,
    createdAt: new Date().toISOString(),
    schemaVersion: SHADOWING_SCHEMA_VERSION,
  }
}
