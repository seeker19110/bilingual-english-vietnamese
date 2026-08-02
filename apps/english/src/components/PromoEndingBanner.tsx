// components/PromoEndingBanner.tsx — Banner báo trước khi mốc khuyến mãi ra mắt
// (mọi user đang được đối xử như VIP không giới hạn, xem lib/promo.ts) sắp hết
// hạn, để người dùng không bị sốc khi hạn mức đột ngột giảm xuống.
//
// Chỉ ĐỌC appSettings — không đụng tới logic hạn mức thật (usage.ts/promo.ts vẫn
// là nguồn sự thật duy nhất cho việc chặn). Toàn bộ ca biên ngày tháng (còn bao
// nhiêu ngày, đã đóng hôm nay chưa) nằm ở lib/promoEndingBanner.ts (hàm thuần, có
// test riêng) — component chỉ lo hiển thị.
import { useState } from 'react'
import { X } from 'lucide-react'
import { getAppSettings } from '../lib/appSettings'
import { vnDateStr } from '../lib/date'
import {
  shouldShowPromoEndingBanner,
  formatDateVN,
  PROMO_BANNER_DISMISS_KEY,
} from '../lib/promoEndingBanner'

function readDismissedDate(): string | null {
  try {
    return localStorage.getItem(PROMO_BANNER_DISMISS_KEY)
  } catch {
    return null // localStorage không khả dụng (vd chế độ ẩn danh chặn) — coi như chưa đóng
  }
}

function writeDismissedToday(): void {
  try {
    localStorage.setItem(PROMO_BANNER_DISMISS_KEY, vnDateStr())
  } catch {
    /* Không lưu được thì banner sẽ hiện lại lần sau — không phải lỗi nghiêm trọng */
  }
}

export default function PromoEndingBanner() {
  const { promoUntil } = getAppSettings()
  // State riêng để ẩn NGAY khi bấm đóng, không phải chờ re-render từ nơi khác.
  const [dismissedNow, setDismissedNow] = useState(false)

  if (dismissedNow) return null
  if (!shouldShowPromoEndingBanner(promoUntil, new Date(), readDismissedDate())) return null

  const handleDismiss = () => {
    writeDismissedToday()
    setDismissedNow(true)
  }

  return (
    <div
      role="status"
      className="fixed inset-x-0 z-30 bg-accent-500/10 border-t border-accent-500/25 text-sm"
      style={{ bottom: 'var(--bnav-h)' }}
    >
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <p className="flex-1 min-w-0 text-zinc-200 theme-light:text-zinc-800">
          Từ <strong className="font-semibold">{formatDateVN(promoUntil as string)}</strong>, app sẽ
          áp hạn mức lượt dùng/ngày để duy trì lâu dài cho mọi người — cảm ơn bạn đã đồng hành!
        </p>
        <button
          onClick={handleDismiss}
          aria-label="Đóng thông báo"
          className="tap-44 shrink-0 flex items-center justify-center text-zinc-400 hover:text-white theme-light:text-zinc-500 theme-light:hover:text-zinc-900 transition rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
