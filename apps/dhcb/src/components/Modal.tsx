// apps/dhcb/src/components/Modal.tsx — hộp thoại dùng chung, đạt chuẩn a11y.
//
// Vì sao có file này: 4 trang trụ cột (Career/Work/Startup/Life) từng tự viết 15 hộp
// thoại bằng <div className="fixed inset-0">, không cái nào có role="dialog",
// aria-modal, phím Escape hay bẫy tiêu điểm (focus trap). Cổng a11y của CI không bắt
// được vì nó chỉ quét trang ở trạng thái hộp thoại ĐANG ĐÓNG.
//
// Component này gom đủ 6 hành vi bắt buộc của một hộp thoại theo WAI-ARIA APG:
//   1. role="dialog" + aria-modal="true" + aria-labelledby trỏ tới tiêu đề
//   2. Escape để đóng
//   3. Bẫy tiêu điểm: Tab/Shift+Tab chạy vòng trong hộp thoại, không lọt ra nền
//   4. Tự đưa tiêu điểm vào hộp thoại khi mở, và TRẢ tiêu điểm về nút đã mở nó khi đóng
//   5. Bấm ra nền (backdrop) để đóng
//   6. Khoá cuộn trang nền khi hộp thoại đang mở
import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Các phần tử có thể nhận tiêu điểm bàn phím bên trong hộp thoại. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export type ModalProps = {
  /** Tiêu đề hộp thoại — cũng là tên có thể truy cập (accessible name). */
  title: string
  /** Gọi khi người dùng muốn đóng: nút X, phím Escape, hoặc bấm ra nền. */
  onClose: () => void
  children: ReactNode
  /** Chiều rộng tối đa (lớp Tailwind). Mặc định `max-w-lg` như các hộp thoại cũ. */
  maxWidth?: string
  /** Nhãn cho nút đóng — đổi khi cần bản tiếng Anh (chiều B). */
  closeLabel?: string
}

export default function Modal({
  title,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  closeLabel = 'Đóng',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  // Nhớ phần tử đang có tiêu điểm TRƯỚC khi mở, để trả lại lúc đóng (yêu cầu 4).
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
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
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
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
    },
    [onClose],
  )

  return (
    // Lớp nền: bấm vào ĐÚNG lớp này (không phải phần tử con) thì đóng.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`bg-zinc-900 border border-zinc-800 rounded-2xl w-full ${maxWidth} p-6 shadow-2xl max-h-[90dvh] overflow-y-auto focus:outline-none`}
      >
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 id={titleId} className="text-lg font-bold text-zinc-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="tap-44 shrink-0 -mr-2 -mt-2 w-11 h-11 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
