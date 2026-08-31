// apps/dhcb/src/components/useDialogBehavior.ts — 6 hành vi bắt buộc của một hộp thoại,
// tách từ `Modal.tsx` để các hộp thoại có bố cục đặc thù (header gradient, khung 3 cột,
// canvas vẽ…) dùng lại được mà KHÔNG phải đổi giao diện.
//
// Vì sao tách hook thay vì ép mọi chỗ dùng <Modal>: <Modal> áp một khung cố định
// (nền zinc-900, tiêu đề chữ đậm + nút X ở góc). Nhiều hộp thoại trong dự án có
// header riêng (thanh gradient, đồng hồ đếm ngược, tab…) nên lắp vào <Modal> sẽ
// PHÁ bố cục thị giác — điều bị cấm ở đợt sửa này. Hook giữ nguyên giao diện,
// chỉ bổ sung hành vi.
//
// Sáu hành vi (WAI-ARIA APG, giống hệt Modal.tsx):
//   1. role="dialog" + aria-modal="true" + aria-labelledby trỏ tới tiêu đề
//   2. Escape để đóng
//   3. Bẫy tiêu điểm: Tab/Shift+Tab chạy vòng trong hộp thoại
//   4. Tự đưa tiêu điểm vào khi mở, TRẢ tiêu điểm về nút đã mở nó khi đóng
//   5. (bấm ra nền — tuỳ nơi dùng, xem `backdropProps`)
//   6. Khoá cuộn trang nền khi hộp thoại đang mở
import { useCallback, useEffect, useId, useRef } from 'react'

/** Các phần tử có thể nhận tiêu điểm bàn phím bên trong hộp thoại. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export type UseDialogBehaviorResult = {
  /** Gắn vào khung hộp thoại: `<div {...dialogProps}>`. */
  dialogProps: {
    ref: React.RefObject<HTMLDivElement>
    role: 'dialog'
    'aria-modal': true
    'aria-labelledby': string
    tabIndex: -1
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
  }
  /** Gắn `id={titleId}` vào phần tử tiêu đề để aria-labelledby trỏ đúng. */
  titleId: string
  /** Gắn vào LỚP NỀN nếu muốn bấm ra ngoài là đóng. */
  backdropProps: { onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void }
}

/**
 * @param onClose gọi khi người dùng bấm Escape (hoặc bấm nền, nếu dùng `backdropProps`).
 * @param open hộp thoại có đang mở không. Nhiều component gọi hook TRƯỚC câu
 *   `if (!isOpen) return null`, nên cần cờ này để không khoá cuộn nền khi đang đóng.
 */
export function useDialogBehavior(onClose: () => void, open = true): UseDialogBehaviorResult {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  // Nhớ phần tử đang có tiêu điểm TRƯỚC khi mở, để trả lại lúc đóng (yêu cầu 4).
  const openerRef = useRef<HTMLElement | null>(null)
  // Giữ callback mới nhất để effect không phải chạy lại mỗi lần cha render lại.
  // Cập nhật trong effect (không phải lúc render) theo luật react-hooks/refs.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    // Đưa tiêu điểm vào phần tử focus được đầu tiên; không có thì focus chính khung
    // hộp thoại (nó có tabIndex={-1}) để trình đọc màn hình đọc tiêu đề.
    const panel = panelRef.current
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panel)?.focus()

    // Khoá cuộn nền: nếu không, cuộn chuột trên hộp thoại sẽ kéo trang phía sau.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prevOverflow
      openerRef.current?.focus()
    }
  }, [open])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onCloseRef.current()
      return
    }
    if (e.key !== 'Tab') return

    // Bẫy tiêu điểm: tới cuối thì vòng về đầu và ngược lại.
    const panel = panelRef.current
    if (!panel) return
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    )
    if (items.length === 0) return
    const first = items[0]!
    const last = items[items.length - 1]!
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Chỉ đóng khi bấm ĐÚNG lớp nền, không phải phần tử con.
    if (e.target === e.currentTarget) onCloseRef.current()
  }, [])

  return {
    dialogProps: {
      ref: panelRef,
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': titleId,
      tabIndex: -1,
      onKeyDown,
    },
    titleId,
    backdropProps: { onMouseDown },
  }
}
