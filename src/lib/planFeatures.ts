// src/lib/planFeatures.ts — Đọc ma trận "tính năng nào bật cho gói nào" từ server
// (/api/plan-features, public, admin chỉnh qua tab "Tính năng theo gói" trong /admin). Cùng
// pattern với src/lib/appSettings.ts: hydrate ngay từ localStorage, refresh ở App.tsx.
import type { Plan } from '../types'

export interface FeatureCatalogItem {
  key: string
  label: string
  description: string | null
  sortOrder: number
}

export interface PlanFeatureMatrix {
  catalog: FeatureCatalogItem[]
  flags: Record<string, Record<Plan, boolean>>
  updatedAt: string
}

const DEFAULT_MATRIX: PlanFeatureMatrix = {
  catalog: [],
  flags: {},
  updatedAt: '1970-01-01T00:00:00.000Z',
}

const CACHE_KEY = 'plan_features_cache'

function loadFromLocalStorage(): PlanFeatureMatrix | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PlanFeatureMatrix>
    if (!parsed.flags || !parsed.updatedAt) return null
    return {
      catalog: parsed.catalog ?? [],
      flags: parsed.flags,
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return null
  }
}

let current: PlanFeatureMatrix = loadFromLocalStorage() ?? DEFAULT_MATRIX

export function getPlanFeatureMatrix(): PlanFeatureMatrix {
  return current
}

// Fail-open: tính năng chưa tải được ma trận (mới mở app, mất mạng) coi như BẬT — tránh chặn
// nhầm người dùng vào tính năng lúc app chưa kịp đồng bộ xong.
export function isFeatureEnabled(plan: Plan, featureKey: string): boolean {
  return current.flags[featureKey]?.[plan] ?? true
}

export async function refreshPlanFeatures(): Promise<void> {
  try {
    const res = await fetch('/api/plan-features', {
      headers: { 'If-None-Match': `"${current.updatedAt}"` },
    })
    if (res.status === 304) return
    if (!res.ok) return
    const data = (await res.json()) as PlanFeatureMatrix
    current = data
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    /* giữ nguyên cache/mặc định hiện có */
  }
}
