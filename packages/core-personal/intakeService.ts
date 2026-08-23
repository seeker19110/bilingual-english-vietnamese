// packages/core-personal/intakeService.ts — Lớp HỒ SƠ ẨN của luồng người mới.
//
// Tên file nói đúng vai: đây là chỗ câu trả lời được CẤT, không phải chỗ chúng được đem ra khoe.
// Đặc tả (mục 2): lớp này KHÔNG có đường ra trực tiếp lên giao diện — mọi thứ hiện cho người dùng
// phải đi qua `intakeSuggestion.ts` và bộ lọc ngôn ngữ ở đó.

import type { Pool } from 'pg'
import { encryptUserField, decryptUserField } from '@dhcb/core-config/userDataCrypto'
import {
  IntakeAnswersSchema,
  type IntakeAnswers,
  type Focus,
  type LearningMomentum,
} from '@dhcb/core-contracts/intake'

interface IntakeRow {
  focus: string | null
  last_learned: string | null
  extra_hour_enc: string | null
  flow_activity_enc: string | null
  chosen_task_id: string | null
  completed_at: Date | null
}

export interface IntakeState {
  /** Đã trả lời xong 5 câu chưa (dù bỏ qua hết vẫn tính là xong). */
  done: boolean
  answers: IntakeAnswers
  chosenTaskId: string | null
}

/**
 * Mã hoá một câu trả lời tự do.
 *
 * Chuỗi rỗng/không có ⇒ lưu `null` chứ không mã hoá chuỗi rỗng: ở đây "bỏ qua câu này" là thông
 * tin bình thường, không phải bí mật cần giấu, và `null` giúp phân biệt rõ với "đã trả lời".
 */
async function encOptional(userId: string, value: string | undefined): Promise<string | null> {
  const trimmed = value?.trim()
  return trimmed ? encryptUserField(userId, trimmed) : null
}

async function decOptional(userId: string, stored: string | null): Promise<string | undefined> {
  return stored ? await decryptUserField(userId, stored) : undefined
}

/** Đọc trạng thái luồng người mới. Chưa từng trả lời ⇒ `done: false`, câu trả lời rỗng. */
export async function getIntakeState(pool: Pool, userId: string): Promise<IntakeState> {
  const { rows } = await pool.query<IntakeRow>(
    `select focus, last_learned, extra_hour_enc, flow_activity_enc, chosen_task_id, completed_at
       from personal.intake where user_id = $1`,
    [userId],
  )
  const row = rows[0]
  if (!row) return { done: false, answers: {}, chosenTaskId: null }

  return {
    done: row.completed_at != null,
    answers: {
      focus: (row.focus as Focus | null) ?? undefined,
      lastLearned: (row.last_learned as LearningMomentum | null) ?? undefined,
      extraHour: await decOptional(userId, row.extra_hour_enc),
      flowActivity: await decOptional(userId, row.flow_activity_enc),
    },
    chosenTaskId: row.chosen_task_id,
  }
}

/**
 * Lưu câu trả lời và đánh dấu đã xong.
 *
 * `ageGroup` KHÔNG lưu ở bảng này — nó đi thẳng vào `public.profiles.age_group` (nguồn sự thật duy
 * nhất của dữ liệu nền tảng, xem migration 0059). Trả về câu trả lời đã chuẩn hoá để nơi gọi sinh
 * gợi ý từ đúng thứ vừa lưu.
 */
export async function saveIntake(pool: Pool, userId: string, raw: unknown): Promise<IntakeAnswers> {
  const answers = IntakeAnswersSchema.parse(raw)
  await pool.query(
    `insert into personal.intake
       (user_id, focus, last_learned, extra_hour_enc, flow_activity_enc, completed_at, updated_at)
     values ($1, $2, $3, $4, $5, now(), now())
     on conflict (user_id) do update
       set focus = excluded.focus,
           last_learned = excluded.last_learned,
           extra_hour_enc = excluded.extra_hour_enc,
           flow_activity_enc = excluded.flow_activity_enc,
           completed_at = now(),
           updated_at = now()`,
    [
      userId,
      answers.focus ?? null,
      answers.lastLearned ?? null,
      await encOptional(userId, answers.extraHour),
      await encOptional(userId, answers.flowActivity),
    ],
  )
  return answers
}

/** Ghi lại việc người dùng CHỌN — để về sau đo được gợi ý có trúng không. */
export async function saveChosenTask(pool: Pool, userId: string, taskId: string): Promise<void> {
  await pool.query(
    'update personal.intake set chosen_task_id = $2, updated_at = now() where user_id = $1',
    [userId, taskId],
  )
}
