// apps/dhcb/src/lib/lifeApi.ts — Client API wrapper for Life Foundation Domain (V2-17)
import { getAuthHeader } from '@core/authHeader'
import type {
  LifePlan,
  Habit,
  HabitLog,
  WellbeingCheck,
  GrowthMilestone,
  LifeWheelScores,
  LifeWheelState,
} from '@dhcb/core-contracts/lifeFoundation'

export interface CreateLifePlanParams {
  title: string
  planType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  periodStart: string
  periodEnd: string
}

export interface CreateHabitParams {
  title: string
  habitType: 'build' | 'break'
  frequency: 'daily' | 'weekly' | 'custom'
  targetCount?: number
}

export interface LogHabitParams {
  habitId: string
  loggedAt?: string
  count?: number
  note?: string
}

export interface RecordWellbeingCheckParams {
  moodScore: number
  energyScore: number
  stressScore: number
  notes?: string
}

export interface CreateGrowthMilestoneParams {
  area:
    | 'health'
    | 'career'
    | 'learning'
    | 'relationships'
    | 'finances'
    | 'creativity'
    | 'spirituality'
    | 'other'
  title: string
  description?: string
  achievedAt?: string
}

export async function listLifePlans(): Promise<LifePlan[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life?kind=plans', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function createLifePlan(params: CreateLifePlanParams): Promise<LifePlan> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'plan', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function updateLifePlanStatus(
  id: string,
  status: 'draft' | 'active' | 'completed' | 'archived',
): Promise<LifePlan> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life', {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'plan_status', id, status }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function listHabits(): Promise<Habit[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life?kind=habits', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function createHabit(params: CreateHabitParams): Promise<Habit> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'habit', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function logHabit(params: LogHabitParams): Promise<HabitLog> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'habit_log', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function listWellbeingChecks(): Promise<WellbeingCheck[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life?kind=wellbeing', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function recordWellbeingCheck(
  params: RecordWellbeingCheckParams,
): Promise<WellbeingCheck> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'wellbeing', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function listGrowthMilestones(): Promise<GrowthMilestone[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life?kind=milestones', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

// Bánh Xe Cuộc Đời — đọc bản đánh giá đã lưu (null nếu chưa lưu lần nào).
export async function getLifeWheel(): Promise<LifeWheelState | null> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life?kind=wheel', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  const data = (await res.json()) as { wheel: LifeWheelState | null }
  return data.wheel
}

// Bánh Xe Cuộc Đời — lưu trọn bộ điểm 8 khía cạnh (ghi đè bản trước).
export async function saveLifeWheel(scores: LifeWheelScores): Promise<LifeWheelState> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'wheel', scores }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  const data = (await res.json()) as { wheel: LifeWheelState }
  return data.wheel
}

export async function createGrowthMilestone(
  params: CreateGrowthMilestoneParams,
): Promise<GrowthMilestone> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/life', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'milestone', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}
