// Test cardStyles — sinh chuỗi class của thẻ (Card.tsx dùng chung toàn app).
import { describe, it, expect } from 'vitest'
import { cardClass, type CardVariant, type CardPadding } from './cardStyles.js'

describe('cardClass', () => {
  it('không truyền gì → dùng mặc định plain + padding md', () => {
    const cls = cardClass()
    expect(cls).toContain('rounded-2xl')
    expect(cls).toContain('border')
    expect(cls).toContain('bg-surface-card')
    expect(cls).toContain('p-4 lg:p-5')
  })

  it.each(['plain', 'interactive', 'highlight'] as CardVariant[])(
    'variant=%s sinh đúng class biến thể tương ứng',
    (variant) => {
      const cls = cardClass({ variant })
      if (variant === 'interactive') {
        expect(cls).toContain('hover:-translate-y-0.5')
        expect(cls).toContain('motion-reduce:transform-none')
      }
      if (variant === 'highlight') {
        expect(cls).toContain('shadow-lg')
      }
      expect(cls).toContain('bg-surface-card')
    },
  )

  it.each(['none', 'sm', 'md', 'lg'] as CardPadding[])(
    'padding=%s sinh đúng lớp đệm',
    (padding) => {
      const cls = cardClass({ padding })
      const expected: Record<CardPadding, string> = {
        none: '',
        sm: 'p-3',
        md: 'p-4 lg:p-5',
        lg: 'p-5 lg:p-7',
      }
      if (expected[padding]) expect(cls).toContain(expected[padding])
    },
  )

  it('padding=none không để lại chuỗi rỗng thừa nhờ filter(Boolean)', () => {
    const cls = cardClass({ padding: 'none' })
    // Không có hai dấu cách liền nhau do phần tử rỗng bị lọc.
    expect(cls).not.toMatch(/ {2,}/)
  })

  it('className tuỳ chỉnh được nối vào cuối', () => {
    const cls = cardClass({ className: 'mt-4' })
    expect(cls.endsWith('mt-4')).toBe(true)
  })

  it('className rỗng (mặc định) không bị filter(Boolean) thêm khoảng trắng thừa', () => {
    const cls = cardClass({})
    expect(cls).not.toMatch(/ {2,}/)
  })
})
