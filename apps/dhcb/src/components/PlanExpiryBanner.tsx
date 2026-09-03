// components/PlanExpiryBanner.tsx — Banner "còn X ngày dùng gói Pro/VIP" khi hạn sắp tới
// (trial 14 ngày cấp tự động lúc đăng ký, hoặc gói trả phí sắp hết hạn — cùng cột
// profiles.plan_expires_at nên banner này dùng chung cho cả 2 trường hợp, xem
// api/_lib/trial.ts + api/_lib/authService.ts ensureProfileRow()).
//
// Cùng khuôn mẫu PromoEndingBanner.tsx: toàn bộ ca biên ngày tháng nằm ở
// lib/planExpiryBanner.ts (hàm thuần, có test riêng) — component chỉ lo hiển thị + điều hướng
// tới trang Nâng cấp (Hồ sơ).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sparkles } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'
import { vnDateStr } from '../lib/date'
import {
  shouldShowPlanExpiryBanner,
  daysUntilPlanExpires,
  PLAN_EXPIRY_BANNER_DISMISS_KEY,
} from '../lib/planExpiryBanner'

function readDismissedDate(): string | null {
  try {
    return localStorage.getItem(PLAN_EXPIRY_BANNER_DISMISS_KEY)
  } catch {
    return null // localStorage không khả dụng (vd chế độ ẩn danh chặn) — coi như chưa đóng
  }
}

function writeDismissedToday(): void {
  try {
    localStorage.setItem(PLAN_EXPIRY_BANNER_DISMISS_KEY, vnDateStr())
  } catch {
    /* Không lưu được thì banner sẽ hiện lại lần sau — không phải lỗi nghiêm trọng */
  }
}

export default function PlanExpiryBanner() {
  const { user } = useAuth()
  const { lang } = useLang()
  const isA = lang === 'vi'
  const nav = useNavigate()
  // State riêng để ẩn NGAY khi bấm đóng, không phải chờ re-render từ nơi khác.
  const [dismissedNow, setDismissedNow] = useState(false)

  if (!user || dismissedNow) return null
  const planExpiresAt = user.planExpiresAt ?? null
  if (!shouldShowPlanExpiryBanner(user.plan, planExpiresAt, new Date(), readDismissedDate())) {
    return null
  }

  const daysLeft = daysUntilPlanExpires(planExpiresAt as string, new Date())
  const planLabel = user.plan === 'vip' ? 'VIP' : user.plan === 'plus' ? 'Plus' : 'Pro'

  const handleDismiss = () => {
    writeDismissedToday()
    setDismissedNow(true)
  }

  return (
    <div role="status" className="bg-amber-500/10 border-b border-amber-500/25 text-sm">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <Sparkles
          className="w-4 h-4 text-amber-400 theme-light:text-amber-900 shrink-0"
          aria-hidden="true"
        />
        <p className="flex-1 min-w-0 text-zinc-200 theme-light:text-zinc-800">
          {isA ? (
            <>
              Gói <strong className="font-semibold">{planLabel}</strong> của bạn còn{' '}
              <strong className="font-semibold">{daysLeft} ngày</strong> —{' '}
              <button
                onClick={() => nav('/cai-dat')}
                className="underline underline-offset-2 hover:text-white transition"
              >
                gia hạn ngay
              </button>{' '}
              để không mất quyền lợi.
            </>
          ) : (
            <>
              Your <strong className="font-semibold">{planLabel}</strong> plan has{' '}
              <strong className="font-semibold">{daysLeft} day(s)</strong> left —{' '}
              <button
                onClick={() => nav('/cai-dat')}
                className="underline underline-offset-2 hover:text-white transition"
              >
                renew now
              </button>{' '}
              to keep your benefits.
            </>
          )}
        </p>
        <button
          onClick={handleDismiss}
          aria-label={isA ? 'Đóng thông báo' : 'Dismiss'}
          className="tap-44 shrink-0 flex items-center justify-center text-zinc-400 hover:text-white theme-light:text-zinc-500 theme-light:hover:text-zinc-900 transition rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
