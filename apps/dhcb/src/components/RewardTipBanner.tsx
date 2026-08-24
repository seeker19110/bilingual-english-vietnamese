// src/components/RewardTipBanner.tsx — banner gợi ý "cách kiếm huy hiệu & thưởng hiệu quả",
// tự hiện 1 lần cho user mới rồi tự ẩn sau ít giây (hoặc đóng tay) — không hiện lại nữa
// (trạng thái "đã xem" ở lib/rewardTip.ts). Dùng ở các trang người dùng hay vào nhất
// (Home, Profile) để không ai bỏ lỡ nhưng cũng không làm phiền lặp lại.
import { useEffect, useState } from 'react'
import { Gift, X } from 'lucide-react'
import { shouldShowRewardTip, dismissRewardTip } from '../lib/rewardTip'

const AUTO_HIDE_MS = 12000

export default function RewardTipBanner({ uid, isA }: { uid: string; isA: boolean }) {
  // Đọc trạng thái "đã xem" 1 lần qua lazy initializer; khi uid đổi thì tính lại
  // bằng mẫu "so sánh prev trong render" (thay cho setState đồng bộ trong effect).
  const [visible, setVisible] = useState(() => shouldShowRewardTip(uid))
  const [prevUid, setPrevUid] = useState(uid)
  if (uid !== prevUid) {
    setPrevUid(uid)
    setVisible(shouldShowRewardTip(uid))
  }

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => close(), AUTO_HIDE_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close() không đổi theo state khác
  }, [visible])

  function close() {
    setVisible(false)
    dismissRewardTip(uid)
  }

  if (!visible) return null

  return (
    <div
      role="status"
      className="mb-3 glass rounded-2xl p-4 border border-amber-500/30 animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
          <Gift className="w-4 h-4 text-amber-300" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">
            {isA ? 'Mẹo kiếm huy hiệu & thưởng nhanh nhất' : 'Fastest way to earn achievements'}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isA
              ? 'Giữ streak học mỗi ngày + làm challenge 1 phút đều đặn — 2 việc tốn ít thời gian nhất nhưng cộng dồn huy hiệu nhanh nhất. Xem đủ danh sách ở mục Nhiệm vụ trong Hồ sơ.'
              : 'Keep a daily streak + do the 1-minute challenge daily — the two lowest-effort habits that rack up achievements fastest. See the full list in the Quests section of your Profile.'}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={isA ? 'Ẩn gợi ý huy hiệu' : 'Hide achievement tip'}
          className="tap-44 shrink-0 text-zinc-400 hover:text-zinc-200 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
