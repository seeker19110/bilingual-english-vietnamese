// packages/core-personal/metacognitiveReflectionService.test.ts
import { describe, it, expect } from 'vitest'
import { MetacognitiveReflectionService } from './metacognitiveReflectionService.js'

describe('MetacognitiveReflectionService', () => {
  it('generates a daily socratic prompt for learning domain', () => {
    const prompt = MetacognitiveReflectionService.generateDailySocraticPrompt('learning')
    expect(prompt.domain).toBe('learning')
    expect(prompt.promptText.length).toBeGreaterThan(10)
    expect(prompt.deepDivingQuestion.length).toBeGreaterThan(10)
  })

  it('analyzes user reflection and detects analysis paralysis bias', () => {
    const analysis = MetacognitiveReflectionService.analyzeReflection('user-1', {
      domain: 'learning',
      reflectionPrompt: 'Điều gì cản trở bạn hôm nay?',
      userReflection:
        'Tôi sợ sai và cứ nghĩ mãi về cấu trúc ngữ pháp này, cảm thấy chưa đủ hoàn hảo để nói ra.',
    })

    expect(analysis.personId).toBe('user-1')
    expect(analysis.metacognitiveIndex).toBeGreaterThan(40)
    const hasParalysis = analysis.identifiedBiases.some((b) => b.biasType === 'analysis_paralysis')
    expect(hasParalysis).toBe(true)
  })

  it('detects overconfidence bias', () => {
    const analysis = MetacognitiveReflectionService.analyzeReflection('user-1', {
      domain: 'work',
      reflectionPrompt: 'Đánh giá tiến độ',
      userReflection: 'Mọi thứ chắc chắn quá đơn giản, ai cũng biết làm cả.',
    })

    const hasOverconfidence = analysis.identifiedBiases.some((b) => b.biasType === 'overconfidence')
    expect(hasOverconfidence).toBe(true)
  })

  it('summarizes multiple reflections', () => {
    const r1 = MetacognitiveReflectionService.analyzeReflection('user-1', {
      domain: 'learning',
      reflectionPrompt: 'P1',
      userReflection: 'Tôi nhận ra rằng sự kiên trì quan trọng hơn tốc độ.',
    })
    const summary = MetacognitiveReflectionService.summarizeReflections([r1])
    expect(summary.totalReflectionsCount).toBe(1)
    expect(summary.recentAhaMoments.length).toBeGreaterThan(0)
  })
})
