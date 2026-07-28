// api/_lib/planFeatures.ts — Đọc ma trận "tính năng nào bật cho gói nào" (bảng
// feature_catalog + plan_feature_flags, admin chỉnh qua /api/admin-plan-features). Cache trong
// bộ nhớ tiến trình (TTL ngắn) giống api/_lib/settings.ts — tránh tra DB ở mọi request.
import { getPgPool } from './pgPool.js'
import type { Plan } from './plan.js'

export interface FeatureCatalogItem {
  key: string
  label: string
  description: string | null
  sortOrder: number
}

export interface PlanFeatureMatrix {
  catalog: FeatureCatalogItem[]
  // flags[featureKey][plan] = true/false
  flags: Record<string, Record<Plan, boolean>>
  updatedAt: string
}

const DEFAULT_MATRIX: PlanFeatureMatrix = {
  catalog: [],
  flags: {},
  updatedAt: '1970-01-01T00:00:00.000Z',
}

interface Row {
  key: string
  label: string
  description: string | null
  sort_order: number
  created_at: Date
  plan: Plan
  enabled: boolean
  flag_updated_at: Date
}

async function loadMatrix(): Promise<PlanFeatureMatrix> {
  const pool = getPgPool()
  const { rows } = await pool.query<Row>(
    `select c.key, c.label, c.description, c.sort_order, c.created_at,
            f.plan, f.enabled, f.updated_at as flag_updated_at
       from public.feature_catalog c
       join public.plan_feature_flags f on f.feature_key = c.key
       order by c.sort_order, c.key`,
  )

  const catalogByKey = new Map<string, FeatureCatalogItem>()
  const flags: Record<string, Record<Plan, boolean>> = {}
  let latest = new Date(0)

  for (const row of rows) {
    if (!catalogByKey.has(row.key)) {
      catalogByKey.set(row.key, {
        key: row.key,
        label: row.label,
        description: row.description,
        sortOrder: row.sort_order,
      })
    }
    const featureFlags = (flags[row.key] ??= { free: true, pro: true, vip: true })
    featureFlags[row.plan] = row.enabled
    if (row.created_at > latest) latest = row.created_at
    if (row.flag_updated_at > latest) latest = row.flag_updated_at
  }

  return {
    catalog: [...catalogByKey.values()],
    flags,
    updatedAt: rows.length ? latest.toISOString() : DEFAULT_MATRIX.updatedAt,
  }
}

const CACHE_TTL_MS = 30_000
let cache: { value: PlanFeatureMatrix; fetchedAt: number } | null = null

export async function getPlanFeatureMatrix(): Promise<PlanFeatureMatrix> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.value
  try {
    const value = await loadMatrix()
    cache = { value, fetchedAt: Date.now() }
    return value
  } catch (err) {
    console.warn('[planFeatures] Đọc ma trận tính năng lỗi → fail-open (coi như bật hết):', err)
    return DEFAULT_MATRIX
  }
}

export function invalidatePlanFeatureCache(): void {
  cache = null
}

// Fail-open: tính năng chưa có trong danh mục (hoặc DB lỗi) coi như BẬT — tránh 1 lỗi hạ tầng
// khoá nhầm tính năng cả app. Chỉ tính năng admin đã TỰ TAY tắt mới bị khoá.
export async function isFeatureEnabledForPlan(featureKey: string, plan: Plan): Promise<boolean> {
  const matrix = await getPlanFeatureMatrix()
  return matrix.flags[featureKey]?.[plan] ?? true
}
