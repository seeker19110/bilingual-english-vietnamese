import { describe, it, expect } from 'vitest'
import { resolveIntentAndDomain } from '@dhcb/core-personal/companionRuntime'

describe('Eval V2 Routing', () => {
  it('should correctly resolve set_learning_goal', () => {
    const result = resolveIntentAndDomain('Tôi muốn đặt mục tiêu học IELTS')
    expect(result.intent).toBe('set_learning_goal')
    expect(result.domain).toBe('learning')
  })

  it('should correctly resolve dictionary_lookup', () => {
    const result = resolveIntentAndDomain('Từ này nghĩa là gì?')
    expect(result.intent).toBe('dictionary_lookup')
    expect(result.domain).toBe('learning')
  })

  it('should correctly resolve update_profile_fact', () => {
    const result = resolveIntentAndDomain('tôi thích màu đỏ')
    expect(result.intent).toBe('update_profile_fact')
    expect(result.domain).toBe('profile')
  })

  it('should correctly resolve create_memory', () => {
    const result = resolveIntentAndDomain('ghi nhớ: tôi hay quên từ vựng')
    expect(result.intent).toBe('create_memory')
    expect(result.domain).toBe('personal')
  })

  it('should correctly resolve general_conversation', () => {
    const result = resolveIntentAndDomain('chào bạn')
    expect(result.intent).toBe('general_conversation')
    expect(result.domain).toBe('learning')
  })
})
