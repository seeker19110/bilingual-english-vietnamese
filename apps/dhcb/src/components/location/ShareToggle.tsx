// apps/dhcb/src/components/location/ShareToggle.tsx — Công tắc chia sẻ vị trí.
//
// Đây là quyết định riêng tư quan trọng nhất của cả màn hình, nên nó được thiết kế theo 3 luật:
//   1. LUÔN với tới được — dính đáy màn hình (sticky), không bao giờ phải cuộn đi tìm, không bao
//      giờ nằm trong menu con. Đang đi ngoài đường, một tay cầm máy, ngón cái phải bấm tắt được
//      ngay lập tức.
//   2. NHÌN LÀ BIẾT — hai trạng thái khác nhau về MÀU + BIỂU TƯỢNG + CHỮ, không chỉ khác chữ.
//      Đang phát thì có chấm nhấp nháy; tắt thì viền trung tính, phẳng.
//   3. NÓI RÕ HẬU QUẢ — dòng phụ luôn cho biết CHÍNH XÁC ai đang thấy mình ("3 người trong
//      chuyến đang thấy bạn" / "Chưa ai thấy vị trí của bạn"), thay vì để người dùng tự đoán.

import { Radio, RadioTower } from 'lucide-react'

interface Props {
  sharing: boolean
  /** Số người KHÁC đang ở trong chuyến — dùng để nói rõ "ai đang thấy mình". */
  otherMemberCount: number
  onToggle: () => void
  busy?: boolean
}

export default function ShareToggle({ sharing, otherMemberCount, onToggle, busy = false }: Props) {
  const audience =
    otherMemberCount === 0
      ? 'Chưa có ai khác trong chuyến'
      : `${otherMemberCount} người trong chuyến đang thấy bạn`

  return (
    <div className="sticky bottom-[var(--bnav-h)] z-20 -mx-4 px-4 pt-2">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={sharing}
        disabled={busy}
        className={`tap-44 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-lg backdrop-blur-md transition-colors disabled:opacity-60 ${
          sharing
            ? 'bg-accent-500 text-[#09090b]'
            : 'border border-zinc-700 bg-zinc-900/95 text-zinc-100'
        }`}
      >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          {sharing ? (
            <>
              {/* Vòng lan toả — tín hiệu "đang phát trực tiếp", tắt khi người dùng chọn giảm
                  chuyển động (prefers-reduced-motion) qua freezeAnimations/CSS của dự án. */}
              <span
                className="absolute inset-0 animate-pulse-ring rounded-full bg-[#09090b]/30"
                aria-hidden="true"
              />
              <RadioTower className="relative h-6 w-6" aria-hidden="true" />
            </>
          ) : (
            <Radio className="h-6 w-6 text-zinc-400" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold">
            {sharing ? 'Đang chia sẻ vị trí — bấm để TẮT' : 'Bật chia sẻ vị trí của bạn'}
          </span>
          <span className={`block text-sm ${sharing ? '' : 'text-zinc-300'}`}>
            {sharing ? audience : 'Chưa ai thấy vị trí của bạn'}
          </span>
        </span>
      </button>
    </div>
  )
}
