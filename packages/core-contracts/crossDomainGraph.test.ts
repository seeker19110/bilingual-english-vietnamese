import { describe, expect, it } from 'vitest'
import {
  CrossDomainGraphProjectionSchema,
  CROSS_DOMAIN_GRAPH_SCHEMA_VERSION,
} from './crossDomainGraph.js'
import { LIFE_GRAPH_NODE_SCHEMA_VERSION, LIFE_GRAPH_EDGE_SCHEMA_VERSION } from './lifeGraph.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const NODE_1 = '22222222-2222-4222-8222-222222222222'
const NODE_2 = '33333333-3333-4333-8333-333333333333'
const EDGE_1 = '44444444-4444-4444-8444-444444444444'

describe('CrossDomainGraph Contracts', () => {
  it('validates CrossDomainGraphProjection', () => {
    const projection = {
      personId: PERSON_ID,
      nodes: [
        {
          id: NODE_1,
          personId: PERSON_ID,
          type: 'Goal',
          label: 'Career: Data Analyst',
          createdAt: '2026-08-17T00:00:00Z',
          updatedAt: '2026-08-17T00:00:00Z',
          schemaVersion: LIFE_GRAPH_NODE_SCHEMA_VERSION,
        },
        {
          id: NODE_2,
          personId: PERSON_ID,
          type: 'Skill',
          label: 'English B2',
          createdAt: '2026-08-17T00:00:00Z',
          updatedAt: '2026-08-17T00:00:00Z',
          schemaVersion: LIFE_GRAPH_NODE_SCHEMA_VERSION,
        },
      ],
      edges: [
        {
          id: EDGE_1,
          personId: PERSON_ID,
          fromNodeId: NODE_1,
          toNodeId: NODE_2,
          relation: 'requires',
          provenance: 'cross_domain_sync',
          createdAt: '2026-08-17T00:00:00Z',
          schemaVersion: LIFE_GRAPH_EDGE_SCHEMA_VERSION,
        },
      ],
      syncSummary: {
        careerGoalsProcessed: 1,
        skillsMapped: 1,
        nodesCreatedOrUpdated: 2,
        edgesCreatedOrUpdated: 1,
        learningMasteryAligned: 1,
      },
      syncedAt: '2026-08-17T00:00:00Z',
      schemaVersion: CROSS_DOMAIN_GRAPH_SCHEMA_VERSION,
    }

    const parsed = CrossDomainGraphProjectionSchema.parse(projection)
    expect(parsed.nodes.length).toBe(2)
    expect(parsed.edges.length).toBe(1)
    expect(parsed.syncSummary.careerGoalsProcessed).toBe(1)
  })
})
