import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  getOrCreateCareerProfile,
  updateCareerProfile,
  addCareerExperience,
  listCareerExperiences,
  createCareerGoal,
  listCareerGoals,
  analyzeCareerSkillGap,
} from './careerService.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const PROF_ID = '22222222-2222-4222-8222-222222222222'
const EXP_ID = '33333333-3333-4333-8333-333333333333'
const GOAL_ID = '44444444-4444-4444-8444-444444444444'

const mockQuery = vi.fn()
const mockClient = { query: mockQuery }

vi.mock('../core-db/transaction.js', () => ({
  withTransaction: async (_pool: unknown, fn: (client: typeof mockClient) => Promise<unknown>) =>
    fn(mockClient),
}))

const getLearningReadModel = vi.fn()
vi.mock('../core-learner/learningReadModelService.js', () => ({
  getLearningReadModel: (...a: unknown[]) => getLearningReadModel(...a),
}))

const pool = { query: mockQuery } as unknown as Pool

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Career Profile Management', () => {
  it('gets existing career profile', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: PROF_ID,
          person_id: PERSON_ID,
          target_role: 'Data Scientist',
          current_title: 'Junior Analyst',
          years_of_experience: 2,
          industry: 'AI',
          target_salary_min: 30000000,
          target_salary_max: 45000000,
          currency: 'VND',
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const profile = await getOrCreateCareerProfile(pool, PERSON_ID)
    expect(profile.targetRole).toBe('Data Scientist')
    expect(profile.yearsOfExperience).toBe(2)
  })

  it('creates default career profile if none exists', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({
      rows: [
        {
          id: PROF_ID,
          person_id: PERSON_ID,
          target_role: 'Product Manager',
          current_title: null,
          years_of_experience: 0,
          industry: null,
          target_salary_min: null,
          target_salary_max: null,
          currency: 'VND',
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const profile = await getOrCreateCareerProfile(pool, PERSON_ID, 'Product Manager')
    expect(profile.targetRole).toBe('Product Manager')
  })

  it('updates career profile with optimistic lock version increment', async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: PROF_ID,
            person_id: PERSON_ID,
            target_role: 'PM',
            current_title: null,
            years_of_experience: 1,
            industry: null,
            target_salary_min: null,
            target_salary_max: null,
            currency: 'VND',
            version: 1,
            created_at: new Date('2026-08-17T00:00:00Z'),
            updated_at: new Date('2026-08-17T00:00:00Z'),
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: PROF_ID,
            person_id: PERSON_ID,
            target_role: 'Senior PM',
            current_title: 'PM',
            years_of_experience: 5,
            industry: 'Tech',
            target_salary_min: 50000000,
            target_salary_max: 70000000,
            currency: 'VND',
            version: 2,
            created_at: new Date('2026-08-17T00:00:00Z'),
            updated_at: new Date('2026-08-17T00:00:00Z'),
          },
        ],
      })

    const updated = await updateCareerProfile(pool, PERSON_ID, {
      targetRole: 'Senior PM',
      currentTitle: 'PM',
      yearsOfExperience: 5,
      industry: 'Tech',
      targetSalaryMin: 50000000,
      targetSalaryMax: 70000000,
    })

    expect(updated.version).toBe(2)
    expect(updated.targetRole).toBe('Senior PM')
  })
})

describe('Career Experience & Goal Management', () => {
  it('adds and lists career experiences', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EXP_ID,
          person_id: PERSON_ID,
          company: 'Acme Corp',
          role: 'Engineer',
          start_date: '2023-01',
          end_date: null,
          is_current: true,
          achievements: JSON.stringify(['Built CI/CD pipeline']),
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const exp = await addCareerExperience(pool, PERSON_ID, {
      company: 'Acme Corp',
      role: 'Engineer',
      startDate: '2023-01',
      isCurrent: true,
      achievements: ['Built CI/CD pipeline'],
    })

    expect(exp.company).toBe('Acme Corp')
    expect(exp.isCurrent).toBe(true)

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EXP_ID,
          person_id: PERSON_ID,
          company: 'Acme Corp',
          role: 'Engineer',
          start_date: '2023-01',
          end_date: null,
          is_current: true,
          achievements: JSON.stringify(['Built CI/CD pipeline']),
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const list = await listCareerExperiences(pool, PERSON_ID)
    expect(list.length).toBe(1)
    expect(list[0]?.company).toBe('Acme Corp')
  })

  it('creates and lists career goals', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: GOAL_ID,
          person_id: PERSON_ID,
          target_title: 'Engineering Manager',
          target_company_type: 'Scaleup',
          timeframe: '1 year',
          status: 'active',
          skills_required: JSON.stringify(['Leadership', 'English B2']),
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const goal = await createCareerGoal(pool, PERSON_ID, {
      targetTitle: 'Engineering Manager',
      skillsRequired: ['Leadership', 'English B2'],
    })

    expect(goal.targetTitle).toBe('Engineering Manager')
    expect(goal.status).toBe('active')

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: GOAL_ID,
          person_id: PERSON_ID,
          target_title: 'Engineering Manager',
          target_company_type: 'Scaleup',
          timeframe: '1 year',
          status: 'active',
          skills_required: JSON.stringify(['Leadership', 'English B2']),
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const goals = await listCareerGoals(pool, PERSON_ID, 'active')
    expect(goals.length).toBe(1)
    expect(goals[0]?.targetTitle).toBe('Engineering Manager')
  })
})

describe('analyzeCareerSkillGap', () => {
  it('analyzes skill gaps using Learning Read Model without direct learning DB access', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: GOAL_ID,
          person_id: PERSON_ID,
          target_title: 'Global Product Specialist',
          skills_required: ['English Communication', 'SQL Analysis'],
        },
      ],
    })

    getLearningReadModel.mockResolvedValueOnce({
      currentLevel: 'B2',
    })

    const analysis = await analyzeCareerSkillGap(pool, PERSON_ID, GOAL_ID, 'user-1')

    expect(analysis.targetTitle).toBe('Global Product Specialist')
    expect(analysis.gaps.length).toBe(2)
    const englishGap = analysis.gaps.find((g) => g.skill === 'English Communication')
    expect(englishGap?.isFulfilled).toBe(true)
    expect(englishGap?.currentMastery).toBe('B2')
    expect(getLearningReadModel).toHaveBeenCalledWith(expect.anything(), {
      personId: PERSON_ID,
      userId: 'user-1',
      subject: 'english',
    })
  })
})
