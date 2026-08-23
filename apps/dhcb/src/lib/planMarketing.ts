// src/lib/planMarketing.ts — Đọc nội dung mô tả gói (badge/tagline + gạch đầu dòng) từ server
// (/api/plan-marketing, public, admin chỉnh qua tab "Nội dung gói" trong /admin). Cùng pattern
// với src/lib/planFeatures.ts: hydrate ngay từ localStorage, refresh ở App.tsx.
import type { Plan } from '../types'

export interface PlanMarketingBullet {
  id: number
  textVi: string
  textEn: string
  sortOrder: number
}

export interface PlanMarketingEntry {
  plan: Plan
  badge: string
  taglineVi: string
  taglineEn: string
  bullets: PlanMarketingBullet[]
}

export interface PlanMarketingData {
  plans: Record<Plan, PlanMarketingEntry>
  updatedAt: string
}

const EMPTY_ENTRY = (plan: Plan): PlanMarketingEntry => ({
  plan,
  badge: '',
  taglineVi: '',
  taglineEn: '',
  bullets: [],
})

const DEFAULT_DATA: PlanMarketingData = {
  plans: {
    free: EMPTY_ENTRY('free'),
    plus: EMPTY_ENTRY('plus'),
    pro: EMPTY_ENTRY('pro'),
    vip: EMPTY_ENTRY('vip'),
  },
  updatedAt: '1970-01-01T00:00:00.000Z',
}

const CACHE_KEY = 'plan_marketing_cache'

function loadFromLocalStorage(): PlanMarketingData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PlanMarketingData>
    if (!parsed.plans || !parsed.updatedAt) return null
    return { plans: parsed.plans, updatedAt: parsed.updatedAt }
  } catch {
    return null
  }
}

let current: PlanMarketingData = loadFromLocalStorage() ?? DEFAULT_DATA

// true chỉ khi đã tải được dữ liệu thật từ server (hoặc cache localStorage của lần tải trước)
// — dùng để UpgradeSection.tsx biết lúc nào nên dùng nội dung mặc định cứng trong code làm
// fallback (server chưa chạy migration 0025, mất mạng lần đầu mở app...).
export function getPlanMarketing(): PlanMarketingData | null {
  return current.updatedAt === DEFAULT_DATA.updatedAt ? null : current
}

export async function refreshPlanMarketing(): Promise<void> {
  try {
    const res = await fetch('/api/plan-marketing', {
      headers: { 'If-None-Match': `"${current.updatedAt}"` },
    })
    if (res.status === 304) return
    if (!res.ok) return
    const data = (await res.json()) as PlanMarketingData
    current = data
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    /* giữ nguyên cache/mặc định hiện có */
  }
}
