// packages/core-domains/domainReadModelService.test.ts
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Pool } from 'pg'

import {
  formatCareerReadModelForContext,
  formatWorkReadModelForContext,
  formatStartupReadModelForContext,
  formatLifeReadModelForContext,
  getWorkReadModel,
  getStartupReadModel,
  getLifeReadModel,
  getDomainReadModelForContext,
  isDomainReadModelDomain,
} from './domainReadModelService.js'

const listWorkProjects = vi.fn()
const listWorkTasks = vi.fn()
vi.mock('./workService.js', () => ({
  listWorkProjects: (...a: unknown[]) => listWorkProjects(...a),
  listWorkTasks: (...a: unknown[]) => listWorkTasks(...a),
}))

const listVentures = vi.fn()
const listProblems = vi.fn()
const listHypotheses = vi.fn()
vi.mock('./startupService.js', () => ({
  listVentures: (...a: unknown[]) => listVentures(...a),
  listProblems: (...a: unknown[]) => listProblems(...a),
  listHypotheses: (...a: unknown[]) => listHypotheses(...a),
}))

const listLifePlans = vi.fn()
const listHabits = vi.fn()
const listWellbeingChecks = vi.fn()
vi.mock('./lifeFoundationService.js', () => ({
  listLifePlans: (...a: unknown[]) => listLifePlans(...a),
  listHabits: (...a: unknown[]) => listHabits(...a),
  listWellbeingChecks: (...a: unknown[]) => listWellbeingChecks(...a),
}))

const getOrCreateCareerProfile = vi.fn()
const listCareerExperiences = vi.fn()
const listCareerGoals = vi.fn()
vi.mock('./careerService.js', () => ({
  getOrCreateCareerProfile: (...a: unknown[]) => getOrCreateCareerProfile(...a),
  listCareerExperiences: (...a: unknown[]) => listCareerExperiences(...a),
  listCareerGoals: (...a: unknown[]) => listCareerGoals(...a),
}))

const pool = {} as unknown as Pool
const PERSON = '11111111-1111-4111-8111-111111111111'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('isDomainReadModelDomain', () => {
  it('nhận đúng 4 trụ, từ chối trụ Learning (read model của nó nằm ở core-learner)', () => {
    expect(['career', 'work', 'startup', 'life'].every(isDomainReadModelDomain)).toBe(true)
    expect(isDomainReadModelDomain('learning')).toBe(false)
    expect(isDomainReadModelDomain('general')).toBe(false)
  })
})

describe('Work read model', () => {
  it('đếm việc theo trạng thái, chỉ tính QUÁ HẠN cho việc chưa xong', async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString()
    listWorkProjects.mockResolvedValue([
      { status: 'active' },
      { status: 'active' },
      { status: 'archived' },
    ])
    listWorkTasks.mockResolvedValue([
      { status: 'todo', priority: 'urgent', dueAt: past },
      { status: 'in_progress', priority: 'high', dueAt: past },
      { status: 'blocked', priority: 'low' },
      // Đã xong nhưng quá hạn — KHÔNG được tính là quá hạn nữa.
      { status: 'done', priority: 'urgent', dueAt: past },
    ])

    const m = await getWorkReadModel(pool, PERSON)
    expect(m.activeProjectCount).toBe(2)
    expect(m.taskCountByStatus).toEqual({ todo: 1, in_progress: 1, blocked: 1, done: 1 })
    expect(m.overdueTaskCount).toBe(2)
    expect(m.urgentOpenTaskCount).toBe(1)
  })

  it('không có việc nào → mọi ô đếm bằng 0, chuỗi vẫn dựng được', async () => {
    listWorkProjects.mockResolvedValue([])
    listWorkTasks.mockResolvedValue([])
    const m = await getWorkReadModel(pool, PERSON)
    expect(m.overdueTaskCount).toBe(0)
    expect(formatWorkReadModelForContext(m)).toContain('Dự án đang chạy: 0')
  })
})

describe('Startup read model', () => {
  it('lấy venture mới nhất và đếm giả định theo trạng thái', async () => {
    listVentures.mockResolvedValue([
      { id: 'v-moi', name: 'EdTech AI', stage: 'validation' },
      { id: 'v-cu', name: 'Cũ hơn', stage: 'ideation' },
    ])
    listProblems.mockResolvedValue([{}, {}, {}])
    listHypotheses.mockResolvedValue([
      { status: 'unverified' },
      { status: 'supported' },
      { status: 'supported' },
      { status: 'refuted' },
    ])

    const m = await getStartupReadModel(pool, PERSON)
    expect(m.latestVentureName).toBe('EdTech AI')
    expect(m.hypothesisCountByStatus).toEqual({
      unverified: 1,
      supported: 2,
      refuted: 1,
      pivoted: 0,
    })
    // Chỉ đếm cho venture GẦN NHẤT, và phải truyền đúng id của nó xuống service.
    expect(listProblems).toHaveBeenCalledWith(pool, PERSON, 'v-moi')
    expect(listHypotheses).toHaveBeenCalledWith(pool, PERSON, 'v-moi')
    const text = formatStartupReadModelForContext(m)
    expect(text).toContain('EdTech AI')
    expect(text).toContain('giai đoạn validation')
  })

  it('chưa có venture nào → không bịa tên dự án', async () => {
    listVentures.mockResolvedValue([])
    listProblems.mockResolvedValue([])
    listHypotheses.mockResolvedValue([])
    const m = await getStartupReadModel(pool, PERSON)
    expect(m.latestVentureName).toBeUndefined()
    expect(formatStartupReadModelForContext(m)).not.toContain('Venture gần nhất')
    // Không có venture thì KHÔNG truy vấn vấn đề/giả định lần nào.
    expect(listProblems).not.toHaveBeenCalled()
    expect(listHypotheses).not.toHaveBeenCalled()
  })
})

describe('Life read model', () => {
  it('chỉ đếm thói quen ĐANG bật, lấy chuỗi ngày dài nhất trong số đó', async () => {
    listLifePlans.mockResolvedValue([{ status: 'active' }, { status: 'draft' }])
    listHabits.mockResolvedValue([
      { isActive: true, currentStreak: 4 },
      { isActive: true, currentStreak: 11 },
      // Đã tắt: streak 99 vẫn KHÔNG được tính.
      { isActive: false, currentStreak: 99 },
    ])
    listWellbeingChecks.mockResolvedValue([
      { moodScore: 7, energyScore: 6, stressScore: 3, notes: 'nhật ký riêng tư' },
    ])

    const m = await getLifeReadModel(pool, PERSON)
    expect(m.activePlanCount).toBe(1)
    expect(m.activeHabitCount).toBe(2)
    expect(m.bestCurrentStreak).toBe(11)
  })

  // RIÊNG TƯ: nhật ký cảm xúc (`notes`) tuyệt đối không được lọt vào ngữ cảnh gửi LLM.
  it('KHÔNG đưa ghi chú nhật ký cảm xúc vào chuỗi ngữ cảnh', async () => {
    listLifePlans.mockResolvedValue([])
    listHabits.mockResolvedValue([])
    listWellbeingChecks.mockResolvedValue([
      { moodScore: 5, energyScore: 5, stressScore: 8, notes: 'BÍ MẬT KHÔNG ĐƯỢC LỘ' },
    ])
    const m = await getLifeReadModel(pool, PERSON)
    expect(JSON.stringify(m)).not.toContain('BÍ MẬT')
    expect(formatLifeReadModelForContext(m)).not.toContain('BÍ MẬT')
  })
})

describe('Career read model', () => {
  it('cắt danh sách kỹ năng ở 5 mục', () => {
    const text = formatCareerReadModelForContext({
      targetRole: 'Staff Engineer',
      currentTitle: 'Senior Engineer',
      yearsOfExperience: 6,
      experienceCount: 3,
      activeGoalCount: 1,
      topRequiredSkills: ['System Design', 'K8s', 'English C1'],
    })
    expect(text).toContain('Vị trí mục tiêu: Staff Engineer')
    expect(text).toContain('System Design, K8s, English C1')
  })

  it('thiếu vị trí hiện tại thì nói "Chưa khai", không để trống', () => {
    const text = formatCareerReadModelForContext({
      targetRole: 'PM',
      yearsOfExperience: 0,
      experienceCount: 0,
      activeGoalCount: 0,
      topRequiredSkills: [],
    })
    expect(text).toContain('Vị trí hiện tại: Chưa khai')
  })
})

describe('getDomainReadModelForContext', () => {
  it('trụ không thuộc nhóm này → trả null (để bên gọi bỏ qua)', async () => {
    await expect(getDomainReadModelForContext(pool, PERSON, 'learning')).resolves.toBeNull()
    await expect(getDomainReadModelForContext(pool, PERSON, 'general')).resolves.toBeNull()
  })

  it('điều phối đúng trụ work', async () => {
    listWorkProjects.mockResolvedValue([])
    listWorkTasks.mockResolvedValue([])
    const text = await getDomainReadModelForContext(pool, PERSON, 'work')
    expect(text).toContain('[Domain: Work]')
  })
})
