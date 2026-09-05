import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { resolveQuizKey, useQuizKeyboard, type QuizKeyInput } from './useQuizKeyboard.js'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

/** Trạng thái mặc định: 4 đáp án, chưa trả lời, không gõ chữ, không giữ phím bổ trợ. */
function input(over: Partial<QuizKeyInput> = {}): QuizKeyInput {
  return { key: '1', modified: false, typing: false, answered: false, optionCount: 4, ...over }
}

describe('resolveQuizKey', () => {
  it('phím 1..n chọn đúng đáp án tương ứng (đếm từ 0)', () => {
    expect(resolveQuizKey(input({ key: '1' }))).toEqual({ kind: 'pick', index: 0 })
    expect(resolveQuizKey(input({ key: '4' }))).toEqual({ kind: 'pick', index: 3 })
  })

  it('phím ngoài khoảng đáp án không làm gì', () => {
    // Ca biên hai đầu: '0' cho index âm, '4' vượt quá khi chỉ có 3 đáp án.
    expect(resolveQuizKey(input({ key: '0' }))).toBeNull()
    expect(resolveQuizKey(input({ key: '4', optionCount: 3 }))).toBeNull()
    expect(resolveQuizKey(input({ key: 'a' }))).toBeNull()
  })

  it('chuỗi rỗng và khoảng trắng KHÔNG bị Number() hiểu thành số 0', () => {
    // Bẫy thật của JavaScript: Number('') === 0 và Number(' ') === 0, nên nếu chỉ kiểm
    // Number.isInteger thì phím Space lúc chưa trả lời sẽ chọn nhầm đáp án thứ -1 hoặc 0.
    expect(resolveQuizKey(input({ key: ' ' }))).toBeNull()
    expect(resolveQuizKey(input({ key: '' }))).toBeNull()
  })

  it('khi CHƯA trả lời thì Enter/Space không nhảy câu', () => {
    // Chặn cố ý: bấm Enter theo quán tính sẽ bỏ qua câu hỏi mà chưa kịp đọc.
    expect(resolveQuizKey(input({ key: 'Enter' }))).toBeNull()
    expect(resolveQuizKey(input({ key: ' ' }))).toBeNull()
  })

  it('khi ĐÃ trả lời thì Enter và Space sang câu tiếp, phím số ngừng tác dụng', () => {
    expect(resolveQuizKey(input({ key: 'Enter', answered: true }))).toEqual({ kind: 'next' })
    expect(resolveQuizKey(input({ key: ' ', answered: true }))).toEqual({ kind: 'next' })
    expect(resolveQuizKey(input({ key: '2', answered: true }))).toBeNull()
  })

  it('bỏ qua khi người học đang gõ vào ô nhập', () => {
    // Lỗi kinh điển của phím tắt toàn trang: gõ "1" vào ô tìm kiếm lại nhảy sang câu khác.
    expect(resolveQuizKey(input({ typing: true }))).toBeNull()
    expect(resolveQuizKey(input({ key: 'Enter', answered: true, typing: true }))).toBeNull()
  })

  it('bỏ qua khi có phím bổ trợ (Ctrl+1 là lệnh đổi tab của trình duyệt)', () => {
    expect(resolveQuizKey(input({ modified: true }))).toBeNull()
  })
})

// ── Test hook useQuizKeyboard: lắp resolveQuizKey vào window.keydown thật ──────────────
function dispatchKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true, ...opts }))
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => {
    root.unmount()
  })
  container.remove()
})

function Harness({
  optionCount,
  onPick,
  onNext,
  answered,
  enabled,
}: {
  optionCount: number
  onPick: (index: number) => void
  onNext?: () => void
  answered: boolean
  enabled?: boolean
}) {
  useQuizKeyboard({ optionCount, onPick, onNext, answered, enabled })
  return null
}

describe('useQuizKeyboard (hook)', () => {
  it('phím số gọi onPick với đúng chỉ số', async () => {
    const onPick = vi.fn()
    await act(async () => {
      root.render(<Harness optionCount={4} onPick={onPick} answered={false} />)
    })
    dispatchKey('2')
    expect(onPick).toHaveBeenCalledWith(1)
  })

  it('Enter khi đã trả lời gọi onNext', async () => {
    const onPick = vi.fn()
    const onNext = vi.fn()
    await act(async () => {
      root.render(<Harness optionCount={4} onPick={onPick} onNext={onNext} answered />)
    })
    dispatchKey('Enter')
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('không có onNext thì phím Enter không làm gì (không lỗi)', async () => {
    const onPick = vi.fn()
    await act(async () => {
      root.render(<Harness optionCount={4} onPick={onPick} answered />)
    })
    expect(() => dispatchKey('Enter')).not.toThrow()
  })

  it('preventDefault được gọi cho Space để không cuộn trang', async () => {
    const onPick = vi.fn()
    const onNext = vi.fn()
    await act(async () => {
      root.render(<Harness optionCount={4} onPick={onPick} onNext={onNext} answered />)
    })
    const event = new KeyboardEvent('keydown', { key: ' ', cancelable: true })
    const spy = vi.spyOn(event, 'preventDefault')
    await act(async () => {
      window.dispatchEvent(event)
    })
    expect(spy).toHaveBeenCalled()
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('phím không khớp hành động nào thì không gọi callback, không preventDefault', async () => {
    const onPick = vi.fn()
    await act(async () => {
      root.render(<Harness optionCount={4} onPick={onPick} answered={false} />)
    })
    const event = new KeyboardEvent('keydown', { key: 'z', cancelable: true })
    const spy = vi.spyOn(event, 'preventDefault')
    window.dispatchEvent(event)
    expect(onPick).not.toHaveBeenCalled()
    expect(spy).not.toHaveBeenCalled()
  })

  it('enabled=false thì không gắn listener nào — phím số không có tác dụng', async () => {
    const onPick = vi.fn()
    await act(async () => {
      root.render(<Harness optionCount={4} onPick={onPick} answered={false} enabled={false} />)
    })
    dispatchKey('1')
    expect(onPick).not.toHaveBeenCalled()
  })

  it.each([
    ['INPUT', () => document.createElement('input')],
    ['TEXTAREA', () => document.createElement('textarea')],
    ['SELECT', () => document.createElement('select')],
  ])('đang gõ vào thẻ %s → phím số bị bỏ qua (isTypingTarget)', async (_tag, makeEl) => {
    const onPick = vi.fn()
    const el = makeEl()
    document.body.appendChild(el)
    await act(async () => {
      root.render(<Harness optionCount={4} onPick={onPick} answered={false} />)
    })
    // Dispatch trực tiếp trên `el` để keydown nổi bọt lên window với đúng target là ô nhập.
    el.dispatchEvent(new KeyboardEvent('keydown', { key: '1', cancelable: true, bubbles: true }))
    expect(onPick).not.toHaveBeenCalled()
    el.remove()
  })

  it('đang gõ vào phần tử contentEditable → phím số bị bỏ qua', async () => {
    const onPick = vi.fn()
    const el = document.createElement('div')
    el.contentEditable = 'true'
    document.body.appendChild(el)
    await act(async () => {
      root.render(<Harness optionCount={4} onPick={onPick} answered={false} />)
    })
    el.dispatchEvent(new KeyboardEvent('keydown', { key: '1', cancelable: true, bubbles: true }))
    expect(onPick).not.toHaveBeenCalled()
    el.remove()
  })

  it('gõ trên phần tử KHÔNG phải ô nhập (div thường) → phím số vẫn có tác dụng', async () => {
    const onPick = vi.fn()
    const el = document.createElement('div')
    document.body.appendChild(el)
    await act(async () => {
      root.render(<Harness optionCount={4} onPick={onPick} answered={false} />)
    })
    el.dispatchEvent(new KeyboardEvent('keydown', { key: '1', cancelable: true, bubbles: true }))
    expect(onPick).toHaveBeenCalledWith(0)
    el.remove()
  })

  it('unmount gỡ listener — phím số không còn tác dụng sau khi gỡ', async () => {
    const onPick = vi.fn()
    await act(async () => {
      root.render(<Harness optionCount={4} onPick={onPick} answered={false} />)
    })
    dispatchKey('1')
    expect(onPick).toHaveBeenCalledTimes(1)

    await act(async () => {
      root.unmount()
    })
    dispatchKey('1')
    // Vẫn chỉ 1 lần gọi từ trước khi unmount — listener đã bị gỡ.
    expect(onPick).toHaveBeenCalledTimes(1)
  })
})
