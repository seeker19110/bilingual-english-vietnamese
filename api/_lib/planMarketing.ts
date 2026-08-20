// api/_lib/planMarketing.ts — Đọc nội dung mô tả gói (badge/tagline + gạch đầu dòng tính
// năng/lợi ích, bảng plan_marketing_info + plan_marketing_bullets, admin chỉnh qua
// /api/admin-plan-marketing). Cache trong bộ nhớ tiến trình (TTL ngắn) giống
// api/_lib/planFeatures.ts — tránh tra DB ở mọi request.
import { getPgPool } from '../../packages/core-db/pgPool.js'
import type { Plan } from '../../packages/core-billing/plan.js'

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

interface InfoRow {
  plan: Plan
  badge: string
  tagline_vi: string
  tagline_en: string
  updated_at: Date
}

interface BulletRow {
  id: number
  plan: Plan
  sort_order: number
  text_vi: string
  text_en: string
  updated_at: Date
}

async function loadData(): Promise<PlanMarketingData> {
  const pool = getPgPool()
  const [{ rows: infoRows }, { rows: bulletRows }] = await Promise.all([
    pool.query<InfoRow>(
      'select plan, badge, tagline_vi, tagline_en, updated_at from public.plan_marketing_info',
    ),
    pool.query<BulletRow>(
      `select id, plan, sort_order, text_vi, text_en, updated_at
         from public.plan_marketing_bullets
         order by plan, sort_order, id`,
    ),
  ])

  const plans: Record<Plan, PlanMarketingEntry> = {
    free: EMPTY_ENTRY('free'),
    plus: EMPTY_ENTRY('plus'),
    pro: EMPTY_ENTRY('pro'),
    vip: EMPTY_ENTRY('vip'),
  }
  let latest = new Date(0)

  for (const row of infoRows) {
    plans[row.plan] = {
      plan: row.plan,
      badge: row.badge,
      taglineVi: row.tagline_vi,
      taglineEn: row.tagline_en,
      bullets: [],
    }
    if (row.updated_at > latest) latest = row.updated_at
  }
  for (const row of bulletRows) {
    plans[row.plan].bullets.push({
      id: row.id,
      textVi: row.text_vi,
      textEn: row.text_en,
      sortOrder: row.sort_order,
    })
    if (row.updated_at > latest) latest = row.updated_at
  }

  return {
    plans,
    updatedAt: infoRows.length || bulletRows.length ? latest.toISOString() : DEFAULT_DATA.updatedAt,
  }
}

const CACHE_TTL_MS = 30_000
let cache: { value: PlanMarketingData; fetchedAt: number } | null = null

export async function getPlanMarketing(): Promise<PlanMarketingData> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.value
  try {
    const value = await loadData()
    cache = { value, fetchedAt: Date.now() }
    return value
  } catch (err) {
    console.warn('[planMarketing] Đọc nội dung mô tả gói lỗi → trả rỗng, client tự fallback:', err)
    return DEFAULT_DATA
  }
}

export function invalidatePlanMarketingCache(): void {
  cache = null
}
