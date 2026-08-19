import { describe, it, expect } from 'vitest'
import {
  MentalModelMisconceptionSchema,
  CognitiveBreakthroughRecordSchema,
  SOCRATIC_SCHEMA_VERSION,
} from './socraticDiagnostics.js'

describe('socraticDiagnostics contracts', () => {
  it('validates a mental model misconception item', () => {
    const misconception = {
      id: 'present_perfect_experience',
      title: 'Nhầm lẫn Hiện tại Hoàn thành vs Quá khứ Đơn khi nói về trải nghiệm',
      domain: 'aspect_vs_tense_confusion',
      surfaceErrorPattern: 'I have seen that movie yesterday.',
      rootCauseAnalysis:
        'Người học xem "yesterday" và hành động xem phim là sự kiện đã xảy ra, nhưng lại dùng "have seen" vì liên tưởng tới "đã xem" trong tiếng Việt.',
      inquiryPath: [
        {
          stepIndex: 0,
          guidingQuestion:
            'Trong câu này, thời điểm "yesterday" là một khoảng thời gian đã kết thúc hoàn toàn hay vẫn còn tiếp diễn đến hiện tại?',
          expectedMentalConcept: 'Thời gian xác định trong quá khứ đã đóng lại hoàn toàn',
          hintIfStuck: 'Hãy nghĩ về thời điểm ngày hôm qua so với hôm nay.',
        },
      ],
      schemaVersion: SOCRATIC_SCHEMA_VERSION,
    }

    const parsed = MentalModelMisconceptionSchema.parse(misconception)
    expect(parsed.domain).toBe('aspect_vs_tense_confusion')
    expect(parsed.inquiryPath).toHaveLength(1)
  })

  it('validates a cognitive breakthrough record', () => {
    const record = {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      personId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      misconceptionId: 'present_perfect_experience',
      status: 'breakthrough_achieved',
      currentStepIndex: 1,
      turns: [
        {
          stepIndex: 0,
          question: 'Thời điểm yesterday đã kết thúc chưa?',
          learnerAnswer: 'Ngày hôm qua đã kết thúc hoàn toàn trong quá khứ rồi ạ.',
          conceptUnderstood: true,
          companionFeedback:
            'Chính xác! Vậy khi mốc thời gian đã khóa lại, ta dùng thì Quá khứ Đơn "saw".',
          timestamp: new Date().toISOString(),
        },
      ],
      breakthroughSummary:
        'Người học đã nắm vững quy tắc mốc thời gian đóng (Specific Finished Time).',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: SOCRATIC_SCHEMA_VERSION,
    }

    const parsed = CognitiveBreakthroughRecordSchema.parse(record)
    expect(parsed.status).toBe('breakthrough_achieved')
    expect(parsed.turns).toHaveLength(1)
  })
})
