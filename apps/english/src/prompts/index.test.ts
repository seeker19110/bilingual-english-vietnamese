// Test giọng điệu theo nhóm tuổi (GĐ 3, PROGRESS.md 2026-07-22) — CHỈ kiểm tra prompt có/không
// có block giọng điệu tương ứng, không kiểm nội dung câu chữ chi tiết (dễ vỡ khi diễn đạt lại).
import { describe, it, expect } from 'vitest'
import { chatSystemPrompt, speakingSystemPrompt, writingSystemPrompt } from './index'

describe('giọng điệu theo nhóm tuổi', () => {
  it('không có ageGroup (user cũ) → prompt giống hệt trước đây, không thêm block', () => {
    const withUndefined = chatSystemPrompt('Small talk', 'beginner', 'A')
    const withAdult = chatSystemPrompt('Small talk', 'beginner', 'A', undefined, 'nguoi_lon')
    const withTeen = chatSystemPrompt('Small talk', 'beginner', 'A', undefined, 'thanh_nien')
    expect(withUndefined).toBe(withAdult)
    expect(withUndefined).toBe(withTeen)
  })

  it('nhi_dong → chat prompt chiều A thêm block trẻ em, chiều B thêm block tiếng Anh', () => {
    const a = chatSystemPrompt('Small talk', 'beginner', 'A', undefined, 'nhi_dong')
    const b = chatSystemPrompt('Small talk', 'beginner', 'B', undefined, 'nhi_dong')
    expect(a).toContain('TRẺ EM')
    expect(a).not.toContain('THIẾU NIÊN')
    expect(b).toContain('CHILD')
  })

  it('thieu_nien → chat prompt thêm block thiếu niên, khác nội dung nhi_dong', () => {
    const teen = chatSystemPrompt('Small talk', 'beginner', 'A', undefined, 'thieu_nien')
    expect(teen).toContain('THIẾU NIÊN')
    expect(teen).not.toContain('TRẺ EM')
  })

  it('speakingSystemPrompt cũng nhận đúng ageGroup, mặc định không đổi', () => {
    const withUndefined = speakingSystemPrompt('Restaurant', 'intermediate', 'A')
    const withAdult = speakingSystemPrompt(
      'Restaurant',
      'intermediate',
      'A',
      undefined,
      'nguoi_lon',
    )
    const kid = speakingSystemPrompt('Restaurant', 'intermediate', 'A', undefined, 'nhi_dong')
    expect(withUndefined).toBe(withAdult)
    expect(kid).toContain('TRẺ EM')
  })

  it('writingSystemPrompt cũng nhận đúng ageGroup, mặc định không đổi', () => {
    const withUndefined = writingSystemPrompt('A')
    const withAdult = writingSystemPrompt('A', 'nguoi_lon')
    const kid = writingSystemPrompt('A', 'nhi_dong')
    expect(withUndefined).toBe(withAdult)
    expect(kid).toContain('TRẺ EM')
  })
})
