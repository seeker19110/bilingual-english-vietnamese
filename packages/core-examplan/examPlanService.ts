// packages/core-examplan/examPlanService.ts — CRUD bản ghi kế hoạch ôn thi.
//
// Đặc tả: docs/research/dac-ta-che-do-on-thi-2026-08-26.md
//
// Ở ĐÂY KHÔNG CÓ LẬP LỊCH. Lịch (khối lượng hôm nay, giai đoạn, mức retention) được tính bằng
// `examPlan.ts` — hàm thuần, chạy Ở CLIENT vì dữ liệu từ vựng/CEFR nằm trong `apps/dhcb/src/data`
// và trạng thái SRS cũng ở client. Bảng `exam_plans` chỉ lưu Ý ĐỊNH của người học (thi gì, ngày
// nào, trần bao nhiêu, nghỉ ngày nào); lịch luôn được tính lại từ trạng thái học thật.
//
// Cùng khuôn `companionLinkService.ts`: nhận `pool` làm tham số đầu, quyền sở hữu kiểm bằng
// `user_id` NGAY TRONG câu SQL.

import type { Pool } from 'pg'
import { NotFoundError, ConflictError } from '@dhcb/core-errors/appError'
import {
  ExamPlanSchema,
  EXAM_PLAN_SCHEMA_VERSION,
  type CreateExamPlanInput,
  type ExamPlan,
} from '@dhcb/core-contracts/examPlan'

const DEFAULT_DAILY_CAP = 10

interface PlanRow {
  id: string
  user_id: string
  exam_kind: string
  exam_date: Date | string
  target_label: string | null
  scope_items: number
  daily_cap_items: number
  rest_days: number[] | null
  status: string
  created_at: Date
}

/** `date` được driver `pg` trả về dạng Date — cắt lấy phần ngày, KHÔNG qua toISOString của giờ
 *  địa phương (sẽ lệch một ngày khi tiến trình chạy ở múi giờ âm). */
function toDateStr(v: Date | string): string {
  if (typeof v === 'string') return v.slice(0, 10)
  const y = v.getFullYear()
  const m = String(v.getMonth() + 1).padStart(2, '0')
  const d = String(v.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toPlan(row: PlanRow): ExamPlan {
  return ExamPlanSchema.parse({
    id: row.id,
    userId: row.user_id,
    examKind: row.exam_kind,
    examDate: toDateStr(row.exam_date),
    ...(row.target_label ? { targetLabel: row.target_label } : {}),
    scopeItems: Number(row.scope_items),
    dailyCapItems: Number(row.daily_cap_items),
    restDays: row.rest_days ?? [],
    status: row.status,
    createdAt: row.created_at.toISOString(),
    schemaVersion: EXAM_PLAN_SCHEMA_VERSION,
  })
}

const COLUMNS = `id, user_id, exam_kind, exam_date, target_label, scope_items,
  daily_cap_items, rest_days, status, created_at`

/**
 * Kế hoạch đang chạy của người dùng. Ngày thi đã qua thì TỰ chuyển sang `expired` ngay lúc đọc —
 * không phụ thuộc job nền chạy đúng giờ (cùng nguyên tắc "hết hạn tính lúc đọc" của consent).
 */
export async function getActivePlan(
  pool: Pool,
  userId: string,
  today: string,
): Promise<ExamPlan | null> {
  const { rows } = await pool.query<PlanRow>(
    `select ${COLUMNS} from public.exam_plans where user_id = $1 and status = 'active'`,
    [userId],
  )
  const row = rows[0]
  if (!row) return null

  if (toDateStr(row.exam_date) < today) {
    await pool.query(
      `update public.exam_plans set status = 'expired', updated_at = now() where id = $1`,
      [row.id],
    )
    return null
  }
  return toPlan(row)
}

/**
 * Tạo kế hoạch mới. Một kế hoạch `active` mỗi người — DB đã chặn cứng bằng partial unique index,
 * ở đây bắt lỗi 23505 để trả 409 có nghĩa thay vì lỗi 500 khó hiểu.
 */
export async function createPlan(
  pool: Pool,
  userId: string,
  input: CreateExamPlanInput,
  today: string,
): Promise<ExamPlan> {
  if (input.examDate < today) throw new ConflictError('Ngày thi phải ở tương lai')

  try {
    const { rows } = await pool.query<PlanRow>(
      `insert into public.exam_plans
         (user_id, exam_kind, exam_date, target_label, scope_items, daily_cap_items, rest_days)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning ${COLUMNS}`,
      [
        userId,
        input.examKind,
        input.examDate,
        input.targetLabel ?? null,
        input.scopeItems,
        input.dailyCapItems ?? DEFAULT_DAILY_CAP,
        input.restDays ?? [],
      ],
    )
    return toPlan(rows[0]!)
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      throw new ConflictError('Bạn đang có một kế hoạch ôn thi — kết thúc kế hoạch cũ trước')
    }
    throw err
  }
}

/** Kết thúc kế hoạch (người học tự bỏ). Xoá mềm sang `archived` để còn xem lại được. */
export async function archivePlan(pool: Pool, userId: string, planId: string): Promise<void> {
  const { rowCount } = await pool.query(
    `update public.exam_plans set status = 'archived', updated_at = now()
     where id = $1 and user_id = $2 and status = 'active'`,
    [planId, userId],
  )
  if (rowCount === 0) throw new NotFoundError('Không tìm thấy kế hoạch đang chạy')
}
