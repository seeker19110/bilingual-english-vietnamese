// packages/core-personal/decisionLedgerService.test.ts — Unit tests for Decision Ledger & Outcome Loop.
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Pool } from 'pg'
import {
  createDecision,
  decideDecision,
  recordOutcome,
  markReviewDueDecisions,
  reviewDecision,
  supersedeDecision,
  getDecision,
  listDecisions,
} from './decisionLedgerService.js'
import { ConflictError, NotFoundError, ValidationError } from '../core-errors/appError.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const DECISION_ID = '22222222-2222-4222-8222-222222222222'

const mockQuery = vi.fn()
const mockClient = { query: mockQuery }

vi.mock('../core-db/transaction.js', () => ({
  withTransaction: async (_pool: unknown, fn: (client: typeof mockClient) => Promise<unknown>) =>
    fn(mockClient),
}))

const pool = { query: mockQuery } as unknown as Pool

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: DECISION_ID,
    person_id: PERSON_ID,
    problem: 'Nên thi IELTS hay TOEIC?',
    domain: 'learning',
    options: [
      { id: 'opt_ielts', summary: 'Học và thi IELTS 7.0' },
      { id: 'opt_toeic', summary: 'Học và thi TOEIC 850' },
    ],
    assumptions: [],
    evidence: [],
    tradeoffs: ['IELTS tốn thời gian hơn nhưng giá trị du học cao hơn'],
    selected_option_id: null,
    rationale: null,
    expected_outcomes: [{ description: 'Đạt target trong 6 tháng' }],
    actual_outcomes: [],
    status: 'open',
    review_at: null,
    version: 1,
    created_at: new Date('2026-08-17T00:00:00Z'),
    updated_at: new Date('2026-08-17T00:00:00Z'),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createDecision', () => {
  it('creates decision in open status', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeRow()] }).mockResolvedValueOnce({ rows: [] }) // audit

    const res = await createDecision(pool, {
      personId: PERSON_ID,
      problem: 'Nên thi IELTS hay TOEIC?',
      domain: 'learning',
      options: [
        { id: 'opt_ielts', summary: 'Học và thi IELTS 7.0' },
        { id: 'opt_toeic', summary: 'Học và thi TOEIC 850' },
      ],
    })

    expect(res.id).toBe(DECISION_ID)
    expect(res.status).toBe('open')
    expect(res.version).toBe(1)
  })

  it('rejects decision without options with ValidationError', async () => {
    await expect(
      createDecision(pool, {
        personId: PERSON_ID,
        problem: 'No options',
        options: [],
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })
})

describe('decideDecision', () => {
  it('moves decision to decided status with selectedOptionId', async () => {
    const decidedRow = makeRow({
      selected_option_id: 'opt_ielts',
      rationale: 'Phù hợp mục tiêu du học',
      status: 'decided',
      version: 2,
      review_at: new Date('2026-12-01T00:00:00Z'),
    })

    mockQuery
      .mockResolvedValueOnce({ rows: [makeRow()] }) // lock
      .mockResolvedValueOnce({ rows: [decidedRow] }) // update
      .mockResolvedValueOnce({ rows: [] }) // audit

    const res = await decideDecision(pool, PERSON_ID, DECISION_ID, {
      selectedOptionId: 'opt_ielts',
      rationale: 'Phù hợp mục tiêu du học',
      reviewAt: '2026-12-01T00:00:00Z',
      expectedVersion: 1,
      actor: 'user:user-1',
    })

    expect(res.status).toBe('decided')
    expect(res.selectedOptionId).toBe('opt_ielts')
    expect(res.version).toBe(2)
  })

  it('rejects non-existent selectedOptionId with ValidationError', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeRow()] })

    await expect(
      decideDecision(pool, PERSON_ID, DECISION_ID, {
        selectedOptionId: 'non_existent_option',
        expectedVersion: 1,
        actor: 'user:user-1',
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('detects version conflict', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ version: 2 })] })

    await expect(
      decideDecision(pool, PERSON_ID, DECISION_ID, {
        selectedOptionId: 'opt_ielts',
        expectedVersion: 1,
        actor: 'user:user-1',
      }),
    ).rejects.toBeInstanceOf(ConflictError)
  })
})

describe('recordOutcome', () => {
  it('records outcome observation successfully on decided decision', async () => {
    const decidedRow = makeRow({ status: 'decided', version: 2 })
    const outcomeRow = makeRow({
      status: 'decided',
      version: 3,
      actual_outcomes: [
        {
          description: 'Đã thi thử đạt IELTS 6.5 sau 3 tháng',
          observedAt: '2026-10-15T00:00:00Z',
          matchedExpectation: true,
        },
      ],
    })

    mockQuery
      .mockResolvedValueOnce({ rows: [decidedRow] })
      .mockResolvedValueOnce({ rows: [outcomeRow] })
      .mockResolvedValueOnce({ rows: [] })

    const res = await recordOutcome(pool, PERSON_ID, DECISION_ID, {
      observation: {
        description: 'Đã thi thử đạt IELTS 6.5 sau 3 tháng',
        observedAt: '2026-10-15T00:00:00Z',
        matchedExpectation: true,
      },
      expectedVersion: 2,
      actor: 'user:user-1',
    })

    expect(res.actualOutcomes?.length).toBe(1)
    expect(res.actualOutcomes?.[0]?.matchedExpectation).toBe(true)
    expect(res.version).toBe(3)
  })
})

describe('markReviewDueDecisions', () => {
  it('marks passed review_at decisions as review_due', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 3 })
    const count = await markReviewDueDecisions(pool, new Date())
    expect(count).toBe(3)
  })
})

describe('reviewDecision', () => {
  it('closes decision into reviewed status', async () => {
    const reviewDueRow = makeRow({ status: 'review_due', version: 3 })
    const reviewedRow = makeRow({ status: 'reviewed', version: 4 })

    mockQuery
      .mockResolvedValueOnce({ rows: [reviewDueRow] })
      .mockResolvedValueOnce({ rows: [reviewedRow] })
      .mockResolvedValueOnce({ rows: [] })

    const res = await reviewDecision(pool, PERSON_ID, DECISION_ID, {
      resolutionSummary: 'Mục tiêu hoàn thành tốt',
      expectedVersion: 3,
      actor: 'user:user-1',
    })

    expect(res.status).toBe('reviewed')
    expect(res.version).toBe(4)
  })
})

describe('supersedeDecision', () => {
  it('marks old decision as superseded', async () => {
    const current = makeRow({ status: 'decided', version: 2 })
    const superseded = makeRow({ status: 'superseded', version: 3 })

    mockQuery
      .mockResolvedValueOnce({ rows: [current] })
      .mockResolvedValueOnce({ rows: [superseded] })
      .mockResolvedValueOnce({ rows: [] })

    const res = await supersedeDecision(
      pool,
      PERSON_ID,
      DECISION_ID,
      '33333333-3333-4333-8333-333333333333',
      2,
      'user:user-1',
    )

    expect(res.status).toBe('superseded')
    expect(res.version).toBe(3)
  })
})

describe('getDecision & listDecisions', () => {
  it('retrieves single decision', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeRow()] })
    const res = await getDecision(pool, PERSON_ID, DECISION_ID)
    expect(res.id).toBe(DECISION_ID)
  })

  it('throws NotFoundError if decision does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(getDecision(pool, PERSON_ID, DECISION_ID)).rejects.toBeInstanceOf(NotFoundError)
  })

  it('lists decisions with filters', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeRow()] })
    const list = await listDecisions(pool, PERSON_ID, { status: 'open', domain: 'learning' })
    expect(list.length).toBe(1)
  })
})

// Nhánh biên: not-found, sai trạng thái, cột NULL, tham số optional, clamp limit.
describe('DecisionLedger — nhánh biên', () => {
  it('createDecision từ chối khi options là undefined (dữ liệu ngoài không đúng kiểu)', async () => {
    await expect(
      createDecision(pool, {
        personId: PERSON_ID,
        problem: 'Thiếu options',
      } as unknown as Parameters<typeof createDecision>[1]),
    ).rejects.toBeInstanceOf(ValidationError)
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('createDecision không truyền domain/assumptions/evidence/tradeoffs → gửi mảng rỗng và domain null', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [makeRow({ domain: null })] })
      .mockResolvedValueOnce({ rows: [] })

    const res = await createDecision(pool, {
      personId: PERSON_ID,
      problem: 'Nên thi IELTS hay TOEIC?',
      options: [{ id: 'opt_ielts', summary: 'Học và thi IELTS 7.0' }],
    })

    expect(res.domain).toBeUndefined()
    const params = mockQuery.mock.calls[0]![1] as unknown[]
    expect(params[3]).toBeNull()
    expect(params[5]).toBe('[]')
    expect(params[6]).toBe('[]')
    expect(params[7]).toBe('[]')
    expect(params[8]).toBe('[]')
  })

  it('createDecision ném lỗi khi insert không trả về dòng nào', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(
      createDecision(pool, {
        personId: PERSON_ID,
        problem: 'Insert hỏng',
        options: [{ id: 'a', summary: 'A' }],
      }),
    ).rejects.toThrow('Không thể tạo DecisionRecord')
  })

  it('decideDecision ném NotFoundError khi không có bản ghi', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(
      decideDecision(pool, PERSON_ID, DECISION_ID, {
        selectedOptionId: 'opt_ielts',
        expectedVersion: 1,
        actor: 'user:user-1',
      }),
    ).rejects.toThrow('Không tìm thấy DecisionRecord')
  })

  it('decideDecision từ chối khi decision đã rời trạng thái open', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ status: 'decided' })] })
    await expect(
      decideDecision(pool, PERSON_ID, DECISION_ID, {
        selectedOptionId: 'opt_ielts',
        expectedVersion: 1,
        actor: 'user:user-1',
      }),
    ).rejects.toThrow('Decision không ở trạng thái open (status=decided)')
  })

  it('decideDecision không truyền rationale/reviewAt/expectedOutcomes → gửi null', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [makeRow()] })
      .mockResolvedValueOnce({
        rows: [makeRow({ selected_option_id: 'opt_ielts', status: 'decided', version: 2 })],
      })
      .mockResolvedValueOnce({ rows: [] })

    const res = await decideDecision(pool, PERSON_ID, DECISION_ID, {
      selectedOptionId: 'opt_ielts',
      expectedVersion: 1,
      actor: 'user:user-1',
    })

    expect(res.rationale).toBeUndefined()
    expect(res.reviewAt).toBeUndefined()
    const params = mockQuery.mock.calls[1]![1] as unknown[]
    expect(params[1]).toBeNull()
    expect(params[2]).toBeNull()
    expect(params[3]).toBeNull()
  })

  it('decideDecision truyền expectedOutcomes → serialize JSON, reviewAt → Date', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [makeRow()] })
      .mockResolvedValueOnce({
        rows: [makeRow({ selected_option_id: 'opt_ielts', status: 'decided', version: 2 })],
      })
      .mockResolvedValueOnce({ rows: [] })

    await decideDecision(pool, PERSON_ID, DECISION_ID, {
      selectedOptionId: 'opt_ielts',
      expectedOutcomes: [{ description: 'Đạt 7.0', expectedBy: '2027-02-01T00:00:00Z' }],
      reviewAt: '2026-12-01T00:00:00Z',
      expectedVersion: 1,
      actor: 'user:user-1',
    })

    const params = mockQuery.mock.calls[1]![1] as unknown[]
    expect(params[2]).toContain('Đạt 7.0')
    expect(params[3]).toBeInstanceOf(Date)
  })

  it('decideDecision ném lỗi khi câu update không trả dòng nào', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeRow()] }).mockResolvedValueOnce({ rows: [] })
    await expect(
      decideDecision(pool, PERSON_ID, DECISION_ID, {
        selectedOptionId: 'opt_ielts',
        expectedVersion: 1,
        actor: 'user:user-1',
      }),
    ).rejects.toThrow('Không thể cập nhật DecisionRecord decide')
  })

  it('recordOutcome ném NotFoundError và ConflictError đúng nhánh', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(
      recordOutcome(pool, PERSON_ID, DECISION_ID, {
        observation: {
          description: 'x',
          observedAt: '2026-10-15T00:00:00Z',
          matchedExpectation: true,
        },
        expectedVersion: 2,
        actor: 'user:user-1',
      }),
    ).rejects.toThrow('Không tìm thấy DecisionRecord')

    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ status: 'decided', version: 5 })] })
    await expect(
      recordOutcome(pool, PERSON_ID, DECISION_ID, {
        observation: {
          description: 'x',
          observedAt: '2026-10-15T00:00:00Z',
          matchedExpectation: true,
        },
        expectedVersion: 2,
        actor: 'user:user-1',
      }),
    ).rejects.toBeInstanceOf(ConflictError)
  })

  it('recordOutcome từ chối decision còn ở trạng thái open', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ status: 'open', version: 1 })] })
    await expect(
      recordOutcome(pool, PERSON_ID, DECISION_ID, {
        observation: {
          description: 'x',
          observedAt: '2026-10-15T00:00:00Z',
          matchedExpectation: false,
        },
        expectedVersion: 1,
        actor: 'user:user-1',
      }),
    ).rejects.toThrow('Không thể ghi nhận kết quả cho decision ở trạng thái open')
  })

  it('recordOutcome nối tiếp quan sát khi actual_outcomes không phải mảng (NULL từ DB)', async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [makeRow({ status: 'review_due', version: 3, actual_outcomes: null })],
      })
      .mockResolvedValueOnce({
        rows: [
          makeRow({
            status: 'review_due',
            version: 4,
            actual_outcomes: [
              {
                description: 'Quan sát 1',
                observedAt: '2026-10-15T00:00:00Z',
                matchedExpectation: false,
              },
            ],
          }),
        ],
      })
      .mockResolvedValueOnce({ rows: [] })

    const res = await recordOutcome(pool, PERSON_ID, DECISION_ID, {
      observation: {
        description: 'Quan sát 1',
        observedAt: '2026-10-15T00:00:00Z',
        matchedExpectation: false,
      },
      expectedVersion: 3,
      actor: 'user:user-1',
    })

    expect(res.actualOutcomes?.length).toBe(1)
    // Mảng gửi xuống DB chỉ chứa đúng quan sát mới (không kế thừa gì từ NULL).
    expect(JSON.parse((mockQuery.mock.calls[1]![1] as unknown[])[0] as string)).toHaveLength(1)
  })

  it('recordOutcome ném lỗi khi update không trả dòng nào', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [makeRow({ status: 'decided', version: 2 })] })
      .mockResolvedValueOnce({ rows: [] })
    await expect(
      recordOutcome(pool, PERSON_ID, DECISION_ID, {
        observation: {
          description: 'x',
          observedAt: '2026-10-15T00:00:00Z',
          matchedExpectation: true,
        },
        expectedVersion: 2,
        actor: 'user:user-1',
      }),
    ).rejects.toThrow('Không thể cập nhật DecisionRecord outcome')
  })

  it('markReviewDueDecisions trả 0 khi rowCount là null, và dùng thời điểm hiện tại nếu không truyền', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: null })
    expect(await markReviewDueDecisions(pool)).toBe(0)
    expect((mockQuery.mock.calls[0]![1] as unknown[])[0]).toBeInstanceOf(Date)
  })

  it('reviewDecision: not-found, sai version, sai trạng thái, update rỗng', async () => {
    const input = {
      resolutionSummary: 'Xong',
      expectedVersion: 3,
      actor: 'user:user-1',
    }

    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(reviewDecision(pool, PERSON_ID, DECISION_ID, input)).rejects.toThrow(
      'Không tìm thấy DecisionRecord',
    )

    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ status: 'decided', version: 9 })] })
    await expect(reviewDecision(pool, PERSON_ID, DECISION_ID, input)).rejects.toBeInstanceOf(
      ConflictError,
    )

    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ status: 'open', version: 3 })] })
    await expect(reviewDecision(pool, PERSON_ID, DECISION_ID, input)).rejects.toThrow(
      'Decision không ở trạng thái cần review (status=open)',
    )

    mockQuery
      .mockResolvedValueOnce({ rows: [makeRow({ status: 'decided', version: 3 })] })
      .mockResolvedValueOnce({ rows: [] })
    await expect(reviewDecision(pool, PERSON_ID, DECISION_ID, input)).rejects.toThrow(
      'Không thể cập nhật DecisionRecord review',
    )
  })

  it('supersedeDecision: not-found, sai version, update rỗng', async () => {
    const NEW_ID = '33333333-3333-4333-8333-333333333333'

    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(
      supersedeDecision(pool, PERSON_ID, DECISION_ID, NEW_ID, 2, 'user:user-1'),
    ).rejects.toThrow('Không tìm thấy DecisionRecord cũ')

    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ status: 'decided', version: 7 })] })
    await expect(
      supersedeDecision(pool, PERSON_ID, DECISION_ID, NEW_ID, 2, 'user:user-1'),
    ).rejects.toBeInstanceOf(ConflictError)

    mockQuery
      .mockResolvedValueOnce({ rows: [makeRow({ status: 'decided', version: 2 })] })
      .mockResolvedValueOnce({ rows: [] })
    await expect(
      supersedeDecision(pool, PERSON_ID, DECISION_ID, NEW_ID, 2, 'user:user-1'),
    ).rejects.toThrow('Không thể cập nhật DecisionRecord supersede')
  })

  it('getDecision ném NotFoundError khi không có bản ghi', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(getDecision(pool, PERSON_ID, DECISION_ID)).rejects.toThrow(
      'Không tìm thấy DecisionRecord',
    )
  })

  it('listDecisions không truyền options → chỉ lọc person_id, limit mặc định 50', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const list = await listDecisions(pool, PERSON_ID)
    expect(list).toEqual([])
    const [sql, params] = mockQuery.mock.calls[0]! as [string, unknown[]]
    expect(sql).not.toContain('status =')
    expect(sql).not.toContain('domain =')
    expect(params).toEqual([PERSON_ID, 50])
  })

  it('listDecisions kẹp limit vào khoảng 1..100', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await listDecisions(pool, PERSON_ID, { limit: 999 })
    expect((mockQuery.mock.calls[0]![1] as unknown[])[1]).toBe(100)

    mockQuery.mockResolvedValueOnce({ rows: [] })
    await listDecisions(pool, PERSON_ID, { limit: 0 })
    expect((mockQuery.mock.calls[1]![1] as unknown[])[1]).toBe(1)
  })

  it('listDecisions chỉ lọc domain → placeholder lùi về $2', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await listDecisions(pool, PERSON_ID, { domain: 'career' })
    const [sql, params] = mockQuery.mock.calls[0]! as [string, unknown[]]
    expect(sql).toContain('domain = $2')
    expect(params).toEqual([PERSON_ID, 'career', 50])
  })
})

describe('toDecisionRecord — cột actual_outcomes NULL', () => {
  it('bỏ hẳn actualOutcomes khi DB trả NULL', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ actual_outcomes: null })] })
    const res = await getDecision(pool, PERSON_ID, DECISION_ID)
    expect(res.actualOutcomes).toBeUndefined()
  })
})

describe('decisionLedgerService error & conflict branches', () => {
  it('decideDecision errors: not found, version conflict, not open, invalid option', async () => {
    // Not found
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(
      decideDecision(pool, PERSON_ID, DECISION_ID, {
        selectedOptionId: 'opt_1',
        expectedVersion: 1,
        actor: 'user',
      }),
    ).rejects.toBeInstanceOf(NotFoundError)

    // Version conflict
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ version: 2 })] })
    await expect(
      decideDecision(pool, PERSON_ID, DECISION_ID, {
        selectedOptionId: 'opt_1',
        expectedVersion: 1,
        actor: 'user',
      }),
    ).rejects.toBeInstanceOf(ConflictError)

    // Not open status
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ status: 'decided', version: 1 })] })
    await expect(
      decideDecision(pool, PERSON_ID, DECISION_ID, {
        selectedOptionId: 'opt_1',
        expectedVersion: 1,
        actor: 'user',
      }),
    ).rejects.toBeInstanceOf(ConflictError)

    // Invalid option id
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ version: 1 })] })
    await expect(
      decideDecision(pool, PERSON_ID, DECISION_ID, {
        selectedOptionId: 'nonexistent_option',
        expectedVersion: 1,
        actor: 'user',
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('recordOutcome errors: not found, version conflict, wrong status', async () => {
    const obs = {
      description: 'Obs',
      observedAt: new Date().toISOString(),
      matchedExpectation: true,
    }
    // Not found
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(
      recordOutcome(pool, PERSON_ID, DECISION_ID, {
        observation: obs,
        expectedVersion: 1,
        actor: 'user',
      }),
    ).rejects.toBeInstanceOf(NotFoundError)

    // Version conflict
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ version: 2 })] })
    await expect(
      recordOutcome(pool, PERSON_ID, DECISION_ID, {
        observation: obs,
        expectedVersion: 1,
        actor: 'user',
      }),
    ).rejects.toBeInstanceOf(ConflictError)

    // Wrong status (open)
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ status: 'open', version: 1 })] })
    await expect(
      recordOutcome(pool, PERSON_ID, DECISION_ID, {
        observation: obs,
        expectedVersion: 1,
        actor: 'user',
      }),
    ).rejects.toBeInstanceOf(ConflictError)
  })

  it('reviewDecision errors: not found, version conflict, wrong status', async () => {
    // Not found
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(
      reviewDecision(pool, PERSON_ID, DECISION_ID, {
        resolutionSummary: 'Done',
        expectedVersion: 1,
        actor: 'user',
      }),
    ).rejects.toBeInstanceOf(NotFoundError)

    // Version conflict
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ version: 2 })] })
    await expect(
      reviewDecision(pool, PERSON_ID, DECISION_ID, {
        resolutionSummary: 'Done',
        expectedVersion: 1,
        actor: 'user',
      }),
    ).rejects.toBeInstanceOf(ConflictError)

    // Wrong status (open)
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ status: 'open', version: 1 })] })
    await expect(
      reviewDecision(pool, PERSON_ID, DECISION_ID, {
        resolutionSummary: 'Done',
        expectedVersion: 1,
        actor: 'user',
      }),
    ).rejects.toBeInstanceOf(ConflictError)
  })

  it('supersedeDecision errors: not found, version conflict, already superseded', async () => {
    // Not found
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(
      supersedeDecision(pool, PERSON_ID, DECISION_ID, 'new-id', 1, 'user'),
    ).rejects.toBeInstanceOf(NotFoundError)

    // Version conflict
    mockQuery.mockResolvedValueOnce({ rows: [makeRow({ version: 2 })] })
    await expect(
      supersedeDecision(pool, PERSON_ID, DECISION_ID, 'new-id', 1, 'user'),
    ).rejects.toBeInstanceOf(ConflictError)
  })
})
