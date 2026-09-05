// Test hook useProgrammingLesson: nạp lười một bài học, có trạng thái loading/error/ready.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useProgrammingLesson, type LessonLoadState } from './useProgrammingLesson'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const { loadLessonMock } = vi.hoisted(() => ({ loadLessonMock: vi.fn() }))
vi.mock('@dhcb/subject-programming/lessonsLoader', () => ({
  loadLesson: loadLessonMock,
}))

let latest: LessonLoadState | undefined
let container: HTMLDivElement
let root: Root

function Consumer({ lessonId }: { lessonId: string | undefined }) {
  const state = useProgrammingLesson(lessonId)
  // Không gán biến module-scope lúc render (luật react-hooks/globals) — ghi trong effect,
  // giống khuôn mẫu useMountedRef.test.tsx.
  useEffect(() => {
    latest = state
  })
  return null
}

beforeEach(() => {
  latest = undefined
  loadLessonMock.mockReset()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  container.remove()
})

describe('useProgrammingLesson', () => {
  it('không có lessonId → ready ngay với lesson undefined (không tìm thấy)', async () => {
    await act(async () => {
      root.render(<Consumer lessonId={undefined} />)
    })
    expect(latest).toEqual({ status: 'ready', lesson: undefined })
    expect(loadLessonMock).not.toHaveBeenCalled()
  })

  it('đang tải → status loading trước khi promise resolve', async () => {
    let resolvePromise: (v: unknown) => void = () => {}
    loadLessonMock.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      }),
    )
    await act(async () => {
      root.render(<Consumer lessonId="bai-1" />)
    })
    expect(latest?.status).toBe('loading')
    await act(async () => {
      resolvePromise({ id: 'bai-1', title: 'Bài 1' })
    })
    expect(latest).toEqual({ status: 'ready', lesson: { id: 'bai-1', title: 'Bài 1' } })
  })

  it('tải xong → ready với đúng nội dung bài học', async () => {
    loadLessonMock.mockResolvedValue({ id: 'bai-2', title: 'Bài 2' })
    await act(async () => {
      root.render(<Consumer lessonId="bai-2" />)
    })
    expect(latest).toEqual({ status: 'ready', lesson: { id: 'bai-2', title: 'Bài 2' } })
  })

  it('lỗi khi tải → status error kèm hàm retry gọi lại loadLesson', async () => {
    loadLessonMock.mockRejectedValueOnce(new Error('unit chưa soạn'))
    await act(async () => {
      root.render(<Consumer lessonId="bai-3" />)
    })
    expect(latest?.status).toBe('error')

    loadLessonMock.mockResolvedValueOnce({ id: 'bai-3', title: 'Bài 3' })
    await act(async () => {
      if (latest?.status === 'error') latest.retry()
    })
    expect(latest).toEqual({ status: 'ready', lesson: { id: 'bai-3', title: 'Bài 3' } })
    expect(loadLessonMock).toHaveBeenCalledTimes(2)
  })

  it('đổi lessonId khi đang tải bài cũ → chuyển sang loading của bài mới, kết quả bài cũ bị bỏ qua', async () => {
    let resolveFirst: (v: unknown) => void = () => {}
    loadLessonMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve
      }),
    )
    await act(async () => {
      root.render(<Consumer lessonId="bai-A" />)
    })
    expect(latest?.status).toBe('loading')

    loadLessonMock.mockResolvedValueOnce({ id: 'bai-B', title: 'Bài B' })
    await act(async () => {
      root.render(<Consumer lessonId="bai-B" />)
    })
    expect(latest).toEqual({ status: 'ready', lesson: { id: 'bai-B', title: 'Bài B' } })

    // Kết quả trễ của bài A resolve sau đó không được ghi đè lên state của bài B.
    await act(async () => {
      resolveFirst({ id: 'bai-A', title: 'Bài A' })
    })
    expect(latest).toEqual({ status: 'ready', lesson: { id: 'bai-B', title: 'Bài B' } })
  })

  it('unmount trước khi promise resolve → không setState sau khi huỷ (không cảnh báo)', async () => {
    let resolvePromise: (v: unknown) => void = () => {}
    loadLessonMock.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      }),
    )
    await act(async () => {
      root.render(<Consumer lessonId="bai-4" />)
    })
    await act(async () => {
      root.unmount()
    })
    // Resolve sau khi unmount — không được throw / không có gì để assert thêm ngoài "không crash".
    await act(async () => {
      resolvePromise({ id: 'bai-4', title: 'Bài 4' })
    })
  })
})
