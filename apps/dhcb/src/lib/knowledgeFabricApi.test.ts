import { describe, it, expect, afterEach, vi } from 'vitest'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn(async () => ({ Authorization: 'Bearer test-token' })),
}))

import {
  listPersonalFacts,
  declarePersonalFact,
  deletePersonalFact,
  listMemories,
  ingestMemory,
  deleteMemory,
  listAutomation,
  updateAutomationGrantStatus,
  getCrossDomainProjection,
  syncCrossDomainGraph,
  exportPersonalData,
  erasePersonalData,
} from './knowledgeFabricApi'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('knowledgeFabricApi', () => {
  describe('Personal Facts', () => {
    it('listPersonalFacts thành công', async () => {
      const mockFacts = [{ id: 'f-1', key: 'study_time', value: 'evening' }]
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
          expect(url).toBe('/api/personal-facts')
          return new Response(JSON.stringify({ facts: mockFacts }), { status: 200 })
        }),
      )
      const facts = await listPersonalFacts()
      expect(facts).toEqual(mockFacts)
    })

    it('declarePersonalFact thành công', async () => {
      const mockFact = { id: 'f-2', category: 'preference', key: 'pace', value: '10_words' }
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
          expect(url).toBe('/api/personal-facts')
          expect(init?.method).toBe('POST')
          return new Response(JSON.stringify({ fact: mockFact }), { status: 200 })
        }),
      )
      const res = await declarePersonalFact({
        category: 'preference',
        key: 'pace',
        value: '10_words',
      })
      expect(res.fact).toEqual(mockFact)
    })

    it('deletePersonalFact thành công', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
          expect(url).toContain('/api/personal-facts?id=f-1')
          expect(init?.method).toBe('DELETE')
          return new Response(JSON.stringify({ success: true }), { status: 200 })
        }),
      )
      const res = await deletePersonalFact('f-1')
      expect(res.success).toBe(true)
    })
  })

  describe('Memories', () => {
    it('listMemories có thể filter namespace', async () => {
      const mockMemories = [{ id: 'm-1', content: 'Luyện thi IELTS' }]
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
          expect(url).toContain('/api/memories?namespace=commitment')
          return new Response(JSON.stringify({ memories: mockMemories }), { status: 200 })
        }),
      )
      const res = await listMemories('commitment')
      expect(res).toEqual(mockMemories)
    })

    it('ingestMemory gửi đúng body', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
          expect(url).toBe('/api/memories')
          const body = JSON.parse(init?.body as string)
          expect(body.action).toBe('ingest')
          expect(body.candidate.content).toBe('Thích học sáng')
          return new Response(JSON.stringify({ outcome: 'ACCEPT' }), { status: 200 })
        }),
      )
      const res = await ingestMemory({
        namespace: 'preference',
        content: 'Thích học sáng',
        provenance: 'user_chat',
        sensitivity: 'personal',
      })
      expect(res.outcome).toBe('ACCEPT')
    })

    it('deleteMemory gửi đúng id', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
          expect(url).toBe('/api/memories')
          expect(init?.method).toBe('DELETE')
          return new Response(JSON.stringify({ success: true }), { status: 200 })
        }),
      )
      const res = await deleteMemory('m-1')
      expect(res.success).toBe(true)
    })
  })

  describe('Automation & Cross Domain & Privacy', () => {
    it('listAutomation trả grants và receipts', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
          expect(url).toBe('/api/automation')
          return new Response(JSON.stringify({ grants: [], receipts: [] }), { status: 200 })
        }),
      )
      const res = await listAutomation()
      expect(res.grants).toEqual([])
      expect(res.receipts).toEqual([])
    })

    it('updateAutomationGrantStatus gửi action patch', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
          expect(url).toBe('/api/automation')
          expect(init?.method).toBe('PATCH')
          const body = JSON.parse(init?.body as string)
          expect(body.action).toBe('pause')
          return new Response(JSON.stringify({ grant: { id: 'g-1', status: 'paused' } }), {
            status: 200,
          })
        }),
      )
      const res = await updateAutomationGrantStatus('g-1', 'pause', 1)
      expect(res.grant.status).toBe('paused')
    })

    it('getCrossDomainProjection và syncCrossDomainGraph', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
          if (url.includes('kind=cross_domain')) {
            return new Response(JSON.stringify({ projection: { nodes: [], edges: [] } }), {
              status: 200,
            })
          }
          return new Response(JSON.stringify({ summary: { syncedNodesCount: 2 } }), { status: 200 })
        }),
      )
      const proj = await getCrossDomainProjection()
      expect(proj.nodes).toEqual([])
      const sync = await syncCrossDomainGraph()
      expect(sync.syncedNodesCount).toBe(2)
    })

    it('exportPersonalData và erasePersonalData', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
          if (url.includes('action=export')) {
            return new Response(JSON.stringify({ person: { id: 'p-1' } }), { status: 200 })
          }
          expect(init?.method).toBe('DELETE')
          return new Response(JSON.stringify({ success: true, erasedRecordsCount: 15 }), {
            status: 200,
          })
        }),
      )
      const exported = await exportPersonalData()
      expect(exported.person).toBeDefined()
      const erased = await erasePersonalData()
      expect(erased.erasedRecordsCount).toBe(15)
    })
  })
})
