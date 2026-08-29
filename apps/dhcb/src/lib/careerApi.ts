// apps/dhcb/src/lib/careerApi.ts — Client API wrapper for Career Domain (V2-13)
import { getAuthHeader } from '@core/authHeader'
import type { ProficiencyBand } from '@dhcb/core-contracts/careerInterview'
import type {
  CareerProfile,
  CareerExperience,
  CareerGoal,
  CareerSkillGapAnalysis,
} from '@dhcb/core-contracts/career'

export interface SaveCareerProfileParams {
  targetRole: string
  currentTitle?: string
  yearsOfExperience: number
  industry?: string
  targetSalaryMin?: number
  targetSalaryMax?: number
  currency?: string
}

export interface AddCareerExperienceParams {
  company: string
  role: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
  achievements?: string[]
}

export interface CreateCareerGoalParams {
  targetTitle: string
  targetCompanyType?: string
  timeframe?: string
  skillsRequired: string[]
}

export async function fetchCareerProfile(): Promise<CareerProfile | null> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/career?resource=profile', { headers })
  if (!res.ok) {
    if (res.status === 404) return null
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  // Server bọc dữ liệu trong { profile } (xem apps/server/src/api/domains/career.ts) — gỡ vỏ
  // ở đây thay vì trả nguyên response, nếu không state phía trên nhận object sai hình dạng.
  const { profile } = (await res.json()) as { profile: CareerProfile | null }
  return profile
}

export async function saveCareerProfile(params: SaveCareerProfileParams): Promise<CareerProfile> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/career', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource: 'profile', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  const { profile } = (await res.json()) as { profile: CareerProfile }
  return profile
}

export async function listCareerExperiences(): Promise<CareerExperience[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/career?resource=experiences', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  const { experiences } = (await res.json()) as { experiences: CareerExperience[] }
  return experiences
}

export async function addCareerExperience(
  params: AddCareerExperienceParams,
): Promise<CareerExperience> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/career', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource: 'experience', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  const { experience } = (await res.json()) as { experience: CareerExperience }
  return experience
}

export async function listCareerGoals(): Promise<CareerGoal[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/career?resource=goals', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  const { goals } = (await res.json()) as { goals: CareerGoal[] }
  return goals
}

export async function createCareerGoal(params: CreateCareerGoalParams): Promise<CareerGoal> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/career', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource: 'goal', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  const { goal } = (await res.json()) as { goal: CareerGoal }
  return goal
}

export async function fetchCareerSkillGap(goalId: string): Promise<CareerSkillGapAnalysis> {
  const headers = await getAuthHeader()
  const res = await fetch(`/api/career?resource=skill_gap&goalId=${encodeURIComponent(goalId)}`, {
    headers,
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  const { analysis } = (await res.json()) as { analysis: CareerSkillGapAnalysis }
  return analysis
}

// Người dùng tự đánh giá bậc thành thạo (B1–B5) cho một kỹ năng. Đây là thứ làm bảng phân tích
// khoảng cách kỹ năng có nghĩa — trước 2026-08-24 mọi kỹ năng ngoài tiếng Anh đều bị hiển thị
// cứng là "In Progress / chưa đạt".
export async function saveSkillSelfLevel(params: {
  skill: string
  selfBand: ProficiencyBand
  targetBand?: ProficiencyBand
}): Promise<void> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/career', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource: 'skill_level', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
}
