// Test useActiveSection — theo dõi mục đang đọc bằng IntersectionObserver (mock giả lập).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useActiveSection } from './useActiveSection.js'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let latestActive: string | undefined

function Consumer({ ids }: { ids: readonly string[] }) {
  const active = useActiveSection(ids)
  // Gán ở effect (không phải lúc render) — tránh side-effect trong render (luật react-hooks).
  useEffect(() => {
    latestActive = active
  }, [active])
  return null
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  latestActive = undefined
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => {
    root.unmount()
  })
  container.remove()
  vi.unstubAllGlobals()
})

describe('useActiveSection', () => {
  it('mảng ids rỗng → không quan sát gì, giữ nguyên undefined', async () => {
    await act(async () => {
      root.render(<Consumer ids={[]} />)
    })
    expect(latestActive).toBeUndefined()
  })

  it('môi trường không có IntersectionObserver → bỏ qua, không lỗi, mục đầu vẫn là state ban đầu', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    await act(async () => {
      root.render(<Consumer ids={['a', 'b']} />)
    })
    // useState(ids[0]) khởi tạo là 'a', effect return sớm không đổi gì.
    expect(latestActive).toBe('a')
  })

  it('phần tử id không tồn tại trong DOM bị lọc bỏ, không observe', async () => {
    const observeSpy = vi.fn()
    const disconnectSpy = vi.fn()
    class FakeObserver {
      observe = observeSpy
      disconnect = disconnectSpy
      unobserve = vi.fn()
    }
    vi.stubGlobal('IntersectionObserver', FakeObserver)

    await act(async () => {
      root.render(<Consumer ids={['khong-ton-tai']} />)
    })
    expect(observeSpy).not.toHaveBeenCalled()
  })

  it('quan sát đúng phần tử, cập nhật mục đang xem THEO THỨ TỰ TRANG, và gỡ khi unmount', async () => {
    let capturedCallback: (
      entries: { target: Element; isIntersecting: boolean }[],
    ) => void = () => {}
    let capturedOptions: IntersectionObserverInit | undefined
    const observeSpy = vi.fn()
    const disconnectSpy = vi.fn()
    class FakeObserver {
      constructor(
        cb: (entries: { target: Element; isIntersecting: boolean }[]) => void,
        opts?: IntersectionObserverInit,
      ) {
        capturedCallback = cb
        capturedOptions = opts
      }
      observe = observeSpy
      disconnect = disconnectSpy
      unobserve = vi.fn()
    }
    vi.stubGlobal('IntersectionObserver', FakeObserver)

    const elA = document.createElement('div')
    elA.id = 'sec-a'
    const elB = document.createElement('div')
    elB.id = 'sec-b'
    document.body.appendChild(elA)
    document.body.appendChild(elB)

    await act(async () => {
      root.render(<Consumer ids={['sec-a', 'sec-b']} />)
    })

    // rootMargin cắt dải hẹp gần đỉnh màn hình — kiểm luôn tham số truyền cho observer.
    expect(capturedOptions?.rootMargin).toBe('-20% 0px -65% 0px')
    expect(observeSpy).toHaveBeenCalledTimes(2)
    expect(observeSpy).toHaveBeenCalledWith(elA)
    expect(observeSpy).toHaveBeenCalledWith(elB)

    // Chỉ 'sec-b' đang lọt dải quan sát → thắng vì là mục duy nhất đang intersecting.
    await act(async () => {
      capturedCallback([{ target: elB, isIntersecting: true }])
    })
    expect(latestActive).toBe('sec-b')

    // 'sec-a' đứng trước trong mảng ids nên thắng khi cả hai cùng intersecting.
    await act(async () => {
      capturedCallback([
        { target: elA, isIntersecting: true },
        { target: elB, isIntersecting: true },
      ])
    })
    expect(latestActive).toBe('sec-a')

    // Không mục nào intersecting → `first` là undefined → giữ nguyên active cũ (không đổi).
    await act(async () => {
      capturedCallback([
        { target: elA, isIntersecting: false },
        { target: elB, isIntersecting: false },
      ])
    })
    expect(latestActive).toBe('sec-a')

    await act(async () => {
      root.unmount()
    })
    expect(disconnectSpy).toHaveBeenCalledTimes(1)

    elA.remove()
    elB.remove()
  })

  it('ids nội dung không đổi (mảng mới nhưng cùng chuỗi) không tạo observer mới', async () => {
    let constructCount = 0
    const observeSpy = vi.fn()
    class FakeObserver {
      constructor() {
        constructCount++
      }
      observe = observeSpy
      disconnect = vi.fn()
      unobserve = vi.fn()
    }
    vi.stubGlobal('IntersectionObserver', FakeObserver)

    const el = document.createElement('div')
    el.id = 'only'
    document.body.appendChild(el)

    await act(async () => {
      root.render(<Consumer ids={['only']} />)
    })
    await act(async () => {
      // Mảng mới nhưng nội dung giống hệt — `key` (chuỗi nối) không đổi nên effect không chạy lại.
      root.render(<Consumer ids={['only']} />)
    })
    expect(constructCount).toBe(1)

    el.remove()
  })
})
