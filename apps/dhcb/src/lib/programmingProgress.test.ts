import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

vi.mock('@core/authHeader', () => ({ getAuthHeader: () => ({}) }))

import {
  fetchProgress,
  saveLessonProgress,
  isLessonCompleted,
  type ProgrammingLessonProgress,
} from './programmingProgress'

const UID = 'u1'
const CACHE_KEY = `dhcb_prog_progress_${UID}`

function mockFetch(impl: (url: string, init?: RequestInit) => unknown) {
  const fn = vi.fn((url: string, init?: RequestInit) => Promise.resolve(impl(url, init)))
  vi.stubGlobal('fetch', fn as unknown as typeof fetch)
  return fn
}

const okJson = (body: unknown) => ({ ok: true, json: async () => body })

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe('programmingProgress — đọc tiến độ', () => {
  it('server trả dữ liệu → dùng dữ liệu server và ghi cache', async () => {
    const lessons: ProgrammingLessonProgress[] = [
      { lessonId: 'p1-u4-l1', status: 'completed', completedAt: 123 },
    ]
    mockFetch(() => okJson({ lessons }))
    expect(await fetchProgress(UID)).toEqual(lessons)
    expect(JSON.parse(localStorage.getItem(CACHE_KEY)!)).toEqual(lessons)
  })

  it('server lỗi HTTP → rơi về cache đã lưu', async () => {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify([{ lessonId: 'p1-u1-l1', status: 'in_progress', completedAt: null }]),
    )
    mockFetch(() => ({ ok: false, json: async () => ({}) }))
    const got = await fetchProgress(UID)
    expect(got.map((l) => l.lessonId)).toEqual(['p1-u1-l1'])
  })

  it('mất mạng (fetch ném lỗi) → cache; cache hỏng → mảng rỗng, không ném', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch,
    )
    expect(await fetchProgress(UID)).toEqual([])
    localStorage.setItem(CACHE_KEY, '{{{ hỏng')
    expect(await fetchProgress(UID)).toEqual([])
  })
})

describe('programmingProgress — ghi tiến độ', () => {
  it('bài mới → thêm vào cache + gọi POST đúng thân yêu cầu', async () => {
    const fn = mockFetch(() => okJson({ ok: true }))
    await saveLessonProgress(UID, 'p1-u4-l1', 'in_progress')
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY)!) as ProgrammingLessonProgress[]
    expect(cache).toEqual([{ lessonId: 'p1-u4-l1', status: 'in_progress', completedAt: null }])
    const body = JSON.parse(String((fn.mock.calls[0]?.[1] as RequestInit).body))
    expect(body).toEqual({ lessonId: 'p1-u4-l1', status: 'in_progress' })
  })

  it('hoàn thành → có completedAt; học lại KHÔNG kéo lùi về in_progress (bất biến)', async () => {
    mockFetch(() => okJson({ ok: true }))
    await saveLessonProgress(UID, 'p1-u4-l1', 'completed')
    const first = JSON.parse(localStorage.getItem(CACHE_KEY)!)[0] as ProgrammingLessonProgress
    expect(first.status).toBe('completed')
    expect(first.completedAt).toBeTypeOf('number')

    await saveLessonProgress(UID, 'p1-u4-l1', 'in_progress')
    const after = JSON.parse(localStorage.getItem(CACHE_KEY)!)[0] as ProgrammingLessonProgress
    expect(after.status).toBe('completed')
    expect(after.completedAt).toBe(first.completedAt)
  })

  it('đang học rồi mới hoàn thành → cập nhật đúng mốc thời gian', async () => {
    mockFetch(() => okJson({ ok: true }))
    await saveLessonProgress(UID, 'p1-u1-l1', 'in_progress')
    await saveLessonProgress(UID, 'p1-u1-l1', 'completed')
    const row = JSON.parse(localStorage.getItem(CACHE_KEY)!)[0] as ProgrammingLessonProgress
    expect(row.status).toBe('completed')
    expect(row.completedAt).toBeTypeOf('number')
  })

  it('ngoại tuyến → vẫn ghi cache, KHÔNG ném lỗi ra ngoài', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch,
    )
    await expect(saveLessonProgress(UID, 'p1-u4-l1', 'completed')).resolves.toBeUndefined()
    expect(localStorage.getItem(CACHE_KEY)).toContain('p1-u4-l1')
  })
})

describe('isLessonCompleted', () => {
  const lessons: ProgrammingLessonProgress[] = [
    { lessonId: 'a', status: 'completed', completedAt: 1 },
    { lessonId: 'b', status: 'in_progress', completedAt: null },
  ]
  it('chỉ true khi bài đó ở trạng thái completed', () => {
    expect(isLessonCompleted(lessons, 'a')).toBe(true)
    expect(isLessonCompleted(lessons, 'b')).toBe(false)
    expect(isLessonCompleted(lessons, 'không-có')).toBe(false)
    expect(isLessonCompleted([], 'a')).toBe(false)
  })
})
