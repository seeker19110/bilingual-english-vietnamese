// ──────────────────────────────────────────────────────────────────────
// BÀI TEST XẾP LỚP ĐẦU VÀO (placement test) — thuật toán bậc thang thích ứng
//
// Mục tiêu: thay vì bắt người dùng TỰ đoán trình độ (onboarding cũ), cho làm
// bài test ngắn (tối đa 3 vòng × 8 câu ≈ 5–7 phút) để đề xuất CẤP CEFR nên
// BẮT ĐẦU HỌC. Xem docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md (mục ④).
//
// Cách chạy (bậc thang):
//   - Vòng 1 luôn thi ở A2 (đa số người Việt tự học rơi quanh đây).
//   - Điểm vòng ≥75% → cấp đó ĐÃ VỮNG → thi tiếp cấp trên (≥95% → nhảy 2 cấp).
//   - Điểm vòng ≤40% → cấp đó CHƯA VỮNG rõ ràng → thi xuống cấp dưới.
//   - Điểm ở giữa → dừng: cấp hiện tại chính là chỗ nên bắt đầu.
//   - Chạm biên (A1/C2), quay lại cấp đã kết luận, hoặc đủ 3 vòng → dừng.
//   - Kết quả = CẤP THẤP NHẤT CHƯA VỮNG (đó là thứ cần học tiếp); mọi cấp đã
//     thi đều vững → cấp trên cấp vững cao nhất (tối đa C2).
//
// File này CHỈ chứa logic thuần (không I/O, không state ẩn — mọi thứ suy ra từ
// `history`) để test được trọn ca biên. Trang /placement (PR sau) lo phần dựng
// câu hỏi (tái dùng buildExam của lib/cefrExam.ts với PLACEMENT_ROUND_PLAN),
// UI và lưu kết quả.
// ──────────────────────────────────────────────────────────────────────

import type { CefrLevel } from '../data/cefr'
import type { Level } from '../types'

export type CefrId = CefrLevel['id']

// Thứ tự các cấp từ thấp → cao (nguồn sự thật cho phép +1/-1 cấp).
export const CEFR_ORDER: readonly CefrId[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// Vòng đầu tiên luôn thi ở cấp này.
export const PLACEMENT_START: CefrId = 'A2'

// Ngưỡng điểm vòng (% đã làm tròn 0–100).
export const PLACEMENT_UP_PCT = 75 // ≥ → cấp đã vững, thi lên
export const PLACEMENT_JUMP_PCT = 95 // ≥ → vững "quá dễ", nhảy 2 cấp cho đỡ tốn vòng
export const PLACEMENT_DOWN_PCT = 40 // ≤ → chưa vững rõ ràng, thi xuống

// Tối đa số vòng — giữ bài test ≤ ~7 phút.
export const PLACEMENT_MAX_ROUNDS = 3

// Số câu mỗi vòng (8 câu) — truyền vào buildExam (lib/cefrExam.ts) làm `plan`.
export const PLACEMENT_ROUND_PLAN = { vocab: 4, grammar: 2, listening: 1, reading: 1 } as const

// Cho làm lại sau ít nhất chừng này ngày (chống spam thi lại để "được" xếp cao).
export const PLACEMENT_RETRY_DAYS = 30

// 1 vòng đã thi: cấp + điểm % (0–100, đã làm tròn như scoreExam).
export interface PlacementRound {
  levelId: CefrId
  pct: number
}

// Kết quả cuối: cấp CEFR đề xuất bắt đầu học + trình độ app tương ứng
// (dùng cho prompt AI Chat/Speaking — không tự mở khóa cấp lộ trình).
export interface PlacementResult {
  cefr: CefrId
  appLevel: Level
}

export type PlacementStep =
  { done: false; nextLevel: CefrId } | { done: true; result: PlacementResult }

// Ánh xạ CEFR → 3 mức trình độ app đang dùng (types.ts Level).
export function cefrToAppLevel(id: CefrId): Level {
  if (id === 'A1' || id === 'A2') return 'beginner'
  if (id === 'B1' || id === 'B2') return 'intermediate'
  return 'advanced'
}

const idx = (id: CefrId): number => CEFR_ORDER.indexOf(id)

// Kẹp pct về [0,100] — phòng dữ liệu lưu trữ hỏng, không tin đầu vào mù quáng.
const clampPct = (pct: number): number => Math.max(0, Math.min(100, pct))

const isMastered = (r: PlacementRound): boolean => clampPct(r.pct) >= PLACEMENT_UP_PCT
const isFailed = (r: PlacementRound): boolean => clampPct(r.pct) <= PLACEMENT_DOWN_PCT

// Kết luận từ toàn bộ lịch sử: cấp THẤP NHẤT chưa vững; tất cả đều vững →
// cấp trên cấp vững cao nhất (kẹp C2); (phòng hờ) không có vòng nào → A2.
function finalize(history: PlacementRound[]): PlacementResult {
  const notMastered = history.filter((r) => !isMastered(r))
  let cefr: CefrId
  if (notMastered.length > 0) {
    cefr = notMastered.reduce((lo, r) => (idx(r.levelId) < idx(lo.levelId) ? r : lo)).levelId
  } else if (history.length > 0) {
    const highest = history.reduce((hi, r) => (idx(r.levelId) > idx(hi.levelId) ? r : hi))
    cefr = CEFR_ORDER[Math.min(idx(highest.levelId) + 1, CEFR_ORDER.length - 1)] as CefrId
  } else {
    cefr = PLACEMENT_START
  }
  return { cefr, appLevel: cefrToAppLevel(cefr) }
}

// Bước kế tiếp của bài test, suy ra THUẦN TÚY từ lịch sử các vòng đã thi.
export function nextPlacementStep(history: PlacementRound[]): PlacementStep {
  if (history.length === 0) return { done: false, nextLevel: PLACEMENT_START }

  const last = history[history.length - 1] as PlacementRound

  // Điểm "ở giữa" → cấp hiện tại là chỗ nên bắt đầu, dừng ngay.
  if (!isMastered(last) && !isFailed(last)) {
    return { done: true, result: { cefr: last.levelId, appLevel: cefrToAppLevel(last.levelId) } }
  }

  // Đủ số vòng tối đa → kết luận từ những gì đã có.
  if (history.length >= PLACEMENT_MAX_ROUNDS) {
    return { done: true, result: finalize(history) }
  }

  const cur = idx(last.levelId)
  const tested = new Set(history.map((r) => r.levelId))

  if (isMastered(last)) {
    // Vững → lên 1 cấp (điểm gần tuyệt đối → nhảy 2), kẹp ở C2.
    if (cur === CEFR_ORDER.length - 1) return { done: true, result: finalize(history) } // đã vững C2
    const step = clampPct(last.pct) >= PLACEMENT_JUMP_PCT ? 2 : 1
    const next = CEFR_ORDER[Math.min(cur + step, CEFR_ORDER.length - 1)] as CefrId
    // Quay lại cấp đã thi (dao động lên-xuống) → đã đủ thông tin, dừng.
    if (tested.has(next)) return { done: true, result: finalize(history) }
    return { done: false, nextLevel: next }
  }

  // Chưa vững rõ ràng → xuống 1 cấp, chạm đáy A1 thì dừng.
  if (cur === 0) return { done: true, result: finalize(history) }
  const next = CEFR_ORDER[cur - 1] as CefrId
  if (tested.has(next)) return { done: true, result: finalize(history) }
  return { done: false, nextLevel: next }
}

// Đủ điều kiện làm lại chưa? (lastAt = ISO của lần thi trước; null = chưa thi bao giờ)
export function canRetakePlacement(lastAt: string | null, now: Date = new Date()): boolean {
  if (!lastAt) return true
  const last = Date.parse(lastAt)
  if (Number.isNaN(last)) return true // dữ liệu hỏng → không khóa người dùng oan
  const days = (now.getTime() - last) / 86_400_000
  return days >= PLACEMENT_RETRY_DAYS
}
