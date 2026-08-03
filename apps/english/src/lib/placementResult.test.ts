import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPlacementResult, savePlacementResult } from './placementResult'

// Mock pushProgress — chỉ cần biết có gọi hay không, không cần chạy thật (gọi Supabase).
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))
import { pushProgress } from './progressSync'
const mockedPushProgress = vi.mocked(pushProgress)

describe('placementResult — lưu/đọc kết quả bài test xếp lớp', () => {
  beforeEach(() => {
    localStorage.clear()
    mockedPushProgress.mockReset()
  })

  it('chưa có dữ liệu → trả về null', () => {
    expect(getPlacementResult('u1')).toBeNull()
  })

  it('lưu rồi đọc lại → đúng dữ liệu, có kèm lastAt và đã đồng bộ Supabase', () => {
    const saved = savePlacementResult('u1', { cefr: 'B1', appLevel: 'intermediate' })
    expect(saved.cefr).toBe('B1')
    expect(saved.appLevel).toBe('intermediate')
    expect(typeof saved.lastAt).toBe('string')
    expect(mockedPushProgress).toHaveBeenCalledWith('u1')

    const loaded = getPlacementResult('u1')
    expect(loaded).toEqual(saved)
  })

  it('dữ liệu JSON hỏng trong localStorage → trả về null, không sập app', () => {
    localStorage.setItem('et_placement_u1', '{not valid json')
    expect(getPlacementResult('u1')).toBeNull()
  })

  it('dữ liệu thiếu/sai cefr → trả về null', () => {
    localStorage.setItem(
      'et_placement_u1',
      JSON.stringify({ cefr: 'Z9', appLevel: 'beginner', lastAt: '2026-01-01T00:00:00.000Z' }),
    )
    expect(getPlacementResult('u1')).toBeNull()
  })

  it('dữ liệu sai appLevel → trả về null', () => {
    localStorage.setItem(
      'et_placement_u1',
      JSON.stringify({ cefr: 'A1', appLevel: 'unknown', lastAt: '2026-01-01T00:00:00.000Z' }),
    )
    expect(getPlacementResult('u1')).toBeNull()
  })

  it('mỗi user lưu riêng, không lẫn nhau', () => {
    savePlacementResult('u1', { cefr: 'A1', appLevel: 'beginner' })
    savePlacementResult('u2', { cefr: 'C1', appLevel: 'advanced' })
    expect(getPlacementResult('u1')?.cefr).toBe('A1')
    expect(getPlacementResult('u2')?.cefr).toBe('C1')
  })

  it('uid rỗng khi lưu → không gọi pushProgress', () => {
    savePlacementResult('', { cefr: 'A1', appLevel: 'beginner' })
    expect(mockedPushProgress).not.toHaveBeenCalled()
  })
})
