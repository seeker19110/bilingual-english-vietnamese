// apps/dhcb/src/lib/subjectApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listSubjects, getSubjectDetails } from './subjectApi'

describe('subjectApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('listSubjects should fetch all subjects', async () => {
    const mockSubjects = [
      { id: 'english', label: 'Tiếng Anh', category: 'language' },
      { id: 'mathematics', label: 'Toán học', category: 'stem' },
    ]
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ subjects: mockSubjects }),
    } as unknown as Response)

    const result = await listSubjects()
    expect(result).toHaveLength(2)
    expect(result[0]!.id).toBe('english')
    expect(global.fetch).toHaveBeenCalledWith('/api/subjects', expect.any(Object))
  })

  it('listSubjects should filter by category', async () => {
    const mockStem = [{ id: 'physics', label: 'Vật lý', category: 'stem' }]
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ subjects: mockStem }),
    } as unknown as Response)

    const result = await listSubjects('stem')
    expect(result).toHaveLength(1)
    expect(global.fetch).toHaveBeenCalledWith('/api/subjects?category=stem', expect.any(Object))
  })

  it('getSubjectDetails should fetch details by id', async () => {
    const mockSubject = {
      id: 'chemistry',
      label: 'Hóa học',
      category: 'stem',
      standardLevels: ['grade_10', 'grade_11', 'grade_12'],
    }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ subject: mockSubject }),
    } as unknown as Response)

    const result = await getSubjectDetails('chemistry')
    expect(result.id).toBe('chemistry')
    expect(result.label).toBe('Hóa học')
    expect(global.fetch).toHaveBeenCalledWith('/api/subjects?id=chemistry', expect.any(Object))
  })

  it('should throw on error response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as unknown as Response)

    await expect(getSubjectDetails('unknown')).rejects.toThrow('Failed to get subject details')
  })
})
