// packages/core-learner/learnerState.ts — LearnerStateService (Phase 03 "Learner OS",
// docs/phases/03-learner-os.md).
//
// ─── QUYẾT ĐỊNH KIẾN TRÚC: ADAPTER trên bảng CÓ SẴN, KHÔNG bảng mới ──────────────────────────
// Đặc tả gốc đòi bảng mới `learner_profiles`/`learner_goals`/`learner_preferences` + migrate dữ
// liệu thật. Trước khi viết migration, đọc lại `docs/adr/0002-quan-ly-nguoi-dung.md` thì phát
// hiện: kế hoạch đa lĩnh vực ĐÃ có `english.user_profile` (migration 0036) đóng đúng vai trò
// "learner profile" — nhưng bảng đó "NGỦ" (backfill 1 lần, code thật vẫn đọc/ghi 4 cột cũ trên
// `public.profiles`, sẽ LỆCH DẦN vì không dual-write). Tạo THÊM `learner_profiles` nữa sẽ là bảng
// "ngủ" thứ 2 cho cùng 1 khái niệm — đúng kiểu trùng lặp nguồn sự thật mà ADR-0002 đang cố tránh.
//
// Nên `LearnerStateService` ở đây là ADAPTER (đúng chữ trong Acceptance của Phase 03: "legacy
// callers can use an adapter") — đọc TRỰC TIẾP, LUÔN LÀ DỮ LIỆU MỚI NHẤT từ 2 bảng nguồn sự thật
// THẬT SỰ đang dùng hôm nay: `public.profiles` (onboarding: user_level/goal/daily_minutes,
// onboarded) và `english.learning_progress` (settings.direction, placement.cefr). KHÔNG migration,
// KHÔNG backfill, KHÔNG bảng mới — 0 rủi ro cho production, và không có vấn đề "lệch dần" vì
// không có bản sao nào để lệch.
//
// `skills`/`knowledge`/`errors`/`recentEvidence`/`risks` LUÔN rỗng — Phase 04 (Skill OS), 05
// (Knowledge OS), 06 (Evidence Engine), 07 (Error Memory), 09 (Diagnostic Engine) chưa xây. Giữ
// đúng KIỂU của Phase 02 (Skill[]/Knowledge[]/ErrorRecord[]/Evidence[]) để code viết ngay bây giờ
// gọi được `for (const s of state.skills)` an toàn, không phải sửa lại khi các phase đó xong.
//
// CHƯA có API endpoint gọi tới hàm này — đúng tinh thần ADR-0002 Bước 5 (không dựng hạ tầng cho
// tính năng UI chưa tồn tại, "vi phạm nguyên tắc không triển khai dở dang", CLAUDE.md mục 4).
// Wiring 1 endpoint thật là việc của phase/PR sau khi có UI cần tới.

import { getPgPool } from '@dhcb/core-db/pgPool'
import {
  CefrLevelSchema,
  DirectionSchema,
  type ContractDirection,
  type ContractCefrLevel,
} from '@dhcb/core-contracts/shared'
import type { Skill } from '@dhcb/core-contracts/skill'
import type { Knowledge } from '@dhcb/core-contracts/knowledge'
import type { ErrorRecord } from '@dhcb/core-contracts/errorRecord'
import type { Evidence } from '@dhcb/core-contracts/evidence'

export interface LearnerGoal {
  label: string
  dailyMinutes: number
}

export interface LearnerState {
  userId: string
  direction: ContractDirection
  // null = học viên CHƯA làm bài test xếp lớp (placement) — khác Skill/Knowledge/... rỗng vì
  // luôn CÓ THỂ có giá trị thật (không phải "chưa xây engine"), chỉ là chưa làm bài test.
  currentLevel: ContractCefrLevel | null
  onboarded: boolean
  goal: LearnerGoal
  skills: Skill[]
  knowledge: Knowledge[]
  errors: ErrorRecord[]
  recentEvidence: Evidence[]
  risks: unknown[]
}

interface ProfileRow {
  onboarded: boolean
  goal: string | null
  daily_minutes: number | null
}

interface ProgressRow {
  settings: unknown
  placement: unknown
}

function parseDirection(settings: unknown): ContractDirection {
  if (settings && typeof settings === 'object' && 'direction' in settings) {
    const result = DirectionSchema.safeParse((settings as { direction?: unknown }).direction)
    if (result.success) return result.data
  }
  // Mặc định 'A' — khớp getDirection() ở apps/english/src/lib/storage.ts (chưa chọn = chiều A).
  return 'A'
}

function parseCurrentLevel(placement: unknown): LearnerState['currentLevel'] {
  if (placement && typeof placement === 'object' && 'cefr' in placement) {
    const result = CefrLevelSchema.safeParse((placement as { cefr?: unknown }).cefr)
    if (result.success) return result.data
  }
  return null
}

/**
 * Đọc trạng thái tổng hợp của 1 learner. `userId` PHẢI đã được xác thực bởi nơi gọi
 * (`validateAuth()` — hàm này KHÔNG tự kiểm quyền, không đọc token/session) — đúng quy ước hiện
 * có của mọi handler API trong dự án (CLAUDE.md mục 4.2: "mọi handler API tự kiểm user_id khớp
 * token qua validateAuth() trước khi query"). Truy vấn LUÔN lọc theo ĐÚNG `userId` truyền vào — 2
 * câu SQL bên dưới không có nhánh nào đọc dữ liệu của user khác (không cross-user leakage, đúng
 * Acceptance của Phase 03).
 *
 * Trả `null` nếu chưa có hồ sơ `profiles` (chưa từng đăng nhập/ensureProfileRow chưa chạy) —
 * KHÔNG NÊN xảy ra với user đã qua `validateAuth()` thành công (registration luôn tạo profile),
 * nhưng vẫn xử lý tường minh thay vì giả định.
 */
export async function getLearnerState(userId: string): Promise<LearnerState | null> {
  const pool = getPgPool()

  const profileResult = await pool.query<ProfileRow>(
    `select onboarded, goal, daily_minutes from public.profiles where id = $1`,
    [userId],
  )
  const profileRow = profileResult.rows[0]
  if (!profileRow) return null

  const progressResult = await pool.query<ProgressRow>(
    `select settings, placement from english.learning_progress where user_id = $1`,
    [userId],
  )
  const progressRow = progressResult.rows[0]

  return {
    userId,
    direction: parseDirection(progressRow?.settings),
    currentLevel: parseCurrentLevel(progressRow?.placement),
    onboarded: profileRow.onboarded,
    goal: {
      label: profileRow.goal ?? 'daily',
      dailyMinutes: profileRow.daily_minutes ?? 10,
    },
    skills: [],
    knowledge: [],
    errors: [],
    recentEvidence: [],
    risks: [],
  }
}
