// apps/dhcb/src/components/Modal.tsx — hộp thoại dùng chung, đạt chuẩn a11y.
//
// Vì sao có file này: 4 trang trụ cột (Career/Work/Startup/Life) từng tự viết 15 hộp
// thoại bằng <div className="fixed inset-0">, không cái nào có role="dialog",
// aria-modal, phím Escape hay bẫy tiêu điểm (focus trap). Cổng a11y của CI không bắt
// được vì nó chỉ quét trang ở trạng thái hộp thoại ĐANG ĐÓNG.
//
// Sáu hành vi bắt buộc theo WAI-ARIA APG nằm ở hook dùng chung `useDialogBehavior`
// (tách ra 2026-08-31 để các hộp thoại có bố cục đặc thù dùng lại được):
//   1. role="dialog" + aria-modal="true" + aria-labelledby trỏ tới tiêu đề
//   2. Escape để đóng
//   3. Bẫy tiêu điểm: Tab/Shift+Tab chạy vòng trong hộp thoại, không lọt ra nền
//   4. Tự đưa tiêu điểm vào hộp thoại khi mở, và TRẢ tiêu điểm về nút đã mở nó khi đóng
//   5. Bấm ra nền (backdrop) để đóng
//   6. Khoá cuộn trang nền khi hộp thoại đang mở
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useDialogBehavior } from './useDialogBehavior'

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
  const { dialogProps, titleId, backdropProps } = useDialogBehavior(onClose)

  return (
    // Lớp nền: bấm vào ĐÚNG lớp này (không phải phần tử con) thì đóng.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      {...backdropProps}
    >
      <div
        {...dialogProps}
        className={`bg-zinc-900 border border-zinc-800 rounded-2xl w-full ${maxWidth} p-6 shadow-2xl max-h-[90dvh] overflow-y-auto focus:outline-none`}
      >
        {/*
          Header dính (sticky) ở mép trên vùng cuộn: nội dung dài cuộn xuống thì tiêu đề
          và nút đóng vẫn còn trên màn hình. `-mx-6 -mt-6 px-6 pt-6` kéo dải nền ra sát
          mép khung (khung có p-6) để chữ cuộn qua không bị lộ ra sau lưng header.
        */}
        <div className="sticky top-0 z-10 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-zinc-900 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-lg font-bold text-zinc-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="tap-44 shrink-0 -mr-2 w-11 h-11 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
