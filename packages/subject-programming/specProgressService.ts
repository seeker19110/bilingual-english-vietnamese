// specProgressService — Đọc/ghi TIẾN ĐỘ HƯỚNG CHUYÊN SÂU môn Lập trình (bảng của migration 0071).
//
// Vì sao service nằm trong gói MÔN chứ không ở core-learner: mọi phép ghi ở đây đều phải đối
// chiếu với dữ liệu giáo trình của môn (`specializations/registry.ts`) — id hướng/chặng lạ phải
// bị TỪ CHỐI chứ không ghi rác xuống DB. Đặt ở core-learner thì gói lõi dùng chung phải phụ
// thuộc ngược vào một môn cụ thể.
//
// Bất biến giữ ở đây (và được canh bằng test):
//  · MỌI hàm nhận `userId` đã xác thực từ handler và LUÔN kèm `user_id = $1` trong mệnh đề
//    where — không có đường nào đọc/ghi tiến độ của người khác.
//  · Ghi hai lần cùng một thứ KHÔNG tạo hai dòng (upsert theo khoá chính).
//  · `completed` là trạng thái CHỐT: học lại chặng không kéo lùi về `in_progress` — cùng luật
//    với programming.lesson_progress.
//  · Vai trò (`primary`/`cross`) do SERVER suy ra từ cờ `crossCutting` của hướng, không nhận
//    từ client: client không được tự phong một hướng nền thành hướng chính.
import type { Pool, PoolClient } from 'pg'
import { withTransaction } from '@dhcb/core-db/transaction'
import { getSpecialization, getSpecStage } from './specializations/registry.js'

export type SpecEnrollmentRole = 'primary' | 'cross'
export type SpecStageStatus = 'in_progress' | 'completed'

export interface SpecEnrollment {
  specId: string
  role: SpecEnrollmentRole
  startedAt: number
}

export interface SpecStageProgress {
  specId: string
  stageId: string
  status: SpecStageStatus
  completedAt: number | null
}

export interface SpecProgressSnapshot {
  /** Hướng SẢN PHẨM chính đang theo — null khi học viên chưa chọn hướng nào. */
  primarySpecId: string | null
  /** Các hướng NỀN cắt ngang đang học song song (kiến trúc, thuật toán). */
  crossSpecIds: string[]
  enrollments: SpecEnrollment[]
  stages: SpecStageProgress[]
}

/** Lỗi nghiệp vụ trả về cho handler (handler đổi thành 400 + thông điệp tiếng Việt). */
export interface SpecProgressError {
  ok: false
  error: string
}
type Ok = { ok: true }
export type SpecProgressResult = Ok | SpecProgressError

interface EnrollRow {
  spec_id: string
  role: SpecEnrollmentRole
  started_at: Date
}
interface StageRow {
  spec_id: string
  stage_id: string
  status: SpecStageStatus
  completed_at: Date | null
}

/** Chuẩn hoá id do client gửi: cắt khoảng trắng + hạ chữ thường (giống getSpecialization). */
function normalizeId(id: string): string {
  return id.trim().toLowerCase()
}

/** Đọc toàn bộ tiến độ hướng của MỘT người dùng. Không có dòng nào → snapshot rỗng hợp lệ. */
export async function getSpecProgress(pool: Pool, userId: string): Promise<SpecProgressSnapshot> {
  const [enrollRes, stageRes] = await Promise.all([
    pool.query<EnrollRow>(
      `select spec_id, role, started_at from programming.spec_enrollment
       where user_id = $1 order by started_at asc`,
      [userId],
    ),
    pool.query<StageRow>(
      `select spec_id, stage_id, status, completed_at from programming.spec_stage_progress
       where user_id = $1 order by stage_id asc`,
      [userId],
    ),
  ])

  const enrollments: SpecEnrollment[] = enrollRes.rows.map((r) => ({
    specId: r.spec_id,
    role: r.role,
    startedAt: r.started_at.getTime(),
  }))

  return {
    primarySpecId: enrollments.find((e) => e.role === 'primary')?.specId ?? null,
    crossSpecIds: enrollments.filter((e) => e.role === 'cross').map((e) => e.specId),
    enrollments,
    stages: stageRes.rows.map((r) => ({
      specId: r.spec_id,
      stageId: r.stage_id,
      status: r.status,
      completedAt: r.completed_at ? r.completed_at.getTime() : null,
    })),
  }
}

/**
 * Chọn một hướng để theo. Hướng sản phẩm ⇒ vai trò `primary` và THAY hướng chính cũ (luật sản
 * phẩm: đi MỘT hướng chính); hướng nền (`crossCutting`) ⇒ vai trò `cross`, cộng thêm chứ không
 * thay gì cả.
 *
 * Đổi hướng chính KHÔNG xoá tiến độ chặng của hướng cũ — quay lại là thấy nguyên (và trang
 * danh sách đã hứa với người học đúng như vậy).
 */
export async function enrollSpecialization(
  pool: Pool,
  userId: string,
  rawSpecId: string,
): Promise<SpecProgressResult> {
  const specId = normalizeId(rawSpecId)
  const spec = getSpecialization(specId)
  if (!spec) return { ok: false, error: `Hướng "${rawSpecId}" không tồn tại` }

  const role: SpecEnrollmentRole = spec.crossCutting === true ? 'cross' : 'primary'

  await withTransaction(pool, async (client: PoolClient) => {
    if (role === 'primary') {
      // Bỏ hướng chính cũ TRƯỚC trong cùng transaction: chỉ mục duy nhất một phần
      // (spec_enrollment_one_primary) sẽ từ chối nếu làm ngược thứ tự.
      await client.query(
        `delete from programming.spec_enrollment
         where user_id = $1 and role = 'primary' and spec_id <> $2`,
        [userId, specId],
      )
    }
    await client.query(
      `insert into programming.spec_enrollment (user_id, spec_id, role, started_at, updated_at)
       values ($1, $2, $3, now(), now())
       on conflict (user_id, spec_id) do update
         set role = excluded.role, updated_at = now()`,
      [userId, specId, role],
    )
  })
  return { ok: true }
}

/** Bỏ theo một hướng. Tiến độ chặng GIỮ NGUYÊN — bỏ theo không phải là xoá công sức đã bỏ ra. */
export async function unenrollSpecialization(
  pool: Pool,
  userId: string,
  rawSpecId: string,
): Promise<SpecProgressResult> {
  const specId = normalizeId(rawSpecId)
  if (!getSpecialization(specId)) return { ok: false, error: `Hướng "${rawSpecId}" không tồn tại` }
  await pool.query('delete from programming.spec_enrollment where user_id = $1 and spec_id = $2', [
    userId,
    specId,
  ])
  return { ok: true }
}

/** Đánh dấu tiến độ một chặng ('web-s2'). Chặng lạ → từ chối, không ghi gì. */
export async function setSpecStageProgress(
  pool: Pool,
  userId: string,
  rawStageId: string,
  status: SpecStageStatus,
): Promise<SpecProgressResult> {
  const stageId = normalizeId(rawStageId)
  const stage = getSpecStage(stageId)
  if (!stage) return { ok: false, error: `Chặng "${rawStageId}" không tồn tại` }
  // stage_id luôn có dạng '<specId>-s<n>' (types.ts) nên cắt an toàn; getSpecStage đã xác nhận.
  const specId = stageId.slice(0, stageId.lastIndexOf('-'))

  await pool.query(
    `insert into programming.spec_stage_progress
       (user_id, spec_id, stage_id, status, completed_at, updated_at)
     values ($1, $2, $3, $4, case when $4 = 'completed' then now() end, now())
     on conflict (user_id, stage_id) do update
       set status = case when programming.spec_stage_progress.status = 'completed'
                         then 'completed' else excluded.status end,
           completed_at = coalesce(programming.spec_stage_progress.completed_at,
                                   excluded.completed_at),
           updated_at = now()`,
    [userId, specId, stageId, status],
  )
  return { ok: true }
}
