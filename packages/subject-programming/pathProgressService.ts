// pathProgressService — Đọc/ghi TIẾN ĐỘ LỘ TRÌNH MỤC TIÊU môn Lập trình (bảng migration 0073).
//
// Cùng khuôn với specProgressService.ts: mọi phép ghi đối chiếu với dữ liệu giáo trình
// (`learningPaths/registry.ts`) — id lộ trình/chặng lạ bị TỪ CHỐI chứ không ghi rác xuống DB.
//
// Bất biến giữ ở đây (canh bằng test):
//  · MỌI hàm nhận `userId` đã xác thực từ handler và LUÔN kèm `user_id = $1` trong where.
//  · Trạng thái "chỉ tốt lên": skipped → in_progress → completed, KHÔNG bao giờ kéo lùi —
//    cùng luật với programming.spec_stage_progress và english.learning_progress.
//  · Ghi hai lần cùng một thứ KHÔNG tạo hai dòng (upsert theo khoá chính).
import type { Pool } from 'pg'
import { getLearningPath, pathStageRefs } from './learningPaths/registry.js'

export type PathStageStatus = 'skipped' | 'in_progress' | 'completed'

export interface PathStageProgress {
  pathId: string
  stageId: string
  status: PathStageStatus
  updatedAt: number
}

export interface PathProgressResult {
  ok: true
}
export interface PathProgressError {
  ok: false
  error: string
}
export type PathProgressWriteResult = PathProgressResult | PathProgressError

interface Row {
  path_id: string
  stage_id: string
  status: PathStageStatus
  updated_at: Date
}

function normalizeId(id: string): string {
  return id.trim().toLowerCase()
}

/** Đọc toàn bộ tiến độ lộ trình của MỘT người dùng cho MỘT lộ trình. */
export async function getPathProgress(
  pool: Pool,
  userId: string,
  rawPathId: string,
): Promise<PathStageProgress[]> {
  const pathId = normalizeId(rawPathId)
  const res = await pool.query<Row>(
    `select path_id, stage_id, status, updated_at from programming.path_progress
     where user_id = $1 and path_id = $2 order by stage_id asc`,
    [userId, pathId],
  )
  return res.rows.map((r) => ({
    pathId: r.path_id,
    stageId: r.stage_id,
    status: r.status,
    updatedAt: r.updated_at.getTime(),
  }))
}

/**
 * Ghi tiến độ MỘT chặng của một lộ trình. Từ chối nếu lộ trình/chặng không tồn tại, hoặc chặng
 * đó không thuộc lộ trình này (chặn ghi rác qua id lạ nhưng đúng khuôn regex).
 *
 * "Chỉ tốt lên": nếu dòng đã có trạng thái hạng cao hơn trạng thái mới, GIỮ NGUYÊN — không lùi.
 */
export async function setPathStageProgress(
  pool: Pool,
  userId: string,
  rawPathId: string,
  rawStageId: string,
  status: PathStageStatus,
): Promise<PathProgressWriteResult> {
  const pathId = normalizeId(rawPathId)
  const stageId = normalizeId(rawStageId)

  const path = getLearningPath(pathId)
  if (!path) return { ok: false, error: `Lộ trình "${rawPathId}" không tồn tại` }
  const belongs = pathStageRefs(path).some((r) => r.stageId === stageId)
  if (!belongs) {
    return { ok: false, error: `Chặng "${rawStageId}" không thuộc lộ trình "${rawPathId}"` }
  }

  await pool.query(
    `insert into programming.path_progress (user_id, path_id, stage_id, status, updated_at)
     values ($1, $2, $3, $4, now())
     on conflict (user_id, path_id, stage_id) do update
       set status = case
             when array_position(array['skipped','in_progress','completed'],
                                  programming.path_progress.status)
                  >= array_position(array['skipped','in_progress','completed'], excluded.status)
             then programming.path_progress.status
             else excluded.status
           end,
           updated_at = now()`,
    [userId, pathId, stageId, status],
  )
  return { ok: true }
}

/** Ghi hàng loạt (dùng cho kết quả chẩn đoán: nhiều chặng 'skipped' + một chặng 'in_progress'). */
export async function setPathStageProgressBulk(
  pool: Pool,
  userId: string,
  rawPathId: string,
  stages: { stageId: string; status: PathStageStatus }[],
): Promise<PathProgressWriteResult> {
  for (const s of stages) {
    const result = await setPathStageProgress(pool, userId, rawPathId, s.stageId, s.status)
    if (!result.ok) return result
  }
  return { ok: true }
}
