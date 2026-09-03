import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchPlanPrices } from '../lib/payment'

interface Props {
  isA: boolean
}

// Băng quảng cáo khuyến mãi % giá — hiện % + thời gian kết thúc, dùng chung cho Trang chủ
// (Home.tsx) và Cài đặt (Profile.tsx). Tự ẩn nếu không có khuyến mãi nào đang chạy (đọc
// promoPercent/promoEndsAt công khai từ /api/plan-prices — xem api/plan-prices.ts).
export default function PricePromoBanner({ isA }: Props) {
  const nav = useNavigate()
  const [percent, setPercent] = useState<number | null>(null)
  const [endsAt, setEndsAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchPlanPrices().then((data) => {
      if (cancelled || !data) return
      setPercent(data.promoPercent)
      setEndsAt(data.promoEndsAt)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (percent === null || percent <= 0) return null

  const endsLabel = endsAt
    ? new Date(endsAt).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <button
      onClick={() => nav('/cai-dat')}
      className="mt-3 w-full text-left glass rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0" aria-hidden="true">
          🎉
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 theme-light:text-amber-900 shrink-0" />
            {isA ? `Giảm ${percent}% cho gói Pro/VIP` : `${percent}% off Pro/VIP plans`}
          </p>
          {endsLabel && (
            <p className="text-xs text-zinc-400 mt-0.5">
              {isA ? `Kết thúc lúc ${endsLabel}` : `Ends at ${endsLabel}`}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
