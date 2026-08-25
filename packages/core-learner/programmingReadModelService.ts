// programmingReadModelService — Tóm tắt tiến độ môn LẬP TRÌNH cho Companion (PR-L5).
//
// VÌ SAO CẦN: Companion đang chỉ thấy trạng thái môn tiếng Anh (learningReadModelService) nên
// khi người học vừa vật lộn với bài `if` xong mà hỏi "học tiếp gì", nó không biết môn Lập trình
// tồn tại. Đây là bản tóm tắt NHỎ NHẤT đủ để Companion nói đúng chỗ đang đứng — cố ý KHÔNG
// nhồi vào `LearningReadModel` (khuôn đó là hình dạng của môn ngôn ngữ: CEFR, chiều học,
// số từ/ngày — nhét bậc P1–P6 vào sẽ làm hỏng hợp đồng dùng chung của 4 nơi khác).
import type { Pool } from 'pg'

export interface ProgrammingProgressSummary {
  /** Bậc đang học (p1..p6) — mặc định 'p1' khi học viên chưa chạm vào môn. */
  currentLevel: string
  /** Số bài học đã hoàn thành. */
  completedLessons: number
  /** Số bài đang học dở. */
  inProgressLessons: number
  /** Chưa chạm vào môn lần nào — nơi gọi dùng để BỎ QUA, không nhồi ngữ cảnh rỗng. */
  untouched: boolean
}

interface CountRow {
  status: string
  n: string
}

/** Đọc tóm tắt tiến độ môn Lập trình. Lỗi hạ tầng → coi như chưa chạm (Companion vẫn chạy). */
export async function getProgrammingProgressSummary(
  pool: Pool,
  userId: string,
): Promise<ProgrammingProgressSummary> {
  const empty: ProgrammingProgressSummary = {
    currentLevel: 'p1',
    completedLessons: 0,
    inProgressLessons: 0,
    untouched: true,
  }
  try {
    const [stateRes, countRes] = await Promise.all([
      pool.query<{ current_level: string }>(
        'select current_level from programming.learner_state where user_id = $1',
        [userId],
      ),
      pool.query<CountRow>(
        `select status, count(*)::text as n from programming.lesson_progress
         where user_id = $1 group by status`,
        [userId],
      ),
    ])
    const state = stateRes.rows[0]
    if (!state && countRes.rows.length === 0) return empty

    const byStatus = new Map(countRes.rows.map((r) => [r.status, Number(r.n)]))
    return {
      currentLevel: state?.current_level ?? 'p1',
      completedLessons: byStatus.get('completed') ?? 0,
      inProgressLessons: byStatus.get('in_progress') ?? 0,
      untouched: false,
    }
  } catch {
    return empty
  }
}

/**
 * Một dòng ngữ cảnh cho Companion. Trả chuỗi RỖNG khi học viên chưa chạm vào môn — thêm dòng
 * "0 bài" chỉ tốn token và khiến Companion rủ học môn mà người ta chưa hề mở.
 */
export function formatProgrammingProgressForContext(s: ProgrammingProgressSummary): string {
  if (s.untouched) return ''
  const parts = [
    `[Domain: Learning | Subject: programming]`,
    `Bậc: ${s.currentLevel.toUpperCase()}`,
    `Bài đã xong: ${s.completedLessons}`,
  ]
  if (s.inProgressLessons > 0) parts.push(`Đang học dở: ${s.inProgressLessons}`)
  return parts.join(' | ')
}
