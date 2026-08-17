// apps/english/src/lib/careerApi.ts — Client API wrapper for Career Domain (V2-13)
import { getAuthHeader } from '@core/authHeader'
import type {
  CareerProfile,
  CareerExperience,
  CareerGoal,
  CareerSkillGapAnalysis,
} from '../../../../packages/core-contracts/career'

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
  return res.json()
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
  return res.json()
}

export async function listCareerExperiences(): Promise<CareerExperience[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/career?resource=experiences', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
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
  return res.json()
}

export async function listCareerGoals(): Promise<CareerGoal[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/career?resource=goals', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
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
  return res.json()
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
  return res.json()
}
