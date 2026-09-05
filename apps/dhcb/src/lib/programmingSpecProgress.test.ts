// Test lib programmingSpecProgress: cache localStorage + gọi API (/api/programming/specialization).
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  EMPTY_SPEC_PROGRESS,
  fetchSpecProgress,
  enrollSpec,
  unenrollSpec,
  setStageStatus,
  isStageCompleted,
  countCompletedStages,
  isEnrolled,
  type SpecProgressSnapshot,
} from './programmingSpecProgress'

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

describe('fetchSpecProgress', () => {
  it('thành công → trả dữ liệu server VÀ ghi cache', async () => {
    const body: SpecProgressSnapshot = {
      primarySpecId: 'web',
      crossSpecIds: ['algo'],
      stages: [{ specId: 'web', stageId: 's1', status: 'completed', completedAt: 1 }],
    }
    mockFetch(body)
    const snap = await fetchSpecProgress('u1')
    expect(snap).toEqual(body)
    // Lần sau lỗi mạng vẫn đọc được từ cache vừa ghi.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await fetchSpecProgress('u1')).toEqual(body)
  })

  it('server thiếu field → điền mặc định (null/[]/[])', async () => {
    mockFetch({})
    const snap = await fetchSpecProgress('u1')
    expect(snap).toEqual(EMPTY_SPEC_PROGRESS)
  })

  it('HTTP lỗi → đọc cache (rỗng nếu chưa từng ghi)', async () => {
    mockFetch(null, false)
    expect(await fetchSpecProgress('u1')).toEqual(EMPTY_SPEC_PROGRESS)
  })

  it('fetch ném lỗi mạng → đọc cache (rỗng nếu chưa từng ghi)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    expect(await fetchSpecProgress('u1')).toEqual(EMPTY_SPEC_PROGRESS)
  })

  it('cache hỏng (JSON lỗi) → trả rỗng, không crash', async () => {
    localStorage.setItem('dhcb_prog_spec_u1', 'not-json{{')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await fetchSpecProgress('u1')).toEqual(EMPTY_SPEC_PROGRESS)
  })

  it('cache là JSON hợp lệ nhưng thiếu field → điền mặc định (null/[]/[])', async () => {
    localStorage.setItem('dhcb_prog_spec_u1', JSON.stringify({}))
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await fetchSpecProgress('u1')).toEqual(EMPTY_SPEC_PROGRESS)
  })

  it('cache có sẵn đủ field → đọc đúng nguyên vẹn', async () => {
    const snap: SpecProgressSnapshot = {
      primarySpecId: 'web',
      crossSpecIds: ['algo'],
      stages: [{ specId: 'web', stageId: 's1', status: 'completed', completedAt: 1 }],
    }
    localStorage.setItem('dhcb_prog_spec_u1', JSON.stringify(snap))
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await fetchSpecProgress('u1')).toEqual(snap)
  })

  it('localStorage đầy lúc ghi cache → không throw (chỉ bỏ qua)', async () => {
    mockFetch({ primarySpecId: 'web', crossSpecIds: [], stages: [] })
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    await expect(fetchSpecProgress('u1')).resolves.toEqual({
      primarySpecId: 'web',
      crossSpecIds: [],
      stages: [],
    })
    setItem.mockRestore()
  })
})

describe('post-based actions (enrollSpec/unenrollSpec/setStageStatus)', () => {
  it('enrollSpec → POST action enroll rồi đọc lại tiến độ', async () => {
    mockFetch({ primarySpecId: 'web', crossSpecIds: [], stages: [] })
    const snap = await enrollSpec('u1', 'web')
    expect(snap.primarySpecId).toBe('web')
    expect(fetch).toHaveBeenCalledWith(
      '/api/programming/specialization',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('unenrollSpec → POST action unenroll rồi đọc lại tiến độ', async () => {
    mockFetch(EMPTY_SPEC_PROGRESS)
    const snap = await unenrollSpec('u1', 'web')
    expect(snap).toEqual(EMPTY_SPEC_PROGRESS)
  })

  it('setStageStatus → POST action stage rồi đọc lại tiến độ', async () => {
    mockFetch(EMPTY_SPEC_PROGRESS)
    await setStageStatus('u1', 's1', 'completed')
    expect(fetch).toHaveBeenCalledTimes(2) // POST + GET lại
  })

  it('POST lỗi mạng → không throw (bắt lỗi, trả false ngầm rồi vẫn fetch lại)', async () => {
    // Lần gọi đầu (POST) ném lỗi, lần sau (GET fetchSpecProgress) trả rỗng.
    let call = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        call += 1
        if (call === 1) throw new Error('network down')
        return { ok: true, json: async () => EMPTY_SPEC_PROGRESS } as unknown as Response
      }),
    )
    await expect(enrollSpec('u1', 'web')).resolves.toEqual(EMPTY_SPEC_PROGRESS)
  })
})

describe('hàm thuần trên snapshot', () => {
  const snap: SpecProgressSnapshot = {
    primarySpecId: 'web',
    crossSpecIds: ['algo'],
    stages: [
      { specId: 'web', stageId: 's1', status: 'completed', completedAt: 1 },
      { specId: 'web', stageId: 's2', status: 'in_progress', completedAt: null },
      { specId: 'algo', stageId: 'a1', status: 'completed', completedAt: 2 },
    ],
  }

  it('isStageCompleted', () => {
    expect(isStageCompleted(snap, 's1')).toBe(true)
    expect(isStageCompleted(snap, 's2')).toBe(false)
    expect(isStageCompleted(snap, 's-not-found')).toBe(false)
  })

  it('countCompletedStages', () => {
    expect(countCompletedStages(snap, 'web')).toBe(1)
    expect(countCompletedStages(snap, 'algo')).toBe(1)
    expect(countCompletedStages(snap, 'khong-ton-tai')).toBe(0)
  })

  it('isEnrolled — chính, nền, và không theo hướng nào', () => {
    expect(isEnrolled(snap, 'web')).toBe(true)
    expect(isEnrolled(snap, 'algo')).toBe(true)
    expect(isEnrolled(snap, 'khac')).toBe(false)
  })
})
