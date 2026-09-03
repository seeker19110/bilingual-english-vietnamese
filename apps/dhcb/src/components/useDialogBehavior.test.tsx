// Cổng canh SÁU HÀNH VI BẮT BUỘC của hộp thoại (`useDialogBehavior.ts`).
//
// Vì sao cần: hook này là hạ tầng a11y DÙNG CHUNG cho mọi hộp thoại có bố cục riêng
// (FeedbackModal, ShareProgress, QuickActions, PvPArena…), nhưng trước đợt này **không có một
// test nào**. Và nó nằm đúng VÙNG MÙ của cổng a11y e2e: `e2e/a11y.spec.ts` quét trang lúc mới
// tải, khi mọi hộp thoại còn đóng — axe không bao giờ nhìn thấy chúng.
//
// Hệ quả nếu để trống: ai đó bỏ `onKeyDown` khỏi một hộp thoại, hoặc sửa hook làm hỏng bẫy tiêu
// điểm, thì người dùng bàn phím bị kẹt trong hộp thoại mà KHÔNG cổng nào đỏ. Đây là loại hỏng
// im lặng — đúng thứ CLAUDE.md mục 4.5 đặt sàn cứng để chặn.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useDialogBehavior } from './useDialogBehavior'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function HopThoai({ onClose, open = true }: { onClose: () => void; open?: boolean }) {
  const { dialogProps, titleId, backdropProps } = useDialogBehavior(onClose, open)
  if (!open) return null
  return (
    <div data-testid="nen" {...backdropProps}>
      <div {...dialogProps}>
        <h2 id={titleId}>Tiêu đề hộp thoại</h2>
        <button data-testid="dau">Đầu</button>
        <button data-testid="giua">Giữa</button>
        <button data-testid="cuoi">Cuối</button>
      </div>
    </div>
  )
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  container.remove()
  document.body.style.overflow = ''
})

const lay = (id: string) => container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!
const khungHopThoai = () => container.querySelector<HTMLElement>('[role="dialog"]')!

/** Gõ phím vào khung hộp thoại — đi qua đúng `onKeyDown` mà hook trả về. */
async function goPhim(key: string, shiftKey = false) {
  await act(async () => {
    khungHopThoai().dispatchEvent(
      new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }),
    )
  })
}

describe('useDialogBehavior — sáu hành vi bắt buộc', () => {
  it('① khai đủ role, aria-modal và aria-labelledby TRỎ ĐÚNG tiêu đề', async () => {
    await act(async () => {
      root.render(<HopThoai onClose={() => {}} />)
    })
    const khung = khungHopThoai()
    expect(khung.getAttribute('aria-modal')).toBe('true')
    const idTieuDe = khung.getAttribute('aria-labelledby')
    expect(idTieuDe).toBeTruthy()
    // Không chỉ kiểm "có thuộc tính" — phải trỏ tới phần tử CÓ THẬT, nếu không trình đọc màn
    // hình đọc hộp thoại không tên.
    expect(container.querySelector(`#${CSS.escape(idTieuDe!)}`)?.textContent).toBe(
      'Tiêu đề hộp thoại',
    )
  })

  it('② Escape gọi onClose', async () => {
    const onClose = vi.fn()
    await act(async () => {
      root.render(<HopThoai onClose={onClose} />)
    })
    await goPhim('Escape')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('② phím khác Escape/Tab thì KHÔNG đóng', async () => {
    const onClose = vi.fn()
    await act(async () => {
      root.render(<HopThoai onClose={onClose} />)
    })
    await goPhim('a')
    await goPhim('Enter')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('③ Tab ở phần tử CUỐI vòng về đầu', async () => {
    await act(async () => {
      root.render(<HopThoai onClose={() => {}} />)
    })
    lay('cuoi').focus()
    await goPhim('Tab')
    expect(document.activeElement).toBe(lay('dau'))
  })

  it('③ Shift+Tab ở phần tử ĐẦU vòng về cuối', async () => {
    await act(async () => {
      root.render(<HopThoai onClose={() => {}} />)
    })
    lay('dau').focus()
    await goPhim('Tab', true)
    expect(document.activeElement).toBe(lay('cuoi'))
  })

  it('③ Tab ở GIỮA thì để trình duyệt tự đi, không can thiệp', async () => {
    await act(async () => {
      root.render(<HopThoai onClose={() => {}} />)
    })
    lay('giua').focus()
    await goPhim('Tab')
    // Hook chỉ chặn ở hai đầu; ở giữa nó không được đổi tiêu điểm.
    expect(document.activeElement).toBe(lay('giua'))
  })

  it('④ mở thì tiêu điểm tự vào phần tử focus được ĐẦU TIÊN', async () => {
    await act(async () => {
      root.render(<HopThoai onClose={() => {}} />)
    })
    expect(document.activeElement).toBe(lay('dau'))
  })

  it('④ đóng thì TRẢ tiêu điểm về nút đã mở nó', async () => {
    const nutMo = document.createElement('button')
    document.body.appendChild(nutMo)
    nutMo.focus()
    expect(document.activeElement).toBe(nutMo)

    await act(async () => {
      root.render(<HopThoai onClose={() => {}} />)
    })
    expect(document.activeElement).toBe(lay('dau'))

    await act(async () => {
      root.unmount()
    })
    expect(document.activeElement).toBe(nutMo)
    nutMo.remove()
  })

  it('⑤ bấm ĐÚNG lớp nền thì đóng, bấm phần tử con thì KHÔNG', async () => {
    const onClose = vi.fn()
    await act(async () => {
      root.render(<HopThoai onClose={onClose} />)
    })

    // Bấm vào nút bên trong — không được đóng, nếu không người dùng mất dữ liệu đang nhập.
    await act(async () => {
      lay('giua').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })
    expect(onClose).not.toHaveBeenCalled()

    await act(async () => {
      lay('nen').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('⑥ khoá cuộn nền khi mở và TRẢ LẠI giá trị cũ khi đóng', async () => {
    document.body.style.overflow = 'auto'
    await act(async () => {
      root.render(<HopThoai onClose={() => {}} />)
    })
    expect(document.body.style.overflow).toBe('hidden')

    await act(async () => {
      root.unmount()
    })
    // Trả về đúng giá trị TRƯỚC đó, không phải xoá trắng — nếu không trang nền mất cấu hình cuộn.
    expect(document.body.style.overflow).toBe('auto')
  })

  it('đang ĐÓNG thì không khoá cuộn và không cướp tiêu điểm', async () => {
    const nutNgoai = document.createElement('button')
    document.body.appendChild(nutNgoai)
    nutNgoai.focus()
    document.body.style.overflow = 'auto'

    await act(async () => {
      root.render(<HopThoai onClose={() => {}} open={false} />)
    })

    expect(document.body.style.overflow).toBe('auto')
    expect(document.activeElement).toBe(nutNgoai)
    nutNgoai.remove()
  })
})
