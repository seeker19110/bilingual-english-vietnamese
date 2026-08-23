// placementResult.ts — Lưu KẾT QUẢ bài test xếp lớp gần nhất (localStorage, đồng bộ
// Supabase qua progressSync.ts giống cefr_exams — xem lib/placement.ts cho thuật toán).

import type { CefrId, PlacementResult } from './placement'
import { pushProgress } from './progressSync'

export interface PlacementSaved extends PlacementResult {
  lastAt: string // ISO — dùng cho canRetakePlacement + hợp nhất "mới hơn thắng"
}

const KEY = (uid: string) => `et_placement_${uid}`

function isCefrId(v: unknown): v is CefrId {
  return v === 'A1' || v === 'A2' || v === 'B1' || v === 'B2' || v === 'C1' || v === 'C2'
}

export function getPlacementResult(uid: string): PlacementSaved | null {
  try {
    const raw = localStorage.getItem(KEY(uid))
    if (!raw) return null
    const d = JSON.parse(raw) as Partial<PlacementSaved>
    if (!isCefrId(d.cefr) || typeof d.lastAt !== 'string') return null
    if (d.appLevel !== 'beginner' && d.appLevel !== 'intermediate' && d.appLevel !== 'advanced')
      return null
    return { cefr: d.cefr, appLevel: d.appLevel, lastAt: d.lastAt }
  } catch {
    return null
  }
}

// Lưu kết quả mới + đồng bộ Supabase (bắn rồi quên, giống các hàm save* khác trong app).
export function savePlacementResult(uid: string, result: PlacementResult): PlacementSaved {
  const saved: PlacementSaved = { ...result, lastAt: new Date().toISOString() }
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(saved))
  } catch {
    /* hết dung lượng — bỏ qua, vẫn đồng bộ Supabase được */
  }
  if (uid) pushProgress(uid)
  return saved
}
