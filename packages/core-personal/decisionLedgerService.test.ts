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
