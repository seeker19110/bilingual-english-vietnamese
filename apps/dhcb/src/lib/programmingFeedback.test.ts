import { beforeEach, describe, expect, it, vi } from 'vitest'
import { failedCaseLabels, requestCodeFeedback } from './programmingFeedback'
import type { TestCaseResult } from '@dhcb/subject-programming/grading'

vi.mock('@core/authHeader', () => ({ getAuthHeader: () => ({ authorization: 'Bearer t' }) }))

const fetchMock = vi.fn()
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)
})

const res = (status: number, body: unknown) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => body })

describe('failedCaseLabels', () => {
  const cases: TestCaseResult[] = [
    { label: '100 kWh → 189.000đ', hidden: false, passed: true },
    { label: '0 kWh → 0đ', hidden: false, passed: false },
    { label: '350 kWh → 909.000đ', hidden: true, passed: false },
  ]

  it('chỉ lấy ca chưa đạt', () => {
    expect(failedCaseLabels(cases)).toHaveLength(2)
  })

  it('ca ẩn chỉ gửi số thứ tự — KHÔNG gửi nhãn (nhãn ca ẩn thường lộ đáp án)', () => {
    const labels = failedCaseLabels(cases)
    expect(labels).toEqual(['0 kWh → 0đ', 'Ca ẩn 3'])
    expect(labels.join(' ')).not.toContain('909.000')
  })

  it('chưa chấm lần nào → mảng rỗng', () => {
    expect(failedCaseLabels(null)).toEqual([])
  })
})

describe('requestCodeFeedback', () => {
  it('200 → trả text + bậc gợi ý server chốt', async () => {
    fetchMock.mockReturnValue(res(200, { text: 'Bạn thử đọc lại đề nhé?', hintLevel: 1 }))
    await expect(
      requestCodeFeedback({ kind: 'socratic_hint', lessonId: 'p1-u4-l1', code: 'x' }),
    ).resolves.toEqual({ ok: true, text: 'Bạn thử đọc lại đề nhé?', hintLevel: 1 })
  })

  it('hết lượt (429) → hiện ĐÚNG lời nhắn của server, không nuốt thành lỗi chung', async () => {
    fetchMock.mockReturnValue(res(429, { error: 'Hết lượt rồi.' }))
    await expect(
      requestCodeFeedback({ kind: 'socratic_hint', lessonId: 'p1-u4-l1', code: 'x' }),
    ).resolves.toEqual({ ok: false, message: 'Hết lượt rồi.' })
  })

  it('200 nhưng body thiếu text → coi là thất bại (không hiện ô rỗng)', async () => {
    fetchMock.mockReturnValue(res(200, {}))
    const r = await requestCodeFeedback({ kind: 'review', lessonId: 'p1-u4-l1', code: 'x' })
    expect(r.ok).toBe(false)
  })

  it('mất mạng → thông báo tiếng Việt, không ném lỗi ra UI', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    const r = await requestCodeFeedback({ kind: 'review', lessonId: 'p1-u4-l1', code: 'x' })
    expect(r).toEqual({ ok: false, message: expect.stringContaining('Không gọi được AI') })
  })
})
