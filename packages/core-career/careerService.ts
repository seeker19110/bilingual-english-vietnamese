// packages/core-career/careerService.ts — Service cho Career Domain (V2-13).
// Thỏa mãn Gate: Không query trực tiếp vào bảng Learning, luôn đọc qua Learning Read Model.
import type { Pool } from 'pg'
import { randomUUID } from 'node:crypto'
import { withTransaction } from '../core-db/transaction.js'
import { NotFoundError } from '../core-errors/appError.js'
import {
  CareerProfileSchema,
  CareerExperienceSchema,
  CareerGoalSchema,
  CareerSkillGapAnalysisSchema,
  CAREER_SCHEMA_VERSION,
  type CareerProfile,
  type CareerExperience,
  type CareerGoal,
  type CareerSkillGapAnalysis,
} from '../core-contracts/career.js'
import { getLearningReadModel } from '../core-learner/learningReadModelService.js'

export interface UpdateCareerProfileInput {
  targetRole: string
  currentTitle?: string
  yearsOfExperience: number
  industry?: string
  targetSalaryMin?: number
  targetSalaryMax?: number
  currency?: string
}

export interface AddExperienceInput {
  company: string
  role: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
  achievements?: string[]
}

export interface CreateCareerGoalInput {
  targetTitle: string
  targetCompanyType?: string
  timeframe?: string
  skillsRequired: string[]
}

interface ProfileRow {
  id: string
  person_id: string
  target_role: string
  current_title: string | null
  years_of_experience: number
  industry: string | null
  target_salary_min: string | null
  target_salary_max: string | null
  currency: string
  version: number
  created_at: Date
  updated_at: Date
}

interface ExperienceRow {
  id: string
  person_id: string
  company: string
  role: string
  start_date: string
  end_date: string | null
  is_current: boolean
  achievements: unknown
  created_at: Date
  updated_at: Date
}

interface GoalRow {
  id: string
  person_id: string
  target_title: string
  target_company_type: string | null
  timeframe: string | null
  status: string
  skills_required: unknown
  version: number
  created_at: Date
  updated_at: Date
}

function toCareerProfile(row: ProfileRow): CareerProfile {
  return CareerProfileSchema.parse({
    id: row.id,
    personId: row.person_id,
    targetRole: row.target_role,
    ...(row.current_title ? { currentTitle: row.current_title } : {}),
    yearsOfExperience: row.years_of_experience,
    ...(row.industry ? { industry: row.industry } : {}),
    ...(row.target_salary_min ? { targetSalaryMin: Number(row.target_salary_min) } : {}),
    ...(row.target_salary_max ? { targetSalaryMax: Number(row.target_salary_max) } : {}),
    currency: row.currency,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    schemaVersion: CAREER_SCHEMA_VERSION,
  })
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[]
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed as string[]
    } catch {
      return []
    }
  }
  return []
}

function toCareerExperience(row: ExperienceRow): CareerExperience {
  return CareerExperienceSchema.parse({
    id: row.id,
    personId: row.person_id,
    company: row.company,
    role: row.role,
    startDate: row.start_date,
    ...(row.end_date ? { endDate: row.end_date } : {}),
    isCurrent: row.is_current,
    achievements: parseJsonArray(row.achievements),
    createdAt: row.created_at.toISOString(),
    schemaVersion: CAREER_SCHEMA_VERSION,
  })
}

function toCareerGoal(row: GoalRow): CareerGoal {
  return CareerGoalSchema.parse({
    id: row.id,
    personId: row.person_id,
    targetTitle: row.target_title,
    ...(row.target_company_type ? { targetCompanyType: row.target_company_type } : {}),
    ...(row.timeframe ? { timeframe: row.timeframe } : {}),
    status: row.status,
    skillsRequired: parseJsonArray(row.skills_required),
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    schemaVersion: CAREER_SCHEMA_VERSION,
  })
}

/**
 * Gets or creates a CareerProfile for a person.
 */
export async function getOrCreateCareerProfile(
  pool: Pool,
  personId: string,
  defaultRole = 'Chưa xác định',
): Promise<CareerProfile> {
  const existing = await pool.query<ProfileRow>(
    `select * from career.profiles where person_id = $1`,
    [personId],
  )
  if (existing.rows[0]) {
    return toCareerProfile(existing.rows[0])
  }

  const id = randomUUID()
  const created = await pool.query<ProfileRow>(
    `insert into career.profiles (id, person_id, target_role, years_of_experience)
     values ($1, $2, $3, 0)
     returning *`,
    [id, personId, defaultRole],
  )
  return toCareerProfile(created.rows[0]!)
}

/**
 * Updates CareerProfile for a person.
 */
export async function updateCareerProfile(
  pool: Pool,
  personId: string,
  updates: UpdateCareerProfileInput,
): Promise<CareerProfile> {
  return await withTransaction(pool, async (client) => {
    await getOrCreateCareerProfile(pool, personId, updates.targetRole)
    const res = await client.query<ProfileRow>(
      `update career.profiles
       set target_role = $1,
           current_title = $2,
           years_of_experience = $3,
           industry = $4,
           target_salary_min = $5,
           target_salary_max = $6,
           currency = coalesce($7, currency),
           version = version + 1,
           updated_at = now()
       where person_id = $8
       returning *`,
      [
        updates.targetRole,
        updates.currentTitle ?? null,
        updates.yearsOfExperience,
        updates.industry ?? null,
        updates.targetSalaryMin ?? null,
        updates.targetSalaryMax ?? null,
        updates.currency ?? null,
        personId,
      ],
    )
    return toCareerProfile(res.rows[0]!)
  })
}

/**
 * Adds a career experience.
 */
export async function addCareerExperience(
  pool: Pool,
  personId: string,
  input: AddExperienceInput,
): Promise<CareerExperience> {
  const id = randomUUID()
  const achievementsJson = JSON.stringify(input.achievements ?? [])
  const res = await pool.query<ExperienceRow>(
    `insert into career.experiences
      (id, person_id, company, role, start_date, end_date, is_current, achievements)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning *`,
    [
      id,
      personId,
      input.company,
      input.role,
      input.startDate,
      input.endDate ?? null,
      Boolean(input.isCurrent),
      achievementsJson,
    ],
  )
  return toCareerExperience(res.rows[0]!)
}

/**
 * Lists career experiences.
 */
export async function listCareerExperiences(
  pool: Pool,
  personId: string,
): Promise<CareerExperience[]> {
  const res = await pool.query<ExperienceRow>(
    `select * from career.experiences where person_id = $1 order by created_at desc`,
    [personId],
  )
  return res.rows.map(toCareerExperience)
}

/**
 * Creates a career goal.
 */
export async function createCareerGoal(
  pool: Pool,
  personId: string,
  input: CreateCareerGoalInput,
): Promise<CareerGoal> {
  const id = randomUUID()
  const skillsJson = JSON.stringify(input.skillsRequired)
  const res = await pool.query<GoalRow>(
    `insert into career.goals
      (id, person_id, target_title, target_company_type, timeframe, status, skills_required, version)
     values ($1, $2, $3, $4, $5, 'active', $6, 1)
     returning *`,
    [
      id,
      personId,
      input.targetTitle,
      input.targetCompanyType ?? null,
      input.timeframe ?? null,
      skillsJson,
    ],
  )
  return toCareerGoal(res.rows[0]!)
}

/**
 * Lists career goals.
 */
export async function listCareerGoals(
  pool: Pool,
  personId: string,
  status?: string,
): Promise<CareerGoal[]> {
  const params: unknown[] = [personId]
  let query = `select * from career.goals where person_id = $1`
  if (status) {
    params.push(status)
    query += ` and status = $2`
  }
  query += ` order by created_at desc`
  const res = await pool.query<GoalRow>(query, params)
  return res.rows.map(toCareerGoal)
}

/**
 * Analyzes skill gaps for a career goal by reading Learning Read Model.
 * Gate: No direct query to Learning database tables!
 */
export async function analyzeCareerSkillGap(
  pool: Pool,
  personId: string,
  goalId: string,
  userId: string,
): Promise<CareerSkillGapAnalysis> {
  const goalRes = await pool.query<GoalRow>(
    `select * from career.goals where id = $1 and person_id = $2`,
    [goalId, personId],
  )
  const goal = goalRes.rows[0]
  if (!goal) throw new NotFoundError('Không tìm thấy CareerGoal')

  const learningModel = await getLearningReadModel(pool, {
    personId,
    userId,
    subject: 'english',
  })

  const requiredSkills = parseJsonArray(goal.skills_required)
  const gaps = requiredSkills.map((skillName) => {
    const isEnglishSkill = /english|tiếng anh|ielts|toeic/i.test(skillName)
    if (isEnglishSkill) {
      const currentLevel = learningModel.currentLevel
      const isFulfilled = currentLevel ? ['B2', 'C1', 'C2'].includes(currentLevel) : false
      return {
        skill: skillName,
        requiredLevel: 'B2',
        currentMastery: currentLevel ?? 'Chưa đánh giá',
        isFulfilled,
      }
    }
    return {
      skill: skillName,
      requiredLevel: 'Proficient',
      currentMastery: 'In Progress',
      isFulfilled: false,
    }
  })

  return CareerSkillGapAnalysisSchema.parse({
    personId,
    goalId,
    targetTitle: goal.target_title,
    gaps,
    analyzedAt: new Date().toISOString(),
    schemaVersion: CAREER_SCHEMA_VERSION,
  })
}
