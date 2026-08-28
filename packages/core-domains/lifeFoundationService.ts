// packages/core-life/lifeFoundationService.ts — Service cho Life Foundation Domain (V2-17).
// No generic mega Life Agent — each subdomain scoped separately.
import type { Pool } from 'pg'
import { randomUUID } from 'node:crypto'
import { withTransaction } from '@dhcb/core-db/transaction'
import { vnDateStr, addDays } from '@dhcb/core-db/date'
import { NotFoundError } from '@dhcb/core-errors/appError'
import {
  LifePlanSchema,
  HabitSchema,
  HabitLogSchema,
  WellbeingCheckSchema,
  GrowthMilestoneSchema,
  LIFE_FOUNDATION_SCHEMA_VERSION,
  type LifePlan,
  type Habit,
  type HabitLog,
  type WellbeingCheck,
  type GrowthMilestone,
  type LifePlanTypeSchema,
  type LifePlanStatusSchema,
  type HabitTypeSchema,
  type HabitFrequencySchema,
  type GrowthAreaSchema,
} from '@dhcb/core-contracts/lifeFoundation'
import type { z } from 'zod'

export type LifePlanType = z.infer<typeof LifePlanTypeSchema>
export type LifePlanStatus = z.infer<typeof LifePlanStatusSchema>
export type HabitType = z.infer<typeof HabitTypeSchema>
export type HabitFrequency = z.infer<typeof HabitFrequencySchema>
export type GrowthArea = z.infer<typeof GrowthAreaSchema>

interface PlanRow {
  id: string
  person_id: string
  title: string
  plan_type: string
  period_start: Date
  period_end: Date
  status: string
  version: number
  created_at: Date
  updated_at: Date
}

interface HabitRow {
  id: string
  person_id: string
  title: string
  habit_type: string
  frequency: string
  target_count: number
  current_streak: number
  best_streak: number
  last_logged_at: string | null
  is_active: boolean
  version: number
  created_at: Date
  updated_at: Date
}

interface HabitLogRow {
  id: string
  habit_id: string
  person_id: string
  logged_at: Date
  count: number
  note: string | null
  created_at: Date
}

interface WellbeingRow {
  id: string
  person_id: string
  mood_score: number
  energy_score: number
  stress_score: number
  notes: string | null
  checked_at: Date
}

interface GrowthRow {
  id: string
  person_id: string
  area: string
  title: string
  description: string | null
  achieved_at: Date | null
  created_at: Date
}

function toPlan(r: PlanRow): LifePlan {
  return LifePlanSchema.parse({
    id: r.id,
    personId: r.person_id,
    title: r.title,
    planType: r.plan_type,
    periodStart: r.period_start.toISOString().slice(0, 10),
    periodEnd: r.period_end.toISOString().slice(0, 10),
    status: r.status,
    version: r.version,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
    schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
  })
}

function toHabit(r: HabitRow): Habit {
  return HabitSchema.parse({
    id: r.id,
    personId: r.person_id,
    title: r.title,
    habitType: r.habit_type,
    frequency: r.frequency,
    targetCount: r.target_count,
    currentStreak: r.current_streak,
    bestStreak: r.best_streak,
    lastLoggedAt: r.last_logged_at ?? null,
    isActive: r.is_active,
    version: r.version,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
    schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
  })
}

function toHabitLog(r: HabitLogRow): HabitLog {
  return HabitLogSchema.parse({
    id: r.id,
    habitId: r.habit_id,
    personId: r.person_id,
    loggedAt: r.logged_at.toISOString().slice(0, 10),
    count: r.count,
    ...(r.note ? { note: r.note } : {}),
    createdAt: r.created_at.toISOString(),
    schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
  })
}

function toWellbeing(r: WellbeingRow): WellbeingCheck {
  return WellbeingCheckSchema.parse({
    id: r.id,
    personId: r.person_id,
    moodScore: r.mood_score,
    energyScore: r.energy_score,
    stressScore: r.stress_score,
    ...(r.notes ? { notes: r.notes } : {}),
    checkedAt: r.checked_at.toISOString(),
    schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
  })
}

function toGrowth(r: GrowthRow): GrowthMilestone {
  return GrowthMilestoneSchema.parse({
    id: r.id,
    personId: r.person_id,
    area: r.area,
    title: r.title,
    ...(r.description ? { description: r.description } : {}),
    ...(r.achieved_at ? { achievedAt: r.achieved_at.toISOString().slice(0, 10) } : {}),
    createdAt: r.created_at.toISOString(),
    schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
  })
}

// Plans
export async function createLifePlan(
  pool: Pool,
  personId: string,
  input: {
    title: string
    planType: LifePlanType
    periodStart: string
    periodEnd: string
  },
): Promise<LifePlan> {
  const id = randomUUID()
  const res = await pool.query<PlanRow>(
    `insert into worklife.plans (id, person_id, title, plan_type, period_start, period_end, status, version)
     values ($1, $2, $3, $4, $5, $6, 'draft', 1) returning *`,
    [id, personId, input.title, input.planType, input.periodStart, input.periodEnd],
  )
  return toPlan(res.rows[0]!)
}

export async function listLifePlans(
  pool: Pool,
  personId: string,
  status?: string,
): Promise<LifePlan[]> {
  const params: unknown[] = [personId]
  let q = `select * from worklife.plans where person_id = $1`
  if (status) {
    params.push(status)
    q += ` and status = $2`
  }
  q += ` order by period_start desc`
  const res = await pool.query<PlanRow>(q, params)
  return res.rows.map(toPlan)
}

export async function updateLifePlanStatus(
  pool: Pool,
  personId: string,
  planId: string,
  status: LifePlanStatus,
): Promise<LifePlan> {
  return await withTransaction(pool, async (client) => {
    const ex = await client.query<PlanRow>(
      `select id from worklife.plans where id=$1 and person_id=$2`,
      [planId, personId],
    )
    if (!ex.rows[0]) throw new NotFoundError('Không tìm thấy LifePlan')
    const res = await client.query<PlanRow>(
      `update worklife.plans set status=$1, version=version+1, updated_at=now() where id=$2 and person_id=$3 returning *`,
      [status, planId, personId],
    )
    return toPlan(res.rows[0]!)
  })
}

// Habits
export async function createHabit(
  pool: Pool,
  personId: string,
  input: {
    title: string
    habitType: HabitType
    frequency: HabitFrequency
    targetCount?: number
  },
): Promise<Habit> {
  const id = randomUUID()
  const res = await pool.query<HabitRow>(
    `insert into worklife.habits (id, person_id, title, habit_type, frequency, target_count, version)
     values ($1, $2, $3, $4, $5, $6, 1) returning *`,
    [id, personId, input.title, input.habitType, input.frequency, input.targetCount ?? 1],
  )
  return toHabit(res.rows[0]!)
}

export async function listHabits(
  pool: Pool,
  personId: string,
  isActive?: boolean,
): Promise<Habit[]> {
  const params: unknown[] = [personId]
  // Kèm ngày check-in gần nhất để giao diện khoá nút "Hoàn thành hôm nay" khi đã làm.
  let q = `select h.*,
                  (select to_char(max(l.logged_at), 'YYYY-MM-DD')
                     from worklife.habit_logs l where l.habit_id = h.id) as last_logged_at
             from worklife.habits h where h.person_id=$1`
  if (isActive !== undefined) {
    params.push(isActive)
    q += ` and h.is_active=$2`
  }
  q += ` order by h.created_at desc`
  const res = await pool.query<HabitRow>(q, params)
  return res.rows.map(toHabit)
}

export async function logHabit(
  pool: Pool,
  personId: string,
  input: {
    habitId: string
    loggedAt?: string
    count?: number
    note?: string
  },
): Promise<HabitLog> {
  return await withTransaction(pool, async (client) => {
    const ex = await client.query<HabitRow>(
      `select * from worklife.habits where id=$1 and person_id=$2 for update`,
      [input.habitId, personId],
    )
    if (!ex.rows[0]) throw new NotFoundError('Không tìm thấy Habit')

    const day = input.loggedAt ?? vnDateStr()

    // Ghi nhật ký LŨY ĐẲNG theo ngày: bấm lần thứ hai trong cùng ngày chỉ cộng dồn
    // `count`, KHÔNG tạo bản ghi mới (chỉ mục duy nhất uq_worklife_habit_logs_habit_day,
    // migration 0072). `xmax = 0` là mẹo Postgres để biết hàng trả về là hàng vừa CHÈN
    // hay hàng CŨ vừa bị cập nhật — ta cần phân biệt để quyết định có tăng streak không.
    const res = await client.query<HabitLogRow & { inserted: boolean }>(
      `insert into worklife.habit_logs (id, habit_id, person_id, logged_at, count, note)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (habit_id, logged_at) do update
         set count = worklife.habit_logs.count + excluded.count,
             note = coalesce(excluded.note, worklife.habit_logs.note)
       returning *, (xmax = 0) as inserted`,
      [randomUUID(), input.habitId, personId, day, input.count ?? 1, input.note ?? null],
    )
    const row = res.rows[0]!

    // Chỉ lần check-in ĐẦU TIÊN của một ngày mới đụng tới streak.
    if (row.inserted) {
      // Streak là chuỗi NGÀY LIÊN TIẾP: nối tiếp chỉ khi hôm qua cũng có check-in.
      // Trước đây hàm này luôn `current_streak + 1`, nên vừa cộng trùng trong ngày,
      // vừa không hề reset khi người dùng bỏ lỡ vài ngày.
      const prev = await client.query<{ logged_at: string }>(
        `select to_char(logged_at, 'YYYY-MM-DD') as logged_at
           from worklife.habit_logs
          where habit_id=$1 and logged_at < $2
          order by logged_at desc
          limit 1`,
        [input.habitId, day],
      )
      const continues = prev.rows[0]?.logged_at === addDays(day, -1)
      const newStreak = continues ? ex.rows[0]!.current_streak + 1 : 1
      const bestStreak = Math.max(newStreak, ex.rows[0]!.best_streak)
      await client.query(
        `update worklife.habits set current_streak=$1, best_streak=$2, version=version+1, updated_at=now() where id=$3`,
        [newStreak, bestStreak, input.habitId],
      )
    }

    return toHabitLog(row)
  })
}

// Wellbeing
export async function recordWellbeingCheck(
  pool: Pool,
  personId: string,
  input: {
    moodScore: number
    energyScore: number
    stressScore: number
    notes?: string
  },
): Promise<WellbeingCheck> {
  const id = randomUUID()
  const res = await pool.query<WellbeingRow>(
    `insert into worklife.wellbeing_checks (id, person_id, mood_score, energy_score, stress_score, notes)
     values ($1, $2, $3, $4, $5, $6) returning *`,
    [id, personId, input.moodScore, input.energyScore, input.stressScore, input.notes ?? null],
  )
  return toWellbeing(res.rows[0]!)
}

export async function listWellbeingChecks(
  pool: Pool,
  personId: string,
  limit = 30,
): Promise<WellbeingCheck[]> {
  const res = await pool.query<WellbeingRow>(
    `select * from worklife.wellbeing_checks where person_id=$1 order by checked_at desc limit $2`,
    [personId, limit],
  )
  return res.rows.map(toWellbeing)
}

// Growth milestones
export async function createGrowthMilestone(
  pool: Pool,
  personId: string,
  input: {
    area: GrowthArea
    title: string
    description?: string
    achievedAt?: string
  },
): Promise<GrowthMilestone> {
  const id = randomUUID()
  const res = await pool.query<GrowthRow>(
    `insert into worklife.growth_milestones (id, person_id, area, title, description, achieved_at)
     values ($1, $2, $3, $4, $5, $6) returning *`,
    [id, personId, input.area, input.title, input.description ?? null, input.achievedAt ?? null],
  )
  return toGrowth(res.rows[0]!)
}

export async function listGrowthMilestones(
  pool: Pool,
  personId: string,
  area?: GrowthArea,
): Promise<GrowthMilestone[]> {
  const params: unknown[] = [personId]
  let q = `select * from worklife.growth_milestones where person_id=$1`
  if (area) {
    params.push(area)
    q += ` and area=$2`
  }
  q += ` order by created_at desc`
  const res = await pool.query<GrowthRow>(q, params)
  return res.rows.map(toGrowth)
}
