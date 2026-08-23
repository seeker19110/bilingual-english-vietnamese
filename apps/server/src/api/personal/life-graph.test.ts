import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConflictError, NotFoundError } from '@dhcb/core-errors/appError'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))
vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({}) }))
const getOrCreatePerson = vi.fn()
vi.mock('@dhcb/core-personal/personService', () => ({
  getOrCreatePerson: (...a: unknown[]) => getOrCreatePerson(...a),
}))
const service = vi.hoisted(() => ({
  createNode: vi.fn(),
  listNodes: vi.fn(),
  getNode: vi.fn(),
  updateNode: vi.fn(),
  softDeleteNode: vi.fn(),
  createEdge: vi.fn(),
  listEdges: vi.fn(),
  softDeleteEdge: vi.fn(),
  transitionGoalStatus: vi.fn(),
  validateGraphIntegrity: vi.fn(),
}))
vi.mock('@dhcb/core-personal/lifeGraphService', () =>
  Object.fromEntries(Object.entries(service).map(([k, fn]) => [k, (...a: unknown[]) => fn(...a)])),
)
const syncCrossDomainLifeGraph = vi.fn()
vi.mock('@dhcb/core-personal/crossDomainGraphService', () => ({
  syncCrossDomainLifeGraph: (...a: unknown[]) => syncCrossDomainLifeGraph(...a),
}))

import handler from './life-graph.js'

const PERSON = '11111111-1111-4111-8111-111111111111'
const NODE = '22222222-2222-4222-8222-222222222222'
const NODE_2 = '33333333-3333-4333-8333-333333333333'

function req(method: string, query = '', body?: unknown) {
  return new Request(`http://localhost/api/life-graph${query}`, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  getOrCreatePerson.mockResolvedValue({ id: PERSON })
  service.listNodes.mockResolvedValue([])
  service.listEdges.mockResolvedValue([])
  service.validateGraphIntegrity.mockResolvedValue([])
  service.createNode.mockResolvedValue({ value: { id: NODE }, version: 1 })
  service.createEdge.mockResolvedValue({ value: { id: 'edge' }, version: 1 })
})

describe('auth/rate/validation', () => {
  it('401 khi chưa đăng nhập', async () => {
    authState.user = null
    expect((await handler(req('GET'))).status).toBe(401)
  })
  it('429 khi quá giới hạn', async () => {
    rateLimitOk = false
    expect((await handler(req('GET'))).status).toBe(429)
  })
  it('client gửi personId bị strict schema từ chối 400', async () => {
    const res = await handler(
      req('POST', '', { kind: 'node', type: 'Goal', label: 'x', personId: 'other' }),
    )
    expect(res.status).toBe(400)
    expect(service.createNode).not.toHaveBeenCalled()
  })
  it('node type ngoài contract trả 400', async () => {
    expect(
      (await handler(req('POST', '', { kind: 'node', type: 'Habit', label: 'x' }))).status,
    ).toBe(400)
  })
})

it('create node suy personId từ token', async () => {
  expect(
    (await handler(req('POST', '', { kind: 'node', type: 'Goal', label: 'work' }))).status,
  ).toBe(201)
  expect(service.createNode.mock.calls[0]?.[1]).toMatchObject({ personId: PERSON })
})

it('create edge validate UUID và ownership do service giữ', async () => {
  const res = await handler(
    req('POST', '', {
      kind: 'edge',
      fromNodeId: NODE,
      toNodeId: NODE_2,
      relation: 'supports',
      provenance: 'user',
    }),
  )
  expect(res.status).toBe(201)
  expect(service.createEdge.mock.calls[0]?.[1].personId).toBe(PERSON)
})

it('404 và 409 từ service được giữ đúng status', async () => {
  service.getNode.mockRejectedValueOnce(new NotFoundError())
  expect((await handler(req('GET', `?kind=node&id=${NODE}`))).status).toBe(404)
  service.updateNode.mockRejectedValueOnce(new ConflictError('stale'))
  expect(
    (await handler(req('PATCH', '', { kind: 'node', id: NODE, label: 'x', expectedVersion: 1 })))
      .status,
  ).toBe(409)
})

describe('GET các kind khác', () => {
  it('kind=nodes lọc theo type hợp lệ', async () => {
    const res = await handler(req('GET', '?kind=nodes&type=Goal'))
    expect(res.status).toBe(200)
    expect(service.listNodes.mock.calls[0]?.[2]).toMatchObject({ type: 'Goal' })
  })
  it('kind=nodes với type không hợp lệ trả 400', async () => {
    expect((await handler(req('GET', '?kind=nodes&type=Habit'))).status).toBe(400)
  })
  it('kind=node thiếu id trả 400', async () => {
    expect((await handler(req('GET', '?kind=node'))).status).toBe(400)
  })
  it('kind=node hợp lệ trả node', async () => {
    service.getNode.mockResolvedValueOnce({ value: { id: NODE }, version: 1 })
    expect((await handler(req('GET', `?kind=node&id=${NODE}`))).status).toBe(200)
  })
  it('kind=edges trả danh sách edges', async () => {
    const res = await handler(req('GET', '?kind=edges'))
    expect(res.status).toBe(200)
    expect(service.listEdges).toHaveBeenCalledWith({}, PERSON)
  })
  it('kind=integrity trả issues', async () => {
    const res = await handler(req('GET', '?kind=integrity'))
    expect(res.status).toBe(200)
    expect(service.validateGraphIntegrity).toHaveBeenCalledWith({}, PERSON)
  })
  it('kind=cross_domain gọi syncCrossDomainLifeGraph', async () => {
    syncCrossDomainLifeGraph.mockResolvedValueOnce({
      nodes: [],
      edges: [],
      syncSummary: { careerGoalsProcessed: 1 },
    })
    const res = await handler(req('GET', '?kind=cross_domain'))
    expect(res.status).toBe(200)
    expect(syncCrossDomainLifeGraph).toHaveBeenCalledWith({}, PERSON, 'user-1')
  })
  it('POST kind=cross_domain_sync gọi syncCrossDomainLifeGraph', async () => {
    syncCrossDomainLifeGraph.mockResolvedValueOnce({
      nodes: [],
      edges: [],
      syncSummary: { careerGoalsProcessed: 1 },
    })
    const res = await handler(req('POST', '', { kind: 'cross_domain_sync' }))
    expect(res.status).toBe(200)
    expect(syncCrossDomainLifeGraph).toHaveBeenCalledWith({}, PERSON, 'user-1')
  })
  it('kind không hợp lệ trả 400', async () => {
    expect((await handler(req('GET', '?kind=nope'))).status).toBe(400)
  })
})

it('PATCH kind=node cập nhật label', async () => {
  service.updateNode.mockResolvedValueOnce({ value: { id: NODE }, version: 2 })
  const res = await handler(
    req('PATCH', '', { kind: 'node', id: NODE, label: 'mới', expectedVersion: 1 }),
  )
  expect(res.status).toBe(200)
})

it('PATCH kind=goal chuyển trạng thái mục tiêu', async () => {
  service.transitionGoalStatus.mockResolvedValueOnce({ value: { id: NODE }, version: 2 })
  const res = await handler(
    req('PATCH', '', { kind: 'goal', id: NODE, status: 'achieved', expectedVersion: 1 }),
  )
  expect(res.status).toBe(200)
  expect(service.transitionGoalStatus).toHaveBeenCalledWith({}, PERSON, NODE, 'achieved', 1)
})

describe('DELETE', () => {
  it('kind=node gọi softDeleteNode', async () => {
    const res = await handler(req('DELETE', '', { kind: 'node', id: NODE, expectedVersion: 1 }))
    expect(res.status).toBe(200)
    expect(service.softDeleteNode).toHaveBeenCalledWith({}, PERSON, NODE, 1)
  })
  it('kind=edge gọi softDeleteEdge', async () => {
    const res = await handler(req('DELETE', '', { kind: 'edge', id: NODE, expectedVersion: 1 }))
    expect(res.status).toBe(200)
    expect(service.softDeleteEdge).toHaveBeenCalledWith({}, PERSON, NODE, 1)
  })
})

it('method không hỗ trợ trả 405', async () => {
  expect((await handler(req('PUT'))).status).toBe(405)
})

it('lỗi không phải AppError được ném lại', async () => {
  service.listNodes.mockRejectedValueOnce(new Error('boom'))
  await expect(handler(req('GET'))).rejects.toThrow('boom')
})
