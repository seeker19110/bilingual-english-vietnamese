import { describe, it, expect, vi } from 'vitest'
import { analyzeCrossDomainSynergies } from './crossDomainSynergyService.js'

import type { Pool } from 'pg'
import type { LifeGraphNode, LifeGraphEdge } from '../core-contracts/lifeGraph.js'

const mockGraph: { nodes: Partial<LifeGraphNode>[]; edges: Partial<LifeGraphEdge>[] } = {
  nodes: [],
  edges: [],
}

vi.mock('./crossDomainGraphService.js', () => ({
  syncCrossDomainLifeGraph: vi.fn().mockImplementation(async () => mockGraph),
}))

describe('crossDomainSynergyService', () => {
  it('phát hiện cộng hưởng giữa Career và Learning khi có kỹ năng tiếng Anh', async () => {
    mockGraph.nodes = [
      { id: 'n1', type: 'Goal', label: 'Career: AI Engineer' },
      { id: 'n2', type: 'Skill', label: 'English Communication' },
    ]
    mockGraph.edges = []

    const report = await analyzeCrossDomainSynergies(
      {} as unknown as Pool,
      'person-123',
      'user-456',
    )

    expect(report.synergies.length).toBeGreaterThan(0)
    expect(report.synergies[0]?.targetDomain).toBe('career')
    expect(report.conflicts.length).toBe(0)
  })

  it('cảnh báo nguy cơ quá tải khi có từ 4 mục tiêu song song', async () => {
    mockGraph.nodes = [
      { id: 'n1', type: 'Goal', label: 'Career: Lead' },
      { id: 'n2', type: 'Goal', label: 'Learning: IELTS 8.0' },
      { id: 'n3', type: 'Goal', label: 'Startup: MVP 1' },
      { id: 'n4', type: 'Goal', label: 'Life: Marathon' },
    ]

    const report = await analyzeCrossDomainSynergies(
      {} as unknown as Pool,
      'person-123',
      'user-456',
    )

    expect(report.conflicts.length).toBe(1)
    expect(report.conflicts[0]?.severity).toBe('medium')
  })
})
