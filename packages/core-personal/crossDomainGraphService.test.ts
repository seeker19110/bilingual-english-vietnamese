import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'
import { syncCrossDomainLifeGraph } from './crossDomainGraphService.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const NODE_1 = '22222222-2222-4222-8222-222222222222'
const NODE_2 = '33333333-3333-4333-8333-333333333333'
const EDGE_1 = '44444444-4444-4444-8444-444444444444'

const mockQuery = vi.fn()
const pool = { query: mockQuery } as unknown as Pool

const listCareerGoals = vi.fn()
vi.mock('../core-career/careerService.js', () => ({
  listCareerGoals: (...a: unknown[]) => listCareerGoals(...a),
}))

const getLearningReadModel = vi.fn()
vi.mock('../core-learner/learningReadModelService.js', () => ({
  getLearningReadModel: (...a: unknown[]) => getLearningReadModel(...a),
}))

const listNodes = vi.fn()
const listEdges = vi.fn()
vi.mock('./lifeGraphService.js', () => ({
  listNodes: (...a: unknown[]) => listNodes(...a),
  listEdges: (...a: unknown[]) => listEdges(...a),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('syncCrossDomainLifeGraph', () => {
  it('synchronizes career goals and learning mastery into life graph', async () => {
    listCareerGoals.mockResolvedValueOnce([
      {
        id: 'goal-1',
        personId: PERSON_ID,
        targetTitle: 'Data Analyst',
        skillsRequired: ['SQL', 'English B2'],
        status: 'active',
      },
    ])

    getLearningReadModel.mockResolvedValueOnce({
      currentLevel: 'B2',
    })

    // Mock query returns:
    // 1. ensureNode (Goal) -> not existing -> insert
    // 2. insert Goal
    // 3. ensureNode (SQL) -> not existing -> insert
    // 4. insert SQL
    // 5. ensureEdge (Goal -> SQL requires) -> not existing -> insert
    // 6. insert Edge
    // 7. ensureNode (English B2) -> not existing -> insert
    // 8. insert English B2
    // 9. ensureEdge (Goal -> English requires) -> not existing -> insert
    // 10. insert Edge
    // 11. ensureEdge (English -> Goal supports) -> not existing -> insert
    // 12. insert Edge
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })

    listNodes.mockResolvedValueOnce([
      {
        id: NODE_1,
        personId: PERSON_ID,
        type: 'Goal',
        label: 'Career: Data Analyst',
        createdAt: '2026-08-17T00:00:00Z',
        updatedAt: '2026-08-17T00:00:00Z',
        schemaVersion: 1,
      },
      {
        id: NODE_2,
        personId: PERSON_ID,
        type: 'Skill',
        label: 'English B2',
        createdAt: '2026-08-17T00:00:00Z',
        updatedAt: '2026-08-17T00:00:00Z',
        schemaVersion: 1,
      },
    ])

    listEdges.mockResolvedValueOnce([
      {
        id: EDGE_1,
        personId: PERSON_ID,
        fromNodeId: NODE_1,
        toNodeId: NODE_2,
        relation: 'requires',
        provenance: 'cross_domain_sync',
        createdAt: '2026-08-17T00:00:00Z',
        schemaVersion: 1,
      },
    ])

    const result = await syncCrossDomainLifeGraph(pool, PERSON_ID, 'user-1')

    expect(result.syncSummary.careerGoalsProcessed).toBe(1)
    expect(result.syncSummary.skillsMapped).toBe(2)
    expect(result.syncSummary.learningMasteryAligned).toBe(1)
    expect(result.nodes.length).toBe(2)
    expect(result.edges.length).toBe(1)
    expect(getLearningReadModel).toHaveBeenCalledWith(expect.anything(), {
      personId: PERSON_ID,
      userId: 'user-1',
      subject: 'english',
    })
  })
})

// Nhánh biên: không có goal, node/edge đã tồn tại (idempotent), trình độ chưa đạt mốc thành thạo.
describe('syncCrossDomainLifeGraph — nhánh biên', () => {
  it('không có career goal nào → không đụng graph, summary toàn 0', async () => {
    listCareerGoals.mockResolvedValueOnce([])
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: 'B2' })
    listNodes.mockResolvedValueOnce([])
    listEdges.mockResolvedValueOnce([])

    const result = await syncCrossDomainLifeGraph(pool, PERSON_ID, 'user-1')

    expect(mockQuery).not.toHaveBeenCalled()
    expect(result.syncSummary).toMatchObject({
      careerGoalsProcessed: 0,
      skillsMapped: 0,
      nodesCreatedOrUpdated: 0,
      edgesCreatedOrUpdated: 0,
      learningMasteryAligned: 0,
    })
  })

  it('goal không có skill nào → chỉ tạo node Goal', async () => {
    listCareerGoals.mockResolvedValueOnce([
      {
        id: 'goal-1',
        personId: PERSON_ID,
        targetTitle: 'Tech Lead',
        skillsRequired: [],
        status: 'active',
      },
    ])
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: 'B1' })
    // ensureNode: select rỗng → insert.
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] })
    listNodes.mockResolvedValueOnce([])
    listEdges.mockResolvedValueOnce([])

    const result = await syncCrossDomainLifeGraph(pool, PERSON_ID, 'user-1')
    expect(result.syncSummary.nodesCreatedOrUpdated).toBe(1)
    expect(result.syncSummary.skillsMapped).toBe(0)
  })

  it('node và edge đã tồn tại → không tạo mới (đồng bộ idempotent)', async () => {
    listCareerGoals.mockResolvedValueOnce([
      {
        id: 'goal-1',
        personId: PERSON_ID,
        targetTitle: 'Data Analyst',
        skillsRequired: ['SQL'],
        status: 'active',
      },
    ])
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: 'B2' })

    mockQuery
      // ensureNode Goal → đã có.
      .mockResolvedValueOnce({ rows: [{ id: NODE_1 }] })
      // ensureNode Skill SQL → đã có.
      .mockResolvedValueOnce({ rows: [{ id: NODE_2 }] })
      // ensureEdge requires → đã có.
      .mockResolvedValueOnce({ rows: [{ id: EDGE_1 }] })

    listNodes.mockResolvedValueOnce([])
    listEdges.mockResolvedValueOnce([])

    const result = await syncCrossDomainLifeGraph(pool, PERSON_ID, 'user-1')

    // Chỉ 3 câu select, không có câu insert nào.
    expect(mockQuery).toHaveBeenCalledTimes(3)
    expect(result.syncSummary.nodesCreatedOrUpdated).toBe(0)
    expect(result.syncSummary.edgesCreatedOrUpdated).toBe(0)
    expect(result.syncSummary.skillsMapped).toBe(1)
  })

  it('kỹ năng tiếng Anh nhưng trình độ dưới B2 → không tạo cạnh supports', async () => {
    listCareerGoals.mockResolvedValueOnce([
      {
        id: 'goal-1',
        personId: PERSON_ID,
        targetTitle: 'BA',
        skillsRequired: ['IELTS Writing'],
        status: 'active',
      },
    ])
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: 'A2' })

    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: NODE_1 }] })
      .mockResolvedValueOnce({ rows: [{ id: NODE_2 }] })
      .mockResolvedValueOnce({ rows: [{ id: EDGE_1 }] })

    listNodes.mockResolvedValueOnce([])
    listEdges.mockResolvedValueOnce([])

    const result = await syncCrossDomainLifeGraph(pool, PERSON_ID, 'user-1')
    expect(result.syncSummary.learningMasteryAligned).toBe(0)
    expect(mockQuery).toHaveBeenCalledTimes(3)
  })

  it('chưa có đánh giá trình độ (currentLevel null) → bỏ qua bước đối chiếu mastery', async () => {
    listCareerGoals.mockResolvedValueOnce([
      {
        id: 'goal-1',
        personId: PERSON_ID,
        targetTitle: 'BA',
        skillsRequired: ['Tiếng Anh giao tiếp'],
        status: 'active',
      },
    ])
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: null })

    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: NODE_1 }] })
      .mockResolvedValueOnce({ rows: [{ id: NODE_2 }] })
      .mockResolvedValueOnce({ rows: [{ id: EDGE_1 }] })

    listNodes.mockResolvedValueOnce([])
    listEdges.mockResolvedValueOnce([])

    const result = await syncCrossDomainLifeGraph(pool, PERSON_ID, 'user-1')
    expect(result.syncSummary.learningMasteryAligned).toBe(0)
  })

  it('kỹ năng tiếng Anh đạt mốc nhưng cạnh supports đã tồn tại → đếm mastery nhưng không tạo cạnh', async () => {
    listCareerGoals.mockResolvedValueOnce([
      {
        id: 'goal-1',
        personId: PERSON_ID,
        targetTitle: 'BA',
        skillsRequired: ['TOEIC 900'],
        status: 'active',
      },
    ])
    getLearningReadModel.mockResolvedValueOnce({ currentLevel: 'C1' })

    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: NODE_1 }] })
      .mockResolvedValueOnce({ rows: [{ id: NODE_2 }] })
      .mockResolvedValueOnce({ rows: [{ id: EDGE_1 }] })
      .mockResolvedValueOnce({ rows: [{ id: EDGE_1 }] })

    listNodes.mockResolvedValueOnce([])
    listEdges.mockResolvedValueOnce([])

    const result = await syncCrossDomainLifeGraph(pool, PERSON_ID, 'user-1')
    expect(result.syncSummary.learningMasteryAligned).toBe(1)
    expect(result.syncSummary.edgesCreatedOrUpdated).toBe(0)
    expect(mockQuery).toHaveBeenCalledTimes(4)
  })
})
