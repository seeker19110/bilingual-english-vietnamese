// packages/core-contracts/metacognitiveReflection.test.ts
import { describe, it, expect } from 'vitest'
import {
  MetacognitiveReflectionSchema,
  SocraticDailyPromptSchema,
  MetacognitiveSummarySchema,
} from './metacognitiveReflection.js'

describe('MetacognitiveReflectionSchema', () => {
  it('validates a valid metacognitive reflection payload', () => {
    const validData = {
      id: 'refl-123',
      personId: 'user-456',
      title: 'Nhận thức về thói quen trì hoãn khi gặp bài toán khó',
      domain: 'learning',
      reflectionPrompt: 'Điều gì đã ngăn cản bạn hành động dứt khoát hôm nay?',
      userReflection:
        'Tôi nhận thấy mình rơi vào bẫy phân tích quá đà và sợ sai lầm khi bắt đầu giải đề mới.',
      ahaMoments: ['Hành động nhỏ tạo đà tâm lý tốt hơn là chờ đợi sự hoàn hảo.'],
      identifiedBiases: [
        {
          biasType: 'analysis_paralysis',
          biasName: 'Tê liệt phân tích (Analysis Paralysis)',
          explanation: 'Dành quá nhiều thời gian cân nhắc mà không bắt tay vào thử nghiệm.',
          antidotePrompt: 'Quy tắc 5 phút: Làm thử ngay một phần nhỏ nhất.',
          severity: 'moderate',
        },
      ],
      metacognitiveIndex: 82,
      growthMindsetScore: 88,
      socraticFollowUps: ['Bước nhỏ nhất bạn có thể làm trong 3 phút tới là gì?'],
      actionCommitment: 'Làm ngay 1 bài tập trắc nghiệm cơ bản trước khi nghỉ.',
      createdAt: '2026-08-20T06:00:00.000Z',
    }

    const parsed = MetacognitiveReflectionSchema.parse(validData)
    expect(parsed.id).toBe('refl-123')
    expect(parsed.identifiedBiases).toHaveLength(1)
    expect(parsed.metacognitiveIndex).toBe(82)
  })

  it('validates socratic daily prompt', () => {
    const prompt = {
      id: 'prompt-1',
      domain: 'career',
      theme: 'Quyết định dưới áp lực',
      promptText: 'Khi đối mặt với sự bất định, niềm tin ngầm định nào đang chi phối bạn?',
      deepDivingQuestion: 'Liệu đây là sự thật khách quan hay giả định tự tạo?',
    }
    const parsed = SocraticDailyPromptSchema.parse(prompt)
    expect(parsed.theme).toBe('Quyết định dưới áp lực')
  })

  it('validates summary schema', () => {
    const summary = {
      overallAwarenessIndex: 85,
      totalReflectionsCount: 12,
      topDetectedBiases: ['confirmation_bias', 'dunning_kruger'],
      mindsetTrend: 'accelerating',
      recentAhaMoments: ['Nhận ra giá trị của phản biện từ người khác.'],
    }
    const parsed = MetacognitiveSummarySchema.parse(summary)
    expect(parsed.mindsetTrend).toBe('accelerating')
  })
})
