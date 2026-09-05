// Test lib programmingPathProgress: cache localStorage + gọi API (/api/programming/path-progress).
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchPathProgress,
  savePathStages,
  isPathStageDone,
  isPathStageSkipped,
  type PathStageProgress,
} from './programmingPathProgress'

function mockFetch(body: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => body }) as unknown as Response),
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('fetchPathProgress', () => {
  it('thành công → trả stages VÀ ghi cache theo uid+pathId', async () => {
    const stages: PathStageProgress[] = [
      { pathId: 'principal-ai', stageId: 's1', status: 'completed', updatedAt: 1 },
    ]
    mockFetch({ stages })
    expect(await fetchPathProgress('u1', 'principal-ai')).toEqual(stages)
    expect(fetch).toHaveBeenCalledWith(
      '/api/programming/path-progress?pathId=principal-ai',
      expect.anything(),
    )
    // Sau đó lỗi mạng vẫn đọc được cache vừa ghi.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await fetchPathProgress('u1', 'principal-ai')).toEqual(stages)
  })

  it('server thiếu field stages → mảng rỗng', async () => {
    mockFetch({})
    expect(await fetchPathProgress('u1', 'p1')).toEqual([])
  })

  it('HTTP lỗi → đọc cache (rỗng nếu chưa từng ghi)', async () => {
    mockFetch(null, false)
    expect(await fetchPathProgress('u1', 'p1')).toEqual([])
  })

  it('fetch ném lỗi mạng → đọc cache (rỗng nếu chưa từng ghi)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    expect(await fetchPathProgress('u1', 'p1')).toEqual([])
  })

  it('cache hỏng (JSON lỗi hoặc không phải mảng) → trả rỗng, không crash', async () => {
    localStorage.setItem('dhcb_prog_path_p1_u1', 'not-json{{')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await fetchPathProgress('u1', 'p1')).toEqual([])

    localStorage.setItem('dhcb_prog_path_p1_u1', JSON.stringify({ khong: 'phai mang' }))
    expect(await fetchPathProgress('u1', 'p1')).toEqual([])
  })

  it('localStorage đầy lúc ghi cache → không throw', async () => {
    mockFetch({ stages: [] })
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    await expect(fetchPathProgress('u1', 'p1')).resolves.toEqual([])
    setItem.mockRestore()
  })
})

describe('savePathStages', () => {
  it('POST thành công → true', async () => {
    mockFetch({})
    const ok = await savePathStages('p1', [{ stageId: 's1', status: 'skipped' }])
    expect(ok).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      '/api/programming/path-progress',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('HTTP lỗi → false', async () => {
    mockFetch(null, false)
    expect(await savePathStages('p1', [])).toBe(false)
  })

  it('fetch ném lỗi mạng → false, không throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    expect(await savePathStages('p1', [])).toBe(false)
  })
})

describe('hàm thuần trên danh sách stage', () => {
  const stages: PathStageProgress[] = [
    { pathId: 'p1', stageId: 's1', status: 'completed', updatedAt: 1 },
    { pathId: 'p1', stageId: 's2', status: 'skipped', updatedAt: 2 },
    { pathId: 'p1', stageId: 's3', status: 'in_progress', updatedAt: 3 },
  ]

  it('isPathStageDone', () => {
    expect(isPathStageDone(stages, 's1')).toBe(true)
    expect(isPathStageDone(stages, 's2')).toBe(false)
    expect(isPathStageDone(stages, 'khong-ton-tai')).toBe(false)
  })

  it('isPathStageSkipped', () => {
    expect(isPathStageSkipped(stages, 's2')).toBe(true)
    expect(isPathStageSkipped(stages, 's1')).toBe(false)
    expect(isPathStageSkipped(stages, 'khong-ton-tai')).toBe(false)
  })
})
