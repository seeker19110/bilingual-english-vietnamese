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

    // add experience with default achievements and no endDate
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EXP_ID,
          person_id: PERSON_ID,
          company: 'Acme Minimal',
          role: 'Junior Dev',
          start_date: '2022-01',
          end_date: null,
          is_current: false,
          achievements: JSON.stringify([]),
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })
    const expMinimal = await addCareerExperience(pool, PERSON_ID, {
      company: 'Acme Minimal',
      role: 'Junior Dev',
      startDate: '2022-01',
    })
    expect(expMinimal.achievements).toEqual([])
    expect(expMinimal.endDate).toBeUndefined()

    // update profile with currency
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: PROF_ID,
            person_id: PERSON_ID,
            target_role: 'Lead',
            current_title: null,
            years_of_experience: 3,
            industry: null,
            target_salary_min: null,
            target_salary_max: null,
            currency: 'USD',
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
            target_role: 'Lead',
            current_title: null,
            years_of_experience: 3,
            industry: null,
            target_salary_min: null,
            target_salary_max: null,
            currency: 'USD',
            version: 2,
            created_at: new Date('2026-08-17T00:00:00Z'),
            updated_at: new Date('2026-08-17T00:00:00Z'),
          },
        ],
      })
    const updatedCurrency = await updateCareerProfile(pool, PERSON_ID, {
      targetRole: 'Lead',
      yearsOfExperience: 3,
      currency: 'USD',
    })
    expect(updatedCurrency.currency).toBe('USD')
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

  it('handles goal not found, skill gap without english, and string JSON edge cases', async () => {
    // Goal not found in analyzeCareerSkillGap
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(analyzeCareerSkillGap(pool, PERSON_ID, GOAL_ID, 'user-1')).rejects.toThrow(
      'Không tìm thấy CareerGoal',
    )

    // Goal with non-array json, string json, invalid json
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: GOAL_ID,
          person_id: PERSON_ID,
          target_title: 'Backend Dev',
          skills_required: '{bad-json',
        },
      ],
    })
    getLearningReadModel.mockResolvedValueOnce(null)
    const analysis = await analyzeCareerSkillGap(pool, PERSON_ID, GOAL_ID, 'user-1')
    expect(analysis.gaps.length).toBe(0)

    // parseJsonArray with string array and non-array object
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EXP_ID,
          person_id: PERSON_ID,
          company: 'Acme',
          role: 'Dev',
          start_date: '2024-01-01',
          end_date: null,
          is_current: true,
          achievements: '{"key":"val"}',
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })
    const expList = await listCareerExperiences(pool, PERSON_ID)
    expect(expList[0]?.achievements).toEqual([])

    // List career goals without status filter
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const allGoals = await listCareerGoals(pool, PERSON_ID)
    expect(allGoals.length).toBe(0)

    // English skill with A1 level (unfulfilled) and null level (unassessed)
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: GOAL_ID,
          person_id: PERSON_ID,
          target_title: 'Global Analyst',
          skills_required: ['IELTS 6.5', 'Python'],
        },
      ],
    })
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: 'A1' })
    const a1Analysis = await analyzeCareerSkillGap(pool, PERSON_ID, GOAL_ID, 'user-1')
    expect(a1Analysis.gaps.find((g) => g.skill === 'IELTS 6.5')?.isFulfilled).toBe(false)
    expect(a1Analysis.gaps.find((g) => g.skill === 'IELTS 6.5')?.currentMastery).toBe('A1')

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: GOAL_ID,
          person_id: PERSON_ID,
          target_title: 'Global Analyst',
          skills_required: ['IELTS 6.5'],
        },
      ],
    })
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: undefined })
    const nullAnalysis = await analyzeCareerSkillGap(pool, PERSON_ID, GOAL_ID, 'user-1')
    expect(nullAnalysis.gaps[0]?.isFulfilled).toBe(false)
    expect(nullAnalysis.gaps[0]?.currentMastery).toBe('Chưa đánh giá')
  })
})

// Nhánh biên: cột NULL, tham số optional vắng mặt, JSON hỏng, goal không tồn tại.
describe('CareerService — nhánh biên', () => {
  it('profile với cột optional NULL → bỏ hẳn field khỏi kết quả', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: PROF_ID,
          person_id: PERSON_ID,
          target_role: 'Chưa xác định',
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

    const profile = await getOrCreateCareerProfile(pool, PERSON_ID)
    expect(profile.currentTitle).toBeUndefined()
    expect(profile.industry).toBeUndefined()
    expect(profile.targetSalaryMin).toBeUndefined()
    expect(profile.targetSalaryMax).toBeUndefined()
  })

  it('updateCareerProfile không truyền field optional → gửi null xuống DB', async () => {
    // Lần query 1: getOrCreateCareerProfile tìm thấy profile sẵn có.
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: PROF_ID,
          person_id: PERSON_ID,
          target_role: 'Backend Engineer',
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
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: PROF_ID,
          person_id: PERSON_ID,
          target_role: 'Backend Engineer',
          current_title: null,
          years_of_experience: 3,
          industry: null,
          target_salary_min: null,
          target_salary_max: null,
          currency: 'VND',
          version: 2,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const updated = await updateCareerProfile(pool, PERSON_ID, {
      targetRole: 'Backend Engineer',
      yearsOfExperience: 3,
    })
    expect(updated.version).toBe(2)
    expect(mockQuery.mock.calls[1]![1]).toEqual([
      'Backend Engineer',
      null,
      3,
      null,
      null,
      null,
      null,
      PERSON_ID,
    ])
  })

  it('addCareerExperience không có endDate/isCurrent/achievements', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EXP_ID,
          person_id: PERSON_ID,
          company: 'Startup X',
          role: 'Intern',
          start_date: '2022-06',
          end_date: null,
          is_current: false,
          achievements: null,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const exp = await addCareerExperience(pool, PERSON_ID, {
      company: 'Startup X',
      role: 'Intern',
      startDate: '2022-06',
    })
    expect(exp.endDate).toBeUndefined()
    expect(exp.isCurrent).toBe(false)
    expect(exp.achievements).toEqual([])
    const params = mockQuery.mock.calls[0]![1] as unknown[]
    expect(params[5]).toBeNull()
    expect(params[6]).toBe(false)
    expect(params[7]).toBe('[]')
  })

  it('experience có endDate và achievements dạng mảng sẵn (không phải chuỗi)', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EXP_ID,
          person_id: PERSON_ID,
          company: 'Old Co',
          role: 'Dev',
          start_date: '2020-01',
          end_date: '2022-01',
          is_current: false,
          achievements: ['Ra mắt app'],
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const list = await listCareerExperiences(pool, PERSON_ID)
    expect(list[0]!.endDate).toBe('2022-01')
    expect(list[0]!.achievements).toEqual(['Ra mắt app'])
  })

  it('achievements là chuỗi JSON hỏng hoặc không phải mảng → mảng rỗng', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EXP_ID,
          person_id: PERSON_ID,
          company: 'A',
          role: 'Dev',
          start_date: '2020-01',
          end_date: null,
          is_current: false,
          achievements: 'không-phải-json',
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
        {
          id: EXP_ID,
          person_id: PERSON_ID,
          company: 'B',
          role: 'Dev',
          start_date: '2020-01',
          end_date: null,
          is_current: false,
          achievements: '{"a":1}',
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const list = await listCareerExperiences(pool, PERSON_ID)
    expect(list[0]!.achievements).toEqual([])
    expect(list[1]!.achievements).toEqual([])
  })

  it('goal với target_company_type/timeframe NULL và listCareerGoals không lọc status', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: GOAL_ID,
          person_id: PERSON_ID,
          target_title: 'Tech Lead',
          target_company_type: null,
          timeframe: null,
          status: 'active',
          skills_required: JSON.stringify(['Mentoring']),
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const goals = await listCareerGoals(pool, PERSON_ID)
    expect(goals[0]!.targetCompanyType).toBeUndefined()
    expect(goals[0]!.timeframe).toBeUndefined()
    const [sql, params] = mockQuery.mock.calls[0]! as [string, unknown[]]
    expect(sql).not.toContain('and status')
    expect(params).toEqual([PERSON_ID])
  })

  it('analyzeCareerSkillGap ném NotFoundError khi goal không tồn tại', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(analyzeCareerSkillGap(pool, PERSON_ID, GOAL_ID, 'user-1')).rejects.toThrow(
      'Không tìm thấy CareerGoal',
    )
    expect(getLearningReadModel).not.toHaveBeenCalled()
  })

  it('kỹ năng tiếng Anh chưa đạt B2 và chưa có đánh giá → isFulfilled=false', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: GOAL_ID,
          person_id: PERSON_ID,
          target_title: 'IELTS Trainer',
          skills_required: ['IELTS Speaking'],
        },
      ],
    })
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: 'A2' })

    const low = await analyzeCareerSkillGap(pool, PERSON_ID, GOAL_ID, 'user-1')
    expect(low.gaps[0]!.isFulfilled).toBe(false)
    expect(low.gaps[0]!.currentMastery).toBe('A2')

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: GOAL_ID,
          person_id: PERSON_ID,
          target_title: 'IELTS Trainer',
          skills_required: ['Tiếng Anh giao tiếp'],
        },
      ],
    })
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: null })

    const none = await analyzeCareerSkillGap(pool, PERSON_ID, GOAL_ID, 'user-1')
    expect(none.gaps[0]!.isFulfilled).toBe(false)
    expect(none.gaps[0]!.currentMastery).toBe('Chưa đánh giá')
  })

  it('goal không có skills_required → danh sách gaps rỗng', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: GOAL_ID,
          person_id: PERSON_ID,
          target_title: 'Chưa rõ',
          skills_required: null,
        },
      ],
    })
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: 'B1' })

    const analysis = await analyzeCareerSkillGap(pool, PERSON_ID, GOAL_ID, 'user-1')
    expect(analysis.gaps).toEqual([])
  })
})
