// progressMerge.ts — Hợp nhất tiến độ học ĐANG CÓ trên server với dữ liệu client gửi lên,
// CHỈ cho các trường không có thao tác "bỏ đánh dấu" thật (srs, cefrExams, placement,
// weeklyGoal) — an toàn tuyệt đối để hợp nhất kiểu "chỉ tốt lên" vì không hành động nào của
// người dùng làm chúng nhỏ lại. Đây là lớp phòng thủ ở server (nguồn sự thật) cho đúng các
// trường này, phòng khi một thiết bị/tab gửi lên dữ liệu CŨ trước khi kịp kéo (pull) dữ liệu
// thật về (mất mạng, 2 tab cùng mở).
//
// Các MẢNG có thao tác bỏ đánh dấu thật (learned/hard/cefrGrammar/cefrDialogues/
// cefrUnlocked/achievements — unmarkLearned, toggleDifficult tắt, unmarkGrammarDone, xem
// lib/vocab.ts + lib/cefrProgress.ts) KHÔNG hợp nhất ở đây: hợp (union) sẽ làm việc bỏ đánh
// dấu không bao giờ có hiệu lực. Race cho các mảng này được chặn ở phía CLIENT
// (apps/english/src/lib/progressSync.ts: pushProgress luôn chờ pullProgress đang chạy xong
// trước khi đọc localStorage để gửi đi) — xem điều tra "mất dữ liệu học tập admin".

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
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
