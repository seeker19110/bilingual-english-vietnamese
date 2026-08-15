// progressMerge.ts — Hợp nhất tiến độ học ĐANG CÓ trên server với dữ liệu client gửi lên.
// Đây là lớp phòng thủ ở server (nguồn sự thật): dù client có gửi lên bản CŨ/thiếu (mất mạng,
// 2 tab/2 THIẾT BỊ cùng học song song rồi đồng bộ gần như đồng thời), tiến độ đã lưu KHÔNG
// BAO GIỜ bị mất — chỉ có thể tăng thêm.
//
// Quyết định 2026-08-13 (yêu cầu người dùng: tiến độ chỉ tăng, không giảm dù đổi máy/nhiều
// thiết bị): learned/cefrGrammar/cefrDialogues/cefrUnlocked/achievements ĐỔI SANG hợp nhất
// UNION (mergeArrayUnion) ở server thay vì ghi đè theo client. Đánh đổi đã xác nhận với
// người dùng: các thao tác "bỏ đánh dấu" (unmarkLearned — hiện KHÔNG có nút bấm nào trong UI
// gọi tới, chỉ còn trong test; unmarkGrammarDone — CÓ dùng ở CefrLessonViews.tsx) sẽ không còn
// tác dụng LÂU DÀI: máy khác đồng bộ lại (còn giữ bản "đã đánh dấu" cũ) sẽ tự thêm lại mục vừa
// bỏ. Riêng `hard` (nhãn từ khó) GIỮ NGUYÊN ghi đè — đây chỉ là lọc hiển thị, không phải tiến
// độ học, có thể bật/tắt tự do theo máy gửi cuối.

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Hợp (union) 2 mảng chuỗi — dùng cho các mảng "chỉ tăng": không phần tử nào bị mất. */
export function mergeArrayUnion(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])]
}

/** SRS: giữ thẻ có số lần ôn (reps) cao hơn — coi là tiến bộ hơn. */
export function mergeSrsMap(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...a }
  for (const [key, bVal] of Object.entries(b)) {
    const aVal = out[key]
    const aReps = isRecord(aVal) && typeof aVal.reps === 'number' ? aVal.reps : -1
    const bReps = isRecord(bVal) && typeof bVal.reps === 'number' ? bVal.reps : -1
    if (!(key in out) || bReps >= aReps) out[key] = bVal
  }
  return out
}

/** cefrExams: hợp nhất theo cấp — passed=OR, bestPct/attempts=max, lastAt=mới hơn. */
export function mergeExamMap(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = isRecord(a[key]) ? a[key] : undefined
    const y = isRecord(b[key]) ? b[key] : undefined
    if (!x) {
      if (y) out[key] = y
      continue
    }
    if (!y) {
      out[key] = x
      continue
    }
    const xLastAt = typeof x.lastAt === 'string' ? x.lastAt : ''
    const yLastAt = typeof y.lastAt === 'string' ? y.lastAt : ''
    out[key] = {
      passed: Boolean(x.passed) || Boolean(y.passed),
      bestPct: Math.max(Number(x.bestPct ?? 0), Number(y.bestPct ?? 0)),
      attempts: Math.max(Number(x.attempts ?? 0), Number(y.attempts ?? 0)),
      lastAt: xLastAt >= yLastAt ? xLastAt : yLastAt,
    }
  }
  return out
}

/**
 * placement/weeklyGoal: object "chụp trạng thái tại một mốc thời gian" (field `lastAt` hoặc
 * `updatedAt`) — giữ bản có mốc MỚI HƠN. Rỗng `{}` (chưa từng có) luôn thua bản đã có dữ liệu.
 */
export function mergeByTimestamp(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  field: 'lastAt' | 'updatedAt',
): Record<string, unknown> {
  const aVal = a[field]
  const bVal = b[field]
  const aHas = typeof aVal === 'string' && aVal !== ''
  const bHas = typeof bVal === 'string' && bVal !== ''
  if (!aHas) return bHas ? b : a
  if (!bHas) return a
  return (aVal as string) >= (bVal as string) ? a : b
}
