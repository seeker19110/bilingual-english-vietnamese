// progressSync.ts — Đồng bộ TIẾN ĐỘ HỌC lên Supabase để không mất khi đổi máy.
//
// Trước đây từ đã thuộc (et_learned_*), từ khó (et_hard_*) và lịch ôn SRS (srs_*)
// CHỈ nằm trong localStorage → đổi điện thoại/xoá cache là mất sạch, mất động lực.
// Module này đẩy/kéo các dữ liệu đó qua bảng `learning_progress` (RLS theo user).
//
// localStorage vẫn là bộ đệm đọc nhanh + chạy offline. Khi kéo về, ta HỢP NHẤT
// (không ghi đè mất dữ liệu): learned/hard lấy hợp (union), SRS giữ thẻ tiến bộ hơn.

import { supabase } from './supabase'

const LEARNED = (uid: string) => `et_learned_${uid}`
const HARD = (uid: string) => `et_hard_${uid}`
const SRS = (uid: string) => `srs_${uid}`

// Cấu trúc 1 thẻ SRS (khớp src/lib/srs.ts) — chỉ cần để merge theo số lần ôn (reps).
interface SRSLike {
  interval: number
  ease: number
  due: number
  reps: number
}

function readArr(key: string): string[] {
  try {
    const r = localStorage.getItem(key)
    const arr = r ? (JSON.parse(r) as unknown) : []
    return Array.isArray(arr) ? (arr as string[]) : []
  } catch {
    return []
  }
}

function readObj(key: string): Record<string, SRSLike> {
  try {
    const r = localStorage.getItem(key)
    const obj = r ? (JSON.parse(r) as unknown) : {}
    return obj && typeof obj === 'object' ? (obj as Record<string, SRSLike>) : {}
  } catch {
    return {}
  }
}

// Đẩy toàn bộ tiến độ hiện tại lên Supabase (bắn rồi quên — không chặn giao diện).
export function pushProgress(userId: string): void {
  if (!userId) return
  void supabase
    .from('learning_progress')
    .upsert(
      {
        user_id: userId,
        learned: readArr(LEARNED(userId)),
        hard: readArr(HARD(userId)),
        srs: readObj(SRS(userId)),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .then(({ error }) => {
      if (error) console.warn('[progress] đẩy tiến độ lỗi:', error.message)
    })
}

// Kéo tiến độ từ Supabase → HỢP NHẤT với bản local → ghi lại localStorage → đẩy bản
// hợp nhất lên (để mọi máy hội tụ). Lỗi mạng bị nuốt — vẫn dùng bản local.
export async function pullProgress(userId: string): Promise<void> {
  if (!userId) return
  const { data, error } = await supabase
    .from('learning_progress')
    .select('learned, hard, srs')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return

  const cloud = data as { learned?: string[]; hard?: string[]; srs?: Record<string, SRSLike> }

  // learned & hard: dữ liệu chỉ tăng dần → lấy hợp của local và cloud
  const learned = new Set<string>([...readArr(LEARNED(userId)), ...(cloud.learned ?? [])])
  const hard = new Set<string>([...readArr(HARD(userId)), ...(cloud.hard ?? [])])

  // SRS: merge theo từ-khoá, giữ thẻ có nhiều lần ôn hơn (tiến bộ hơn)
  const merged: Record<string, SRSLike> = { ...(cloud.srs ?? {}) }
  for (const [k, v] of Object.entries(readObj(SRS(userId)))) {
    const c = merged[k]
    if (!c || (v.reps ?? 0) >= (c.reps ?? 0)) merged[k] = v
  }

  try {
    localStorage.setItem(LEARNED(userId), JSON.stringify([...learned]))
    localStorage.setItem(HARD(userId), JSON.stringify([...hard]))
    localStorage.setItem(SRS(userId), JSON.stringify(merged))
  } catch {
    /* hết dung lượng — bỏ qua */
  }

  pushProgress(userId) // đẩy bản hợp nhất để cloud cập nhật
}
