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

  it('generates prompts across all 5 domains with contextAnchor', () => {
    const domains = ['career', 'work', 'startup', 'life'] as const
    for (const d of domains) {
      const p = MetacognitiveReflectionService.generateDailySocraticPrompt(d, 'anchor-1')
      expect(p.domain).toBe(d)
      expect(p.contextAnchor).toBe('anchor-1')
    }
  })

  it('detects imposter syndrome and sunk cost biases', () => {
    const imposter = MetacognitiveReflectionService.analyzeReflection('u1', {
      domain: 'career',
      reflectionPrompt: 'Prompt',
      userReflection: 'Tôi chỉ may mắn thôi và cảm thấy không xứng đáng với vị trí này.',
    })
    expect(imposter.identifiedBiases.some((b) => b.biasType === 'imposter_syndrome')).toBe(true)

    const sunk = MetacognitiveReflectionService.analyzeReflection('u1', {
      domain: 'startup',
      reflectionPrompt: 'Prompt',
      userReflection: 'Rất tiếc công vì đã bỏ ra nhiều tháng phát triển, không thể bỏ được.',
    })
    expect(sunk.identifiedBiases.some((b) => b.biasType === 'sunk_cost')).toBe(true)
  })

  it('handles neutral reflection with bias=none and growth mindset', () => {
    const neutral = MetacognitiveReflectionService.analyzeReflection('u1', {
      title: 'Custom Title',
      domain: 'life',
      reflectionPrompt: 'Prompt',
      userReflection: 'Hôm nay tôi muốn cải thiện và học hỏi cách quản lý cảm xúc tốt hơn.',
    })
    expect(neutral.title).toBe('Custom Title')
    expect(neutral.identifiedBiases[0]?.biasType).toBe('none')
    expect(neutral.growthMindsetScore).toBe(90)
  })

  it('summarizes empty reflections and calculates accelerating trend', () => {
    const emptySummary = MetacognitiveReflectionService.summarizeReflections([])
    expect(emptySummary.totalReflectionsCount).toBe(0)
    expect(emptySummary.mindsetTrend).toBe('needs_reflection')

    const rHigh = MetacognitiveReflectionService.analyzeReflection('u1', {
      domain: 'learning',
      reflectionPrompt: 'P',
      userReflection:
        'Tôi nhận ra và hóa ra việc học hỏi liên tục giúp thay đổi toàn diện tư duy của mình rất nhiều. Bằng cách quan sát bản thân mỗi ngày, tôi thấy rõ ràng hơn các điểm mù kiến thức và có thể chủ động cải thiện phương pháp học tập hiệu quả nhất.',
    })
    const highSummary = MetacognitiveReflectionService.summarizeReflections([rHigh])
    expect(highSummary.mindsetTrend).toBe('accelerating')
  })
})
