// Đọc LẠI kết quả onboarding (trình độ / mục tiêu / phút mỗi ngày).
// Trước đây saveOnboarding() (lib/cloud.ts) chỉ GHI lên Supabase mà không nơi
// nào đọc lại — file này bổ sung chiều đọc (U-3, docs/research/cai-tien-ui-ux.md).
// Chiến lược 2 tầng giống profile (lib/auth.ts): cache localStorage (~1ms, ghi
// ngay lúc onboarding xong) → Supabase (chạy nền, cho thiết bị mới chưa có cache).
import { useEffect, useState } from 'react'
import { getAuthHeader } from './authHeader'
import type { Level } from '../types'
import type { DailySpeed } from './curriculum'

export type OnboardingData = {
  level: Level
  goal: string
  dailyMinutes: number
}

const KEY = (uid: string) => `et_onboarding_${uid}`

function isValidLevel(v: unknown): v is Level {
  return v === 'beginner' || v === 'intermediate' || v === 'advanced'
}

// Đọc cache (sync). Trả null khi chưa có / dữ liệu hỏng — người gọi giữ mặc định cũ.
export function getCachedOnboarding(uid: string): OnboardingData | null {
  try {
    const raw = localStorage.getItem(KEY(uid))
    if (!raw) return null
    const d = JSON.parse(raw) as Partial<OnboardingData>
    if (!isValidLevel(d.level)) return null
    return {
      level: d.level,
      goal: typeof d.goal === 'string' ? d.goal : 'daily',
      dailyMinutes: typeof d.dailyMinutes === 'number' ? d.dailyMinutes : 10,
    }
  } catch {
    return null
  }
}

export function cacheOnboarding(uid: string, data: OnboardingData): void {
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(data))
  } catch {
    /* localStorage đầy/bị chặn — bỏ qua, chỉ là cache */
  }
}

// Đọc từ GET /api/profile (Giai đoạn C — trước đây gọi thẳng Supabase `profiles` qua RLS).
// Trả null khi chưa onboarded / lỗi mạng / dữ liệu lạ. Thành công thì tự ghi cache.
export async function fetchOnboarding(uid: string): Promise<OnboardingData | null> {
  try {
    const resp = await fetch('/api/profile', { headers: getAuthHeader() })
    if (!resp.ok) return null
    const data = (await resp.json()) as {
      onboarded: boolean
      userLevel: string
      goal: string
      dailyMinutes: number
    }
    if (!data.onboarded || !isValidLevel(data.userLevel)) return null
    const result: OnboardingData = {
      level: data.userLevel,
      goal: data.goal,
      dailyMinutes: data.dailyMinutes,
    }
    cacheOnboarding(uid, result)
    return result
  } catch {
    return null
  }
}

// Map "phút mỗi ngày" chọn lúc onboarding (5/10/20/30) → tốc độ học từ vựng
// 5/10/20 từ/ngày (lib/curriculum.ts). 30 phút cũng về 20 — tốc độ tối đa hiện có.
export function minutesToSpeed(minutes: number): DailySpeed {
  if (minutes <= 5) return 5
  if (minutes <= 10) return 10
  return 20
}

// Hook cho component: trả cache NGAY nếu có (state ổn định — chỉ ghi 1 lần lúc
// onboarding), thiết bị mới chưa có cache thì fetch nền rồi cập nhật.
// null = chưa biết (đang tải, chưa onboarded, hoặc chưa đăng nhập).
export function useOnboarding(uid: string | undefined): OnboardingData | null {
  const [data, setData] = useState<OnboardingData | null>(() =>
    uid ? getCachedOnboarding(uid) : null,
  )
  useEffect(() => {
    if (!uid) return
    const cached = getCachedOnboarding(uid)
    if (cached) {
      setData(cached)
      return
    }
    let alive = true
    void fetchOnboarding(uid).then((d) => {
      if (alive && d) setData(d)
    })
    return () => {
      alive = false
    }
  }, [uid])
  return data
}
