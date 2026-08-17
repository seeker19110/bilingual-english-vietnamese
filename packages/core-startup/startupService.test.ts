import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  createVenture,
  listVentures,
  updateVentureStage,
  createProblem,
  listProblems,
  createHypothesis,
  updateHypothesisStatus,
  listHypotheses,
  recordEvidence,
  listEvidence,
} from './startupService.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const VENTURE_ID = '22222222-2222-4222-8222-222222222222'
const PROBLEM_ID = '33333333-3333-4333-8333-333333333333'
const HYPOTHESIS_ID = '44444444-4444-4444-8444-444444444444'
const EVIDENCE_ID = '55555555-5555-4555-8555-555555555555'

const mockQuery = vi.fn()
const pool = { query: mockQuery } as unknown as Pool

vi.mock('../core-db/transaction.js', () => ({
  withTransaction: async (_pool: unknown, cb: (client: { query: typeof mockQuery }) => unknown) =>
    cb({ query: mockQuery }),
}))

beforeEach(() => vi.clearAllMocks())

describe('StartupService', () => {
  it('creates and lists ventures', async () => {
    const ventureRow = {
      id: VENTURE_ID,
      person_id: PERSON_ID,
      name: 'LearnAI',
      description: null,
      stage: 'ideation',
      version: 1,
      created_at: new Date('2026-08-17T00:00:00Z'),
      updated_at: new Date('2026-08-17T00:00:00Z'),
    }
    mockQuery.mockResolvedValueOnce({ rows: [ventureRow] })
    const v = await createVenture(pool, PERSON_ID, { name: 'LearnAI' })
    expect(v.name).toBe('LearnAI')
    expect(v.stage).toBe('ideation')

    mockQuery.mockResolvedValueOnce({ rows: [ventureRow] })
    const list = await listVentures(pool, PERSON_ID)
    expect(list.length).toBe(1)
  })

  it('updates venture stage', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: VENTURE_ID }] })
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: VENTURE_ID,
          person_id: PERSON_ID,
          name: 'LearnAI',
          description: null,
          stage: 'validation',
          version: 2,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })
    const v = await updateVentureStage(pool, PERSON_ID, VENTURE_ID, 'validation')
    expect(v.stage).toBe('validation')
  })

  it('creates and lists problems', async () => {
    const problemRow = {
      id: PROBLEM_ID,
      venture_id: VENTURE_ID,
      person_id: PERSON_ID,
      statement: 'No personalized feedback',
      customer_segment: 'Students',
      severity: 'critical',
      evidence_count: 0,
      version: 1,
      created_at: new Date('2026-08-17T00:00:00Z'),
      updated_at: new Date('2026-08-17T00:00:00Z'),
    }
    mockQuery.mockResolvedValueOnce({ rows: [problemRow] })
    const p = await createProblem(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      statement: 'No personalized feedback',
      customerSegment: 'Students',
      severity: 'critical',
    })
    expect(p.severity).toBe('critical')

    mockQuery.mockResolvedValueOnce({ rows: [problemRow] })
    const list = await listProblems(pool, PERSON_ID, VENTURE_ID)
    expect(list.length).toBe(1)
  })

  it('creates and updates hypothesis', async () => {
    const hypRow = {
      id: HYPOTHESIS_ID,
      venture_id: VENTURE_ID,
      person_id: PERSON_ID,
      statement: 'Users pay $10/month',
      hypothesis_type: 'business_model',
      status: 'unverified',
      version: 1,
      created_at: new Date('2026-08-17T00:00:00Z'),
      updated_at: new Date('2026-08-17T00:00:00Z'),
    }
    mockQuery.mockResolvedValueOnce({ rows: [hypRow] })
    const h = await createHypothesis(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      statement: 'Users pay $10/month',
      hypothesisType: 'business_model',
    })
    expect(h.status).toBe('unverified')

    mockQuery.mockResolvedValueOnce({ rows: [{ id: HYPOTHESIS_ID }] })
    mockQuery.mockResolvedValueOnce({
      rows: [{ ...hypRow, status: 'supported', version: 2 }],
    })
    const updated = await updateHypothesisStatus(pool, PERSON_ID, HYPOTHESIS_ID, 'supported')
    expect(updated.status).toBe('supported')

    mockQuery.mockResolvedValueOnce({ rows: [hypRow] })
    const list = await listHypotheses(pool, PERSON_ID, VENTURE_ID)
    expect(list.length).toBe(1)
  })

  it('records evidence with provenance (Gate invariant)', async () => {
    const evidenceRow = {
      id: EVIDENCE_ID,
      venture_id: VENTURE_ID,
      hypothesis_id: HYPOTHESIS_ID,
      person_id: PERSON_ID,
      title: 'User Interview Round 1',
      evidence_type: 'interview',
      provenance: '10 Zoom interviews recorded',
      findings: '8/10 users would pay',
      supports_hypothesis: true,
      collected_at: new Date('2026-08-17T00:00:00Z'),
      created_at: new Date('2026-08-17T00:00:00Z'),
    }
    mockQuery.mockResolvedValueOnce({ rows: [evidenceRow] })
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const ev = await recordEvidence(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      hypothesisId: HYPOTHESIS_ID,
      title: 'User Interview Round 1',
      evidenceType: 'interview',
      provenance: '10 Zoom interviews recorded',
      findings: '8/10 users would pay',
      supportsHypothesis: true,
    })
    expect(ev.provenance).toBe('10 Zoom interviews recorded')
    expect(ev.supportsHypothesis).toBe(true)

    mockQuery.mockResolvedValueOnce({ rows: [evidenceRow] })
    const list = await listEvidence(pool, PERSON_ID, VENTURE_ID)
    expect(list.length).toBe(1)
  })

  it('handles not found errors and filter options', async () => {
    // Venture not found on update
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(updateVentureStage(pool, PERSON_ID, VENTURE_ID, 'scale')).rejects.toThrow(
      'Không tìm thấy Venture',
    )

    // Hypothesis not found on update
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(updateHypothesisStatus(pool, PERSON_ID, HYPOTHESIS_ID, 'refuted')).rejects.toThrow(
      'Không tìm thấy Hypothesis',
    )

    // List hypotheses
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const filteredHyp = await listHypotheses(pool, PERSON_ID, VENTURE_ID)
    expect(filteredHyp.length).toBe(0)

    // List evidence
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const filteredEv = await listEvidence(pool, PERSON_ID, VENTURE_ID)
    expect(filteredEv.length).toBe(0)

    // Venture with description
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: VENTURE_ID,
          person_id: PERSON_ID,
          name: 'Venture With Desc',
          description: 'A great idea',
          stage: 'ideation',
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })
    const vWithDesc = await createVenture(pool, PERSON_ID, {
      name: 'Venture With Desc',
      description: 'A great idea',
    })
    expect(vWithDesc.description).toBe('A great idea')

    // Standalone evidence without hypothesisId
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EVIDENCE_ID,
          venture_id: VENTURE_ID,
          hypothesis_id: null,
          person_id: PERSON_ID,
          title: 'General Market Report',
          evidence_type: 'analytics',
          provenance: 'Statista report 2026',
          findings: 'Market growing at 15% CAGR',
          supports_hypothesis: true,
          collected_at: new Date('2026-08-15T00:00:00Z'),
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })
    const standaloneEv = await recordEvidence(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      title: 'General Market Report',
      evidenceType: 'analytics',
      provenance: 'Statista report 2026',
      findings: 'Market growing at 15% CAGR',
      supportsHypothesis: true,
      collectedAt: '2026-08-15T00:00:00Z',
    })
    expect(standaloneEv.hypothesisId).toBeUndefined()
    expect(standaloneEv.collectedAt).toBe('2026-08-15T00:00:00.000Z')
  })
})

// Nhánh biên: tham số optional vắng/có, cột NULL, not-found, danh sách rỗng.
describe('StartupService — nhánh biên', () => {
  it('tạo venture có description và stage tự chọn', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: VENTURE_ID,
          person_id: PERSON_ID,
          name: 'LearnAI',
          description: 'Gia sư AI cho người Việt',
          stage: 'validation',
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const v = await createVenture(pool, PERSON_ID, {
      name: 'LearnAI',
      description: 'Gia sư AI cho người Việt',
      stage: 'validation',
    })
    expect(v.description).toBe('Gia sư AI cho người Việt')
    expect(mockQuery.mock.calls[0]![1]).toEqual([
      expect.any(String),
      PERSON_ID,
      'LearnAI',
      'Gia sư AI cho người Việt',
      'validation',
    ])
  })

  it('updateVentureStage ném NotFoundError khi venture không thuộc person', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(updateVentureStage(pool, PERSON_ID, VENTURE_ID, 'mvp')).rejects.toThrow(
      'Không tìm thấy Venture',
    )
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  it('updateHypothesisStatus ném NotFoundError khi hypothesis không tồn tại', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(updateHypothesisStatus(pool, PERSON_ID, HYPOTHESIS_ID, 'refuted')).rejects.toThrow(
      'Không tìm thấy Hypothesis',
    )
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  it('listProblems và listHypotheses trả mảng rỗng khi chưa có dữ liệu', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    expect(await listProblems(pool, PERSON_ID, VENTURE_ID)).toEqual([])

    mockQuery.mockResolvedValueOnce({ rows: [] })
    expect(await listHypotheses(pool, PERSON_ID, VENTURE_ID)).toEqual([])
  })

  it('problem đã tạo giữ nguyên evidence_count từ DB', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: PROBLEM_ID,
          venture_id: VENTURE_ID,
          person_id: PERSON_ID,
          statement: 'Người học không có môi trường luyện nói',
          customer_segment: 'Sinh viên',
          severity: 'critical',
          evidence_count: 0,
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const p = await createProblem(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      statement: 'Người học không có môi trường luyện nói',
      customerSegment: 'Sinh viên',
      severity: 'critical',
    })
    expect(p.evidenceCount).toBe(0)
    expect(p.severity).toBe('critical')
  })

  it('createHypothesis luôn khởi tạo trạng thái unverified', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: HYPOTHESIS_ID,
          venture_id: VENTURE_ID,
          person_id: PERSON_ID,
          statement: 'Người dùng sẵn sàng trả 40k/tháng',
          hypothesis_type: 'business_model',
          status: 'unverified',
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const h = await createHypothesis(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      statement: 'Người dùng sẵn sàng trả 40k/tháng',
      hypothesisType: 'business_model',
    })
    expect(h.status).toBe('unverified')
  })

  it('evidence KHÔNG gắn hypothesis → không cập nhật evidence_count, collectedAt mặc định là hiện tại', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EVIDENCE_ID,
          venture_id: VENTURE_ID,
          hypothesis_id: null,
          person_id: PERSON_ID,
          title: 'Khảo sát mở',
          evidence_type: 'survey',
          provenance: '120 phản hồi Google Form',
          findings: '60% muốn luyện nói hằng ngày',
          supports_hypothesis: false,
          collected_at: new Date('2026-08-17T00:00:00Z'),
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const ev = await recordEvidence(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      title: 'Khảo sát mở',
      evidenceType: 'survey',
      provenance: '120 phản hồi Google Form',
      findings: '60% muốn luyện nói hằng ngày',
      supportsHypothesis: false,
    })

    expect(ev.hypothesisId).toBeUndefined()
    // Chỉ 1 câu insert, KHÔNG có câu update evidence_count.
    expect(mockQuery).toHaveBeenCalledTimes(1)
    const params = mockQuery.mock.calls[0]![1] as unknown[]
    expect(params[2]).toBeNull()
    expect(typeof params[9]).toBe('string')
  })

  it('evidence có collectedAt truyền vào thì dùng đúng giá trị đó', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: EVIDENCE_ID,
          venture_id: VENTURE_ID,
          hypothesis_id: HYPOTHESIS_ID,
          person_id: PERSON_ID,
          title: 'Doanh thu thử nghiệm',
          evidence_type: 'revenue',
          provenance: 'Sao kê SePay tháng 8',
          findings: '12 đơn Pro',
          supports_hypothesis: true,
          collected_at: new Date('2026-08-01T00:00:00Z'),
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const ev = await recordEvidence(pool, PERSON_ID, {
      ventureId: VENTURE_ID,
      hypothesisId: HYPOTHESIS_ID,
      title: 'Doanh thu thử nghiệm',
      evidenceType: 'revenue',
      provenance: 'Sao kê SePay tháng 8',
      findings: '12 đơn Pro',
      supportsHypothesis: true,
      collectedAt: '2026-08-01T00:00:00.000Z',
    })

    expect(ev.collectedAt).toBe('2026-08-01T00:00:00.000Z')
    expect((mockQuery.mock.calls[0]![1] as unknown[])[9]).toBe('2026-08-01T00:00:00.000Z')
    // Có hypothesisId → chạy thêm câu update evidence_count.
    expect(mockQuery).toHaveBeenCalledTimes(2)
  })

  it('listEvidence trả mảng rỗng khi chưa có bằng chứng', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    expect(await listEvidence(pool, PERSON_ID, VENTURE_ID)).toEqual([])
  })
})
