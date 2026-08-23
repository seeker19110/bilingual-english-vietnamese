// apps/dhcb/src/lib/lifeGraphApi.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  backfillLifeGoal,
  createLifeGraphEdge,
  createLifeGraphNode,
  listLifeGraphEdges,
  listLifeGraphNodes,
} from './lifeGraphApi.js'

describe('lifeGraphApi Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.setItem('gsa_session_token_v1', 'fake-token-123')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('lists life graph nodes with and without type filter', async () => {
    const mockNodes = [{ id: 'n1', type: 'Goal', label: 'Achieve C1' }]
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nodes: mockNodes }),
    } as unknown as Response)

    const nodes = await listLifeGraphNodes('Goal')
    expect(nodes).toEqual(mockNodes)

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nodes: mockNodes }),
    } as unknown as Response)

    const allNodes = await listLifeGraphNodes()
    expect(allNodes).toEqual(mockNodes)
  })

  it('throws error when listing nodes fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response)

    await expect(listLifeGraphNodes()).rejects.toThrow('HTTP error 500')
  })

  it('lists life graph edges and handles error', async () => {
    const mockEdges = [{ id: 'e1', fromNodeId: 'n1', toNodeId: 'n2', relation: 'enables' }]
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ edges: mockEdges }),
    } as unknown as Response)

    const edges = await listLifeGraphEdges()
    expect(edges).toEqual(mockEdges)

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as unknown as Response)

    await expect(listLifeGraphEdges()).rejects.toThrow('HTTP error 403')
  })

  it('creates life graph node', async () => {
    const mockNode = { id: 'n2', type: 'Skill', label: 'IELTS Speaking' }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ node: mockNode }),
    } as unknown as Response)

    const res = await createLifeGraphNode('Skill', 'IELTS Speaking')
    expect(res.node).toEqual(mockNode)

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as unknown as Response)

    await expect(createLifeGraphNode('Skill', 'X')).rejects.toThrow('HTTP error 400')
  })

  it('creates life graph edge', async () => {
    const mockEdge = { id: 'e2', fromNodeId: 'n1', toNodeId: 'n2', relation: 'enables' }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ edge: mockEdge }),
    } as unknown as Response)

    const res = await createLifeGraphEdge('n1', 'n2', 'enables', 'manual')
    expect(res.edge).toEqual(mockEdge)

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as unknown as Response)

    await expect(createLifeGraphEdge('n1', 'n2', 'enables', 'manual')).rejects.toThrow(
      'HTTP error 400',
    )
  })

  it('backfills life goal', async () => {
    const mockRes = { nodeId: 'n-goal', learningGoal: { id: 'g1', title: 'Goal' } }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockRes,
    } as unknown as Response)

    const res = await backfillLifeGoal()
    expect(res).toEqual(mockRes)

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response)

    await expect(backfillLifeGoal()).rejects.toThrow('HTTP error 500')
  })
})
