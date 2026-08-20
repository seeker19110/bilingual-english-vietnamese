// packages/core-contracts/feedback.test.ts
import { describe, it, expect } from 'vitest'
import { CreateFeedbackSchema, CATEGORY_METADATA, type UserFeedbackCategory } from './feedback.js'

describe('feedback contracts & schema', () => {
  it('validates a complete feedback submission correctly', () => {
    const input = {
      category: 'feature' as const,
      rating: 5,
      title: 'Thêm dark mode tự động',
      message: 'Tôi muốn app tự đổi theme theo giờ hoàng hôn.',
      contactEmail: 'learner@example.com',
      contextInfo: {
        currentUrl: 'https://donghanhcungban.org/lo-trinh-hoc',
        route: '/lo-trinh-hoc',
        userAgent: 'Mozilla/5.0...',
        screenResolution: '1920x1080',
        appVersion: '7.2.0',
      },
    }
    const result = CreateFeedbackSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('validates minimal feedback submission', () => {
    const input = {
      category: 'bug' as const,
      message: 'Nút nghe audio bị giật trên safari',
    }
    const result = CreateFeedbackSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('rejects too short message (<3 chars)', () => {
    const input = {
      category: 'bug' as const,
      message: 'ok',
    }
    const result = CreateFeedbackSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('rejects invalid email address', () => {
    const input = {
      category: 'bug' as const,
      message: 'Lỗi phát âm',
      contactEmail: 'not-an-email',
    }
    const result = CreateFeedbackSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('contains metadata for all categories', () => {
    const categories: UserFeedbackCategory[] = ['bug', 'feature', 'content', 'ui_ux', 'other']
    for (const cat of categories) {
      expect(CATEGORY_METADATA[cat]).toBeDefined()
      expect(CATEGORY_METADATA[cat].labelVi).toBeTruthy()
      expect(CATEGORY_METADATA[cat].icon).toBeTruthy()
    }
  })
})
