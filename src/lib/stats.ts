// src/lib/stats.ts — Gom số liệu tiến độ cho trang Bảng tiến độ (/progress)
// Lấy dữ liệu từ nhiều nơi (lượt dùng, vocab, SRS, lịch sử, CEFR) rồi tổng hợp lại,
// để trang Dashboard chỉ cần gọi vài hàm thay vì tự lắp ráp từng mảnh.

import type { DailyUsage } from '../types'
import { loadCefr } from '../data/cefrLoader'
import { loadFoundation } from '../data/curriculumLoader'
import type { CefrLevel } from '../data/cefr'
import type { Circle } from '../data/curriculum'

const DAY_MS = 86_400_000
const dayStr = (d: Date) => d.toISOString().slice(0, 10)

// Đọc lượt dùng của 1 ngày bất kỳ — DÙNG CHUNG KEY với storage.ts (`et_usage_<uid>_<date>`).
function readUsage(uid: string, date: string): DailyUsage | null {
  try {
    const raw = localStorage.getItem(`et_usage_${uid}_${date}`)
    return raw ? (JSON.parse(raw) as DailyUsage) : null
  } catch {
    return null
  }
}

// Tổng số hoạt động trong 1 ngày (chat + viết + nói + STT)
function usageTotal(u: DailyUsage | null): number {
  if (!u) return 0
  return u.chatCount + u.writingCount + u.speakingCount + (u.sttCount ?? 0)
}

export interface DayActivity {
  date: string  // YYYY-MM-DD
  dow: number   // 0 = Chủ nhật … 6 = Thứ bảy (component tự đổi sang nhãn theo ngôn ngữ)
  count: number // tổng số hoạt động trong ngày
  active: boolean
}

// 7 ngày gần nhất (cũ → mới) — dùng để vẽ biểu đồ streak dạng cột/chấm.
export function getActivity7Days(uid: string): DayActivity[] {
  const out: DayActivity[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS)
    const count = usageTotal(readUsage(uid, dayStr(d)))
    out.push({ date: dayStr(d), dow: d.getDay(), count, active: count > 0 })
  }
  return out
}

// Tổng số hoạt động trong 7 ngày gần nhất (gồm cả hôm nay).
export function getWeekTotal(uid: string): number {
  return getActivity7Days(uid).reduce((sum, d) => sum + d.count, 0)
}

// ── Tiến độ theo cấp CEFR (A1 → B2) ─────────────────────────────────────────
export interface LevelProgress {
  id: CefrLevel['id']
  titleVi: string
  titleEn: string
  accent: CefrLevel['accent']
  doneWords: number
  totalWords: number
  pct: number        // 0..100 (theo số từ vựng đã thuộc của cấp)
  grammarCount: number
}

// Số từ trong 1 vòng đã thuộc — so cả bản gốc lẫn chữ thường (giống RoadmapTab).
function circleDone(circle: Circle, learned: Set<string>): number {
  return circle.words.filter(w => learned.has(w.word) || learned.has(w.word.toLowerCase())).length
}

// % hoàn thành mỗi cấp = số từ đã thuộc / tổng số từ trong các vòng vocab của cấp.
// Đây CHÍNH là cách RoadmapTab tính tiến độ + mở khóa cấp (ngưỡng 70%) — giữ nhất quán.
export async function getCefrProgress(learned: Set<string>): Promise<LevelProgress[]> {
  const [levels, foundation] = await Promise.all([loadCefr(), loadFoundation()])
  const byId: Record<string, Circle> = {}
  foundation.forEach(c => { byId[c.id] = c })

  return levels.map(level => {
    const ids = level.units.flatMap(u => u.vocabCircleIds)
    let totalWords = 0
    let doneWords = 0
    for (const id of ids) {
      const c = byId[id]
      if (!c) continue
      totalWords += c.words.length
      doneWords += circleDone(c, learned)
    }
    const grammarCount = level.units.reduce((s, u) => s + u.grammar.length, 0)
    return {
      id: level.id,
      titleVi: level.titleVi,
      titleEn: level.titleEn,
      accent: level.accent,
      doneWords,
      totalWords,
      pct: totalWords ? Math.round((doneWords / totalWords) * 100) : 0,
      grammarCount,
    }
  })
}
