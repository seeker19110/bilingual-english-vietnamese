import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Pool } from 'pg'
import { buildContextPackage } from './contextEngine.js'

const PERSON = '11111111-1111-4111-8111-111111111111'
const GOAL_NODE = '22222222-2222-4222-8222-222222222222'
const FACT_ID = '33333333-3333-4333-8333-333333333333'
const MEMORY_ID = '44444444-4444-4444-8444-444444444444'

const consents = vi.hoisted(() => ({
  isConsentActive: vi.fn(),
}))
vi.mock('./consentService.js', () => ({
  isConsentActive: (...a: unknown[]) => consents.isConsentActive(...a),
}))

const policies = vi.hoisted(() => ({
  resolveAuthority: vi.fn(),
}))
vi.mock('./policyService.js', () => ({
  resolveAuthority: (...a: unknown[]) => policies.resolveAuthority(...a),
}))

const lifeGraph = vi.hoisted(() => ({
  listNodes: vi.fn(),
}))
vi.mock('./lifeGraphService.js', () => ({
  listNodes: (...a: unknown[]) => lifeGraph.listNodes(...a),
}))

const personService = vi.hoisted(() => ({
  listFacts: vi.fn(),
}))
vi.mock('./personService.js', () => ({
  listFacts: (...a: unknown[]) => personService.listFacts(...a),
}))

const memoryService = vi.hoisted(() => ({
  listMemoryRecords: vi.fn(),
}))
vi.mock('./memoryService.js', () => ({
  listMemoryRecords: (...a: unknown[]) => memoryService.listMemoryRecords(...a),
}))

const mockPool = {} as Pool

beforeEach(() => {
  vi.clearAllMocks()
  consents.isConsentActive.mockResolvedValue(true)
  policies.resolveAuthority.mockResolvedValue(null)
  lifeGraph.listNodes.mockResolvedValue([
    {
      value: {
        id: GOAL_NODE,
        type: 'Goal',
        label: 'Achieve IELTS 7.5',
        archivedAt: null,
      },
      version: 1,
    },
  ])
  personService.listFacts.mockResolvedValue([
    {
      id: FACT_ID,
      key: 'learning_style',
      value: 'visual',
      origin: 'user_declared',
      sensitivity: 'personal',
      supersededBy: null,
    },
  ])
  memoryService.listMemoryRecords.mockImplementation(async (_pool, _personId, opts) => {
    if (opts?.namespace === 'semantic') {
      return [
        {
          id: MEMORY_ID,
          namespace: 'semantic',
          content: 'Prefers reading articles about technology',
          provenance: 'user_declared',
          sensitivity: 'personal',
        },
      ]
    }
    return []
  })
})

describe('ContextEngine - buildContextPackage', () => {
  it('builds a full ContextPackage with correct selection order', async () => {
    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-1',
      requestText: 'Explain the difference between present perfect and past simple',
      purpose: 'tutoring',
      domain: 'learning',
      domainState: {
        sourceId: '55555555-5555-4555-8555-555555555555',
        content: 'CEFR B1, 5-day streak',
        provenance: 'learning_profile:state',
      },
    })

    expect(pkg.personId).toBe(PERSON)
    expect(pkg.requestId).toBe('req-1')
    expect(pkg.tokenUsed).toBeLessThanOrEqual(pkg.tokenBudget)

    const sourceTypes = pkg.items.map((i) => i.sourceType)
    expect(sourceTypes).toEqual([
      'current_request',
      'active_goal_or_project',
      'authoritative_domain_state',
      'user_declared_fact',
      'validated_derived_memory',
    ])
  })

  it('omits items when consent is revoked / inactive (GATE V2-04)', async () => {
    consents.isConsentActive.mockImplementation(async (_pool, _personId, scope) => {
      // Life graph consent revoked
      if (scope === 'life_graph') return false
      return true
    })

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-2',
      requestText: 'What should I study next?',
      purpose: 'tutoring',
    })

    const hasGoal = pkg.items.some((i) => i.sourceType === 'active_goal_or_project')
    expect(hasGoal).toBe(false)
  })

  it('omits items with sensitivity exceeding maxSensitivity threshold', async () => {
    personService.listFacts.mockResolvedValue([
      {
        id: FACT_ID,
        key: 'medical_notes',
        value: 'sensitive info',
        origin: 'user_declared',
        sensitivity: 'restricted',
        supersededBy: null,
      },
    ])

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-3',
      requestText: 'Hello',
      purpose: 'tutoring',
      maxSensitivity: 'personal', // Drops 'restricted' and 'sensitive'
    })

    const hasRestricted = pkg.items.some((i) => i.sensitivity === 'restricted')
    expect(hasRestricted).toBe(false)
  })

  it('omits items denied by Personal Policy', async () => {
    policies.resolveAuthority.mockImplementation(async (_pool, _personId, subject) => {
      if (subject === 'user_declared_fact') return 'DENY'
      return null
    })

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-4',
      requestText: 'Hello',
      purpose: 'tutoring',
    })

    const hasFact = pkg.items.some((i) => i.sourceType === 'user_declared_fact')
    expect(hasFact).toBe(false)
  })

  it('enforces hard token budget constraint without overflowing', async () => {
    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-5',
      requestText: 'A'.repeat(500),
      purpose: 'tutoring',
      tokenBudget: 50, // Small budget
    })

    expect(pkg.tokenUsed).toBeLessThanOrEqual(50)
  })
})

// Nhánh biên: câu hỏi rỗng, bộ nhớ episodic, lọc node/fact không hợp lệ, cắt bớt nội dung khi thiếu budget.
describe('buildContextPackage — nhánh biên', () => {
  it('nạp cả bộ nhớ episodic khi có bản ghi', async () => {
    memoryService.listMemoryRecords.mockImplementation(async (_pool, _personId, opts) => {
      if (opts?.namespace === 'episodic') {
        return [
          {
            id: MEMORY_ID,
            namespace: 'episodic',
            content: 'Buổi học hôm qua nói về thì hiện tại hoàn thành',
            provenance: 'session_log',
            sensitivity: 'personal',
          },
        ]
      }
      return []
    })

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-6',
      requestText: 'Ôn lại bài hôm qua',
      purpose: 'tutoring',
    })

    const episodic = pkg.items.find((i) => i.sourceType === 'recent_episodic_context')
    expect(episodic?.content).toContain('[episodic]')
    expect(episodic?.provenance).toBe('session_log')
  })

  it('câu hỏi rỗng (chỉ khoảng trắng) → không có mục current_request', async () => {
    lifeGraph.listNodes.mockResolvedValue([])
    personService.listFacts.mockResolvedValue([])
    memoryService.listMemoryRecords.mockResolvedValue([])

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-7',
      requestText: '   ',
      purpose: 'tutoring',
    })

    expect(pkg.items).toEqual([])
    expect(pkg.tokenUsed).toBe(0)
  })

  it('bỏ qua node đã lưu trữ và node không phải Goal/Project', async () => {
    lifeGraph.listNodes.mockResolvedValue([
      {
        value: {
          id: GOAL_NODE,
          type: 'Goal',
          label: 'Đã xong',
          archivedAt: '2026-01-01T00:00:00Z',
        },
      },
      { value: { id: GOAL_NODE, type: 'Skill', label: 'SQL', archivedAt: null } },
    ])
    personService.listFacts.mockResolvedValue([])
    memoryService.listMemoryRecords.mockResolvedValue([])

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-8',
      requestText: 'Xin chào',
      purpose: 'tutoring',
    })

    expect(pkg.items.some((i) => i.sourceType === 'active_goal_or_project')).toBe(false)
  })

  it('bỏ qua fact không do người dùng tự khai (origin khác user_declared)', async () => {
    lifeGraph.listNodes.mockResolvedValue([])
    personService.listFacts.mockResolvedValue([
      {
        id: FACT_ID,
        key: 'observed_level',
        value: 'B1',
        origin: 'observed',
        sensitivity: 'personal',
        supersededBy: null,
      },
    ])
    memoryService.listMemoryRecords.mockResolvedValue([])

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-9',
      requestText: 'Xin chào',
      purpose: 'tutoring',
    })

    expect(pkg.items.some((i) => i.sourceType === 'user_declared_fact')).toBe(false)
  })

  it('có domainState nhưng chưa đồng ý chia sẻ domain đó → bỏ qua trạng thái domain', async () => {
    consents.isConsentActive.mockImplementation(
      async (_pool, _personId, scope) => scope !== 'career',
    )
    lifeGraph.listNodes.mockResolvedValue([])
    personService.listFacts.mockResolvedValue([])
    memoryService.listMemoryRecords.mockResolvedValue([])

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-10',
      requestText: 'Xin chào',
      purpose: 'tutoring',
      domain: 'career',
      domainState: {
        sourceId: '55555555-5555-4555-8555-555555555555',
        content: 'Mục tiêu: Tech Lead',
        provenance: 'career:profile',
      },
    })

    expect(pkg.items.some((i) => i.sourceType === 'authoritative_domain_state')).toBe(false)
  })

  it('không đồng ý chia sẻ bộ nhớ cá nhân → bỏ cả memory suy ra lẫn episodic', async () => {
    consents.isConsentActive.mockImplementation(
      async (_pool, _personId, scope) => scope !== 'personal_memory',
    )
    lifeGraph.listNodes.mockResolvedValue([])
    personService.listFacts.mockResolvedValue([])

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-11',
      requestText: 'Xin chào',
      purpose: 'tutoring',
    })

    expect(memoryService.listMemoryRecords).not.toHaveBeenCalled()
    expect(pkg.items.every((i) => i.sourceType === 'current_request')).toBe(true)
  })

  it('câu hỏi dài hơn cả budget → cắt bớt nội dung thay vì bỏ hẳn', async () => {
    lifeGraph.listNodes.mockResolvedValue([])
    personService.listFacts.mockResolvedValue([])
    memoryService.listMemoryRecords.mockResolvedValue([])

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-12',
      requestText: 'A'.repeat(5000),
      purpose: 'tutoring',
      tokenBudget: 20,
    })

    expect(pkg.items.length).toBe(1)
    expect(pkg.items[0]?.sourceType).toBe('current_request')
    expect(pkg.items[0]?.content.length).toBeLessThan(5000)
    expect(pkg.tokenUsed).toBeLessThanOrEqual(20)
  })
})

describe('buildContextPackage — lưới an toàn cho mức nhạy cảm lạ', () => {
  it('maxSensitivity không hợp lệ → lùi về mức mặc định "sensitive"', async () => {
    lifeGraph.listNodes.mockResolvedValue([])
    personService.listFacts.mockResolvedValue([
      {
        id: FACT_ID,
        key: 'note',
        value: 'thông tin nhạy cảm',
        origin: 'user_declared',
        sensitivity: 'sensitive',
        supersededBy: null,
      },
    ])
    memoryService.listMemoryRecords.mockResolvedValue([])

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-13',
      requestText: 'Xin chào',
      purpose: 'tutoring',
      maxSensitivity: 'khong-hop-le' as unknown as 'sensitive',
    })

    // Mặc định 'sensitive' nên fact mức sensitive vẫn được giữ.
    expect(pkg.items.some((i) => i.sensitivity === 'sensitive')).toBe(true)
  })

  it('mục có mức nhạy cảm lạ được xếp hạng 1 nên bị loại khi ngưỡng là public', async () => {
    lifeGraph.listNodes.mockResolvedValue([])
    personService.listFacts.mockResolvedValue([
      {
        id: FACT_ID,
        key: 'note',
        value: 'giá trị lạ',
        origin: 'user_declared',
        sensitivity: 'muc-la',
        supersededBy: null,
      },
    ])
    memoryService.listMemoryRecords.mockResolvedValue([])

    const pkg = await buildContextPackage(mockPool, {
      personId: PERSON,
      requestId: 'req-14',
      requestText: 'Xin chào',
      purpose: 'tutoring',
      maxSensitivity: 'public',
    })

    expect(pkg.items.some((i) => i.sourceType === 'user_declared_fact')).toBe(false)
  })
})
