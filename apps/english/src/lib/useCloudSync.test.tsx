import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useCloudSync } from './useCloudSync'

// Báo React biết môi trường test này hỗ trợ act() (mặc định happy-dom không khai báo cờ
// này) — chỉ để tắt warning console, không đổi hành vi test.
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('./cloud', () => ({ pullUserData: vi.fn(async () => undefined) }))
vi.mock('./progressSync', () => ({ pullProgress: vi.fn(async () => undefined) }))

import { pullUserData } from './cloud'
import { pullProgress } from './progressSync'

// Hook chỉ dùng qua component — mount thật bằng createRoot (giống useTheme.test.tsx
// nhưng renderToStaticMarkup không chạy effect, nên phải dùng createRoot + act).
function Consumer({ userId }: { userId: string | undefined }) {
  useCloudSync(userId)
  return null
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  vi.useRealTimers()
})

describe('useCloudSync — đồng bộ lại khi online / định kỳ mỗi giờ', () => {
  it('mở app → đồng bộ ngay 1 lần', async () => {
    await act(async () => {
      root.render(<Consumer userId="u1" />)
    })
    expect(pullUserData).toHaveBeenCalledTimes(1)
    expect(pullProgress).toHaveBeenCalledTimes(1)
  })

  it('mạng có lại (sự kiện online) → đồng bộ lại thêm 1 lần', async () => {
    await act(async () => {
      root.render(<Consumer userId="u1" />)
    })
    await act(async () => {
      window.dispatchEvent(new Event('online'))
    })
    expect(pullUserData).toHaveBeenCalledTimes(2)
    expect(pullProgress).toHaveBeenCalledTimes(2)
  })

  it('sau 1 giờ vẫn mở app → tự đồng bộ lại, không cần đóng/mở tab', async () => {
    await act(async () => {
      root.render(<Consumer userId="u1" />)
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
    })
    expect(pullUserData).toHaveBeenCalledTimes(2)
    expect(pullProgress).toHaveBeenCalledTimes(2)
  })

  it("unmount → gỡ listener 'online' và dừng hẹn giờ, không còn đồng bộ nữa", async () => {
    await act(async () => {
      root.render(<Consumer userId="u1" />)
    })
    await act(async () => {
      root.unmount()
    })
    vi.clearAllMocks()

    await act(async () => {
      window.dispatchEvent(new Event('online'))
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
    })
    expect(pullUserData).not.toHaveBeenCalled()
    expect(pullProgress).not.toHaveBeenCalled()
  })

  it('không có userId → không đăng ký listener/hẹn giờ, không gọi đồng bộ', async () => {
    await act(async () => {
      root.render(<Consumer userId={undefined} />)
    })
    await act(async () => {
      window.dispatchEvent(new Event('online'))
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
    })
    expect(pullUserData).not.toHaveBeenCalled()
    expect(pullProgress).not.toHaveBeenCalled()
  })
})
