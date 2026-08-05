// progressSync.ts — Đồng bộ TIẾN ĐỘ HỌC lên Supabase để không mất khi đổi máy.
//
// Trước đây từ đã thuộc (et_learned_*), từ khó (et_hard_*) và lịch ôn SRS (srs_*)
// CHỈ nằm trong localStorage → đổi điện thoại/xoá cache là mất sạch, mất động lực.
// Module này đẩy/kéo các dữ liệu đó qua bảng `learning_progress` (RLS theo user).
// Từ migration 0007 đồng bộ thêm tiến độ lộ trình CEFR: bài ngữ pháp đã học xong
// (et_cefr_grammar_*) + hội thoại đã xem (et_cefr_dialogue_*) — xem lib/cefrProgress.ts.
//
// localStorage vẫn là bộ đệm đọc nhanh + chạy offline. Khi kéo về, ta HỢP NHẤT
// (không ghi đè mất dữ liệu): learned/hard/cefr_* lấy hợp (union), SRS giữ thẻ tiến bộ hơn.
//
// NGUY CƠ MẤT DỮ LIỆU ĐÃ SỬA (điều tra "mất dữ liệu học tập admin"): pushProgress() đọc
// TOÀN BỘ localStorage rồi gửi đè lên server — nếu máy/tab này VỪA mở app (localStorage
// còn rỗng/cũ) và người dùng bấm học 1 từ NGAY trước khi pullProgress() (chạy lúc mở app,
// xem lib/useCloudSync.ts) kéo + hợp nhất xong, pushProgress() sẽ gửi lên bản RỖNG/CŨ —
// server nhận được ghi vào, xoá mất dữ liệu thật đã lưu trước đó. Sửa bằng cách bắt MỌI
// lượt gọi pushProgress() CHỜ lượt pullProgress() đang chạy (nếu có) xong trước khi đọc
// localStorage để gửi — khi đó localStorage đã chắc chắn là bản đã hợp nhất đầy đủ.

import { getAuthHeader } from '@core/authHeader'

const LEARNED = (uid: string) => `et_learned_${uid}`
const HARD = (uid: string) => `et_hard_${uid}`
const SRS = (uid: string) => `srs_${uid}`
// PHẢI khớp key trong lib/cefrProgress.ts (GRAMMAR_KEY/DIALOGUE_KEY/UNLOCKED_KEY).
const CEFR_GRAMMAR = (uid: string) => `et_cefr_grammar_${uid}`
const CEFR_DIALOGUE = (uid: string) => `et_cefr_dialogue_${uid}`
const CEFR_UNLOCKED = (uid: string) => `et_cefr_unlocked_${uid}`
// Kết quả bài thi cuối cấp (map levelId → {passed,bestPct,attempts,lastAt}) —
// migration 0009. Khớp key trong lib/cefrExam.ts (EXAM_KEY).
const CEFR_EXAMS = (uid: string) => `et_cefr_exams_${uid}`
// Kết quả bài test xếp lớp gần nhất ({cefr,appLevel,lastAt}) — migration 0011.
// Khớp key trong lib/placementResult.ts (KEY).
const PLACEMENT = (uid: string) => `et_placement_${uid}`
// Mục tiêu tuần ({goal,updatedAt}) — migration 0012. Khớp key lib/weeklyGoal.ts (KEY).
const WEEKLY_GOAL = (uid: string) => `et_weekly_goal_${uid}`
// Huy hiệu đã đạt (mảng id) — migration 0013. Khớp key lib/achievements.ts (KEY).
const ACHIEVEMENTS = (uid: string) => `et_achievements_${uid}`

// Cấu trúc 1 thẻ SRS (khớp src/lib/srs.ts) — chỉ cần để merge theo số lần ôn (reps).
interface SRSLike {
  interval: number
  ease: number
  due: number
  reps: number
}

// Cấu trúc 1 kết quả thi cuối cấp (khớp src/lib/cefrExam.ts ExamResult).
interface ExamResultLike {
  passed: boolean
  bestPct: number
  attempts: number
  lastAt: string
}

// Cấu trúc kết quả placement (khớp src/lib/placementResult.ts PlacementSaved).
interface PlacementLike {
  cefr: string
  appLevel: string
  lastAt: string
}

function readPlacement(key: string): PlacementLike | null {
  try {
    const r = localStorage.getItem(key)
    if (!r) return null
    const obj = JSON.parse(r) as unknown
    if (obj && typeof obj === 'object' && 'lastAt' in obj) return obj as PlacementLike
    return null
  } catch {
    return null
  }
}

// Hợp nhất: giữ bản có lastAt MỚI HƠN (placement là "chụp trình độ tại thời điểm
// thi", không có khái niệm tốt/xấu như điểm thi cuối cấp).
function mergePlacement(
  local: PlacementLike | null,
  cloud: PlacementLike | null,
): PlacementLike | null {
  if (!local) return cloud
  if (!cloud) return local
  return (local.lastAt ?? '') >= (cloud.lastAt ?? '') ? local : cloud
}

// Cấu trúc mục tiêu tuần (khớp src/lib/weeklyGoal.ts WeeklyGoalSaved).
interface WeeklyGoalLike {
  goal: number
  updatedAt: string
}

function readWeeklyGoal(key: string): WeeklyGoalLike | null {
  try {
    const r = localStorage.getItem(key)
    if (!r) return null
    const obj = JSON.parse(r) as unknown
    if (obj && typeof obj === 'object' && 'updatedAt' in obj) return obj as WeeklyGoalLike
    return null
  } catch {
    return null
  }
}

// Hợp nhất: bản có updatedAt MỚI HƠN thắng (đây là lựa chọn cài đặt của người
// dùng — không có khái niệm "tốt lên", giống placement).
function mergeWeeklyGoal(
  local: WeeklyGoalLike | null,
  cloud: WeeklyGoalLike | null,
): WeeklyGoalLike | null {
  if (!local) return cloud
  if (!cloud) return local
  return (local.updatedAt ?? '') >= (cloud.updatedAt ?? '') ? local : cloud
}

function readExamMap(key: string): Record<string, ExamResultLike> {
  try {
    const r = localStorage.getItem(key)
    const obj = r ? (JSON.parse(r) as unknown) : {}
    return obj && typeof obj === 'object' ? (obj as Record<string, ExamResultLike>) : {}
  } catch {
    return {}
  }
}

// Hợp nhất kết quả thi 2 nguồn: dữ liệu chỉ "tốt lên" — passed = OR, bestPct =
// max, attempts = max, lastAt = mới hơn.
function mergeExamMaps(
  a: Record<string, ExamResultLike>,
  b: Record<string, ExamResultLike>,
): Record<string, ExamResultLike> {
  const out: Record<string, ExamResultLike> = {}
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[key]
    const y = b[key]
    if (!x) {
      if (y) out[key] = y
      continue
    }
    if (!y) {
      out[key] = x
      continue
    }
    out[key] = {
      passed: x.passed || y.passed,
      bestPct: Math.max(x.bestPct ?? 0, y.bestPct ?? 0),
      attempts: Math.max(x.attempts ?? 0, y.attempts ?? 0),
      lastAt: (x.lastAt ?? '') >= (y.lastAt ?? '') ? x.lastAt : y.lastAt,
    }
  }
  return out
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

// Đọc localStorage HIỆN TẠI rồi gửi thẳng lên server — KHÔNG chờ pull nào cả. Chỉ tự gọi
// nội bộ từ pullProgress() (sau khi đã ghi bản hợp nhất xuống localStorage) để tránh vòng chờ
import { getPendingOfflineReviews, clearPendingOfflineReviews } from './offlineSrsStore'

// chính nó. Nơi khác dùng pushProgress()/pushProgressAsync() ở dưới (có chờ chống mất dữ liệu).
async function sendProgressSnapshot(userId: string): Promise<void> {
  try {
    const resp = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({
        learned: readArr(LEARNED(userId)),
        hard: readArr(HARD(userId)),
        srs: readObj(SRS(userId)),
        cefrGrammar: readArr(CEFR_GRAMMAR(userId)),
        cefrDialogues: readArr(CEFR_DIALOGUE(userId)),
        cefrUnlocked: readArr(CEFR_UNLOCKED(userId)),
        cefrExams: readExamMap(CEFR_EXAMS(userId)),
        placement: readPlacement(PLACEMENT(userId)) ?? {},
        weeklyGoal: readWeeklyGoal(WEEKLY_GOAL(userId)) ?? {},
        achievements: readArr(ACHIEVEMENTS(userId)),
      }),
    })
    if (!resp.ok) {
      console.warn('[progress] đẩy tiến độ lỗi: HTTP', resp.status)
    } else {
      // Đẩy thành công → xoá hàng chờ review offline
      void getPendingOfflineReviews(userId).then((pending) => {
        const ids = pending.map((p) => p.id!).filter(Boolean)
        if (ids.length > 0) void clearPendingOfflineReviews(userId, ids)
      })
    }
  } catch (err) {
    console.warn('[progress] đẩy tiến độ lỗi:', err)
  }
}

// Lượt pullProgress() ĐANG CHẠY cho từng user (nếu có) — pushProgressAsync() phải chờ lượt
// này xong rồi mới đọc localStorage để gửi, tránh gửi bản CŨ/RỖNG đè lên dữ liệu thật vừa
// kéo về (xem giải thích đầu file). Dùng Map thay biến đơn vì nhiều user/tab có thể đồng
// thời đăng nhập (hiếm nhưng an toàn hơn không đáng gì thêm phức tạp).
const pullInFlight = new Map<string, Promise<void>>()

// Bản CÓ THỂ AWAIT — dùng khi nơi gọi cần chắc chắn server đã nhận dữ liệu mới TRƯỚC khi làm
// bước tiếp theo (vd claim nhiệm vụ "thi đạt cấp CEFR", server tự đọc lại DB để xác minh, xem
// src/components/CefrExam.tsx). pushProgress() (bên dưới) vẫn giữ dạng bắn-rồi-quên cho mọi
// nơi gọi khác không cần chờ.
export async function pushProgressAsync(userId: string): Promise<void> {
  if (!userId) return
  const pulling = pullInFlight.get(userId)
  if (pulling) await pulling.catch(() => undefined)
  await sendProgressSnapshot(userId)
}

// Đẩy toàn bộ tiến độ hiện tại lên server (bắn rồi quên — không chặn giao diện).
// Giai đoạn C: gọi POST /api/progress thay Supabase client trực tiếp (không còn RLS
// bảo vệ sau khi cutover khỏi Supabase Auth ở Giai đoạn B).
export function pushProgress(userId: string): void {
  void pushProgressAsync(userId)
}

// Kéo tiến độ từ server → HỢP NHẤT với bản local → ghi lại localStorage → đẩy bản
// hợp nhất lên (để mọi máy hội tụ). Lỗi mạng bị nuốt — vẫn dùng bản local.
//
// Đăng ký vào pullInFlight NGAY KHI BẮT ĐẦU (trước khi await gì) để pushProgressAsync() gọi
// đồng thời (do người dùng bấm học 1 từ ngay lúc app vừa mở) THẤY được lượt pull này và chờ
// đúng lúc, không đọc localStorage khi nó còn rỗng/cũ.
export function pullProgress(userId: string): Promise<void> {
  if (!userId) return Promise.resolve()
  const existing = pullInFlight.get(userId)
  if (existing) return existing
  const p = doPull(userId).finally(() => {
    pullInFlight.delete(userId)
  })
  pullInFlight.set(userId, p)
  return p
}

async function doPull(userId: string): Promise<void> {
  let data: unknown
  try {
    const resp = await fetch('/api/progress', { headers: getAuthHeader() })
    if (!resp.ok) return
    data = await resp.json()
  } catch {
    return
  }
  if (!data) return

  const cloud = data as {
    learned?: string[]
    hard?: string[]
    srs?: Record<string, SRSLike>
    cefrGrammar?: string[]
    cefrDialogues?: string[]
    cefrUnlocked?: string[]
    cefrExams?: Record<string, ExamResultLike>
    placement?: PlacementLike
    weeklyGoal?: WeeklyGoalLike
    achievements?: string[]
  }

  // learned/hard/cefr_*: dữ liệu chỉ tăng dần → lấy hợp của local và cloud
  const learned = new Set<string>([...readArr(LEARNED(userId)), ...(cloud.learned ?? [])])
  const hard = new Set<string>([...readArr(HARD(userId)), ...(cloud.hard ?? [])])
  const cefrGrammar = new Set<string>([
    ...readArr(CEFR_GRAMMAR(userId)),
    ...(cloud.cefrGrammar ?? []),
  ])
  const cefrDialogues = new Set<string>([
    ...readArr(CEFR_DIALOGUE(userId)),
    ...(cloud.cefrDialogues ?? []),
  ])
  const cefrUnlocked = new Set<string>([
    ...readArr(CEFR_UNLOCKED(userId)),
    ...(cloud.cefrUnlocked ?? []),
  ])
  const achievements = new Set<string>([
    ...readArr(ACHIEVEMENTS(userId)),
    ...(cloud.achievements ?? []),
  ])

  // cefr_exams: hợp nhất theo cấp, giữ kết quả "tốt hơn" (xem mergeExamMaps).
  const cefrExams = mergeExamMaps(readExamMap(CEFR_EXAMS(userId)), cloud.cefrExams ?? {})

  // placement: hợp nhất theo lastAt mới hơn (cloud.placement rỗng '{}' khi chưa
  // từng thi → không có lastAt → coi như null).
  const cloudPlacement = cloud.placement && 'lastAt' in cloud.placement ? cloud.placement : null
  const placement = mergePlacement(readPlacement(PLACEMENT(userId)), cloudPlacement)

  // weekly_goal: hợp nhất theo updatedAt mới hơn (cloud rỗng '{}' khi chưa từng
  // chỉnh → không có updatedAt → coi như null).
  const cloudWeeklyGoal =
    cloud.weeklyGoal && 'updatedAt' in cloud.weeklyGoal ? cloud.weeklyGoal : null
  const weeklyGoal = mergeWeeklyGoal(readWeeklyGoal(WEEKLY_GOAL(userId)), cloudWeeklyGoal)

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
    localStorage.setItem(CEFR_GRAMMAR(userId), JSON.stringify([...cefrGrammar]))
    localStorage.setItem(CEFR_DIALOGUE(userId), JSON.stringify([...cefrDialogues]))
    localStorage.setItem(CEFR_UNLOCKED(userId), JSON.stringify([...cefrUnlocked]))
    localStorage.setItem(CEFR_EXAMS(userId), JSON.stringify(cefrExams))
    localStorage.setItem(ACHIEVEMENTS(userId), JSON.stringify([...achievements]))
    if (placement) localStorage.setItem(PLACEMENT(userId), JSON.stringify(placement))
    if (weeklyGoal) localStorage.setItem(WEEKLY_GOAL(userId), JSON.stringify(weeklyGoal))
  } catch {
    /* hết dung lượng — bỏ qua */
  }

  void sendProgressSnapshot(userId) // đẩy bản hợp nhất để cloud cập nhật (không qua guard —
  // guard là để CHỜ pull này, tự chờ chính mình sẽ treo mãi)
}
