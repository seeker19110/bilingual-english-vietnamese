// apps/dhcb/src/lib/careerApi.test.ts
//
// Mock body PHẢI khớp đúng hình dạng response THẬT của server (bọc trong { profile }/
// { experiences }/{ goals }/{ analysis }… — xem apps/server/src/api/domains/career.ts). Trước
// đây các test này mock response TRẦN (không bọc), nên không hề bắt được lỗi thật: server luôn
// bọc, client luôn gỡ vỏ sai (đọc thẳng response làm dữ liệu) — gây `TypeError: g.map is not a
// function` trên production khi trang Sự nghiệp render danh sách mục tiêu/kinh nghiệm (phát
// hiện qua Sentry + console người dùng gửi, 2026-08-29). Sửa ở đây: mock đúng hình dạng thật.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchCareerProfile,
  saveCareerProfile,
  listCareerExperiences,
  addCareerExperience,
  listCareerGoals,
  createCareerGoal,
  fetchCareerSkillGap,
} from './careerApi'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn().mockResolvedValue({ Authorization: 'Bearer mock-token' }),
}))

describe('careerApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchCareerProfile returns profile on 200', async () => {
    const mockProfile = { targetRole: 'Senior Engineer', yearsOfExperience: 5 }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ profile: mockProfile }),
    } as unknown as Response)

    const res = await fetchCareerProfile()
    expect(res).toEqual(mockProfile)
  })

  it('fetchCareerProfile returns null on 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    } as unknown as Response)

    const res = await fetchCareerProfile()
    expect(res).toBeNull()
  })

  it('saveCareerProfile sends POST with resource=profile', async () => {
    const mockCreated = { id: 'prof-1', targetRole: 'Tech Lead', yearsOfExperience: 7 }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ profile: mockCreated }),
    } as unknown as Response)

    const res = await saveCareerProfile({
      targetRole: 'Tech Lead',
      yearsOfExperience: 7,
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/career',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          resource: 'profile',
          targetRole: 'Tech Lead',
          yearsOfExperience: 7,
        }),
      }),
    )
    expect(res).toEqual(mockCreated)
  })

  it('listCareerExperiences fetches experiences list', async () => {
    const mockExp = [{ id: 'exp-1', company: 'Google', role: 'SWE' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ experiences: mockExp }),
    } as unknown as Response)

    const res = await listCareerExperiences()
    expect(res).toEqual(mockExp)
  })

  it('addCareerExperience posts experience payload', async () => {
    const mockExp = { id: 'exp-2', company: 'OpenAI', role: 'Staff SWE' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ experience: mockExp }),
    } as unknown as Response)

    const res = await addCareerExperience({
      company: 'OpenAI',
      role: 'Staff SWE',
      startDate: '2024-01-01',
    })
    expect(res).toEqual(mockExp)
  })

  it('listCareerGoals fetches goals', async () => {
    const mockGoals = [{ id: 'goal-1', targetTitle: 'CTO' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ goals: mockGoals }),
    } as unknown as Response)

    const res = await listCareerGoals()
    expect(res).toEqual(mockGoals)
  })

  it('createCareerGoal posts goal payload', async () => {
    const mockGoal = { id: 'goal-2', targetTitle: 'Founder' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ goal: mockGoal }),
    } as unknown as Response)

    const res = await createCareerGoal({
      targetTitle: 'Founder',
      skillsRequired: ['Leadership', 'Strategy'],
    })
    expect(res).toEqual(mockGoal)
  })

  it('fetchCareerSkillGap fetches skill gap analysis', async () => {
    const mockGap = { goalId: 'goal-1', gaps: [] }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ analysis: mockGap }),
    } as unknown as Response)

    const res = await fetchCareerSkillGap('goal-1')
    expect(res).toEqual(mockGap)
  })
})
