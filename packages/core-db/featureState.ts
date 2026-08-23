// featureState.ts — API đọc/ghi trạng thái tính năng theo user (bảng platform.feature_state).
//
// Thay cho các `Map` in-memory cấp module trong handler (vi phạm 12-factor stateless — mất
// khi restart, vỡ trong PM2 cluster). Mỗi (user, feature) một dòng JSONB.
// Migration: postgres/migrations/0058_platform_feature_state.sql.

import { getPgPool } from './pgPool.js'

// Đọc state của một tính năng cho user — null nếu chưa có (caller tự khởi tạo mặc định).
export async function getFeatureState<T>(userId: string, feature: string): Promise<T | null> {
  const pool = getPgPool()
  const { rows } = await pool.query<{ state: T }>(
    'select state from platform.feature_state where user_id = $1 and feature = $2',
    [userId, feature],
  )
  return rows[0]?.state ?? null
}

// Ghi (upsert) toàn bộ state của một tính năng cho user.
export async function setFeatureState<T>(userId: string, feature: string, state: T): Promise<void> {
  const pool = getPgPool()
  await pool.query(
    `insert into platform.feature_state (user_id, feature, state, updated_at)
     values ($1, $2, $3::jsonb, now())
     on conflict (user_id, feature) do update set state = excluded.state, updated_at = now()`,
    [userId, feature, JSON.stringify(state)],
  )
}
