// apps/dhcb/src/lib/stemScratchpadApi.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createStemProblemApi,
  fetchSampleStemProblems,
  getStemHintApi,
  validateStemStepApi,
} from './stemScratchpadApi.js'

describe('stemScratchpadApi Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.setItem('gsa_session_token_v1', 'fake-token-123')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('fetches sample stem problems successfully', async () => {
    const mockProblems = [
      {
        id: 'p1',
        subject: 'math' as const,
        title: 'Solve quadratic',
        problemStatement: 'x^2 - 5x + 6 = 0',
      },
    ]

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ problems: mockProblems }),
    } as unknown as Response)

    const problems = await fetchSampleStemProblems()
    expect(problems).toEqual(mockProblems)
  })

  it('throws error when fetching stem problems fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response)

    await expect(fetchSampleStemProblems()).rejects.toThrow('Lỗi tải danh sách bài tập STEM: 500')
  })

  it('creates stem problem successfully', async () => {
    const mockProblem = {
      id: 'p2',
      subject: 'physics' as const,
      title: 'Newton law',
      problemStatement: 'F = ma',
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ problem: mockProblem }),
    } as unknown as Response)

    const problem = await createStemProblemApi({
      subject: 'physics',
      title: 'Newton law',
      problemStatement: 'F = ma',
    })
    expect(problem).toEqual(mockProblem)
  })

  it('throws error when creating problem fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as unknown as Response)

    await expect(
      createStemProblemApi({
        subject: 'physics',
        title: 'Newton law',
        problemStatement: 'F = ma',
      }),
    ).rejects.toThrow('Lỗi tạo bài tập STEM: 400')
  })

  it('validates stem step successfully', async () => {
    const mockResult = {
      step: { stepNumber: 1, latexInput: 'x = 2' },
      validation: { isValid: true },
      isSolved: false,
      problem: { id: 'p1' },
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    } as unknown as Response)

    const res = await validateStemStepApi({ problemId: 'p1', latexInput: 'x = 2' })
    expect(res).toEqual(mockResult)
  })

  it('throws error when validating stem step fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as unknown as Response)

    await expect(validateStemStepApi({ problemId: 'p1', latexInput: 'x = 2' })).rejects.toThrow(
      'Lỗi kiểm tra bước giải: 400',
    )
  })

  it('gets stem hint successfully', async () => {
    const mockHint = {
      hint: { hintText: 'Try factoring', suggestedFormula: '(x-2)(x-3)' },
      hintsUsed: 1,
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockHint,
    } as unknown as Response)

    const res = await getStemHintApi('p1')
    expect(res).toEqual(mockHint)
  })

  it('throws error when getting hint fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response)

    await expect(getStemHintApi('p1')).rejects.toThrow('Lỗi lấy gợi ý: 500')
  })
})
