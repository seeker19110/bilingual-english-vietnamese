// src/lib/referral.ts — Client cho tính năng mời bạn (xem api/referral.ts).
// Mã mời được lưu tạm ở localStorage lúc người dùng vào landing page qua link ?ref=MÃ
// (src/pages/Landing.tsx), rồi gửi lên server NGAY SAU KHI đăng ký thành công.

import { getAuthHeader } from '@core/authHeader'
import { getDeviceHash } from './deviceId'

// Cùng key với src/pages/Landing.tsx — đổi ở đây phải đổi cả bên đó.
export const PENDING_REF_CODE_KEY = 'pending_ref_code'

export interface ReferralStats {
  code: string
  rewardedCount: number
  pendingCount: number
  maxRewarded: number
  rewardDays: number
}

export async function fetchReferralStats(): Promise<ReferralStats | null> {
  try {
    const res = await fetch('/api/referral', { headers: getAuthHeader() })
    if (!res.ok) return null
    return (await res.json()) as ReferralStats
  } catch {
    return null
  }
}

/**
 * Gửi mã mời đang chờ (nếu có) lên server sau khi đăng ký xong, rồi xoá khỏi localStorage
 * để không gửi lại ở lần đăng nhập sau. Nuốt lỗi — không được chặn luồng đăng ký/vào app.
 */
export async function claimPendingReferral(): Promise<void> {
  let code: string | null = null
  try {
    code = localStorage.getItem(PENDING_REF_CODE_KEY)
  } catch {
    return // localStorage bị chặn (chế độ riêng tư) — bỏ qua
  }
  if (!code) return

  try {
    // Gửi kèm mã thiết bị để server chặn cày thưởng trên cùng máy (best-effort, xem deviceId.ts).
    const deviceHash = await getDeviceHash()
    await fetch('/api/referral', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ code, ...(deviceHash ? { deviceHash } : {}) }),
    })
  } catch {
    // Lỗi mạng — bỏ qua, không thử lại (tránh vòng lặp); người dùng vẫn dùng app bình thường.
  } finally {
    // Xoá dù thành công hay thất bại: mã chỉ dùng được 1 lần cho 1 tài khoản, giữ lại chỉ gây
    // gửi lặp vô ích ở các lần đăng nhập sau.
    try {
      localStorage.removeItem(PENDING_REF_CODE_KEY)
    } catch {
      /* không xoá được thì thôi */
    }
  }
}

// Link mời đầy đủ để người dùng copy đi chia sẻ.
export function buildReferralLink(code: string): string {
  const base = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
  const origin = base || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${origin}/welcome?ref=${encodeURIComponent(code)}`
}
