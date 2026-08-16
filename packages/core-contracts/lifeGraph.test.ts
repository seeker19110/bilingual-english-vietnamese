import { describe, it, expect } from 'vitest'
import {
  LifeGraphNodeSchema,
  LIFE_GRAPH_NODE_SCHEMA_VERSION,
  LifeGraphEdgeSchema,
  LIFE_GRAPH_EDGE_SCHEMA_VERSION,
} from './lifeGraph.js'

const validNode = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  personId: '123e4567-e89b-12d3-a456-426614174001',
  type: 'Goal',
  label: 'Nói tiếng Anh tự tin trong công việc',
  createdAt: '2026-08-16T00:00:00Z',
  updatedAt: '2026-08-16T00:00:00Z',
  schemaVersion: LIFE_GRAPH_NODE_SCHEMA_VERSION,
}

const validEdge = {
  id: '223e4567-e89b-12d3-a456-426614174000',
  personId: '123e4567-e89b-12d3-a456-426614174001',
  fromNodeId: '323e4567-e89b-12d3-a456-426614174000',
  toNodeId: '423e4567-e89b-12d3-a456-426614174000',
  relation: 'contributes_to',
  provenance: 'user_declared',
  createdAt: '2026-08-16T00:00:00Z',
  schemaVersion: LIFE_GRAPH_EDGE_SCHEMA_VERSION,
}

describe('LifeGraphNodeSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(LifeGraphNodeSchema.parse(validNode)).toEqual(validNode)
  })

  it('có archivedAt → parse thành công', () => {
    const archived = { ...validNode, archivedAt: '2026-08-17T00:00:00Z' }
    expect(LifeGraphNodeSchema.parse(archived)).toEqual(archived)
  })

  it('type ngoài 9 loại hợp lệ → từ chối', () => {
    expect(() => LifeGraphNodeSchema.parse({ ...validNode, type: 'Habit' })).toThrow()
  })

  it('label rỗng → từ chối', () => {
    expect(() => LifeGraphNodeSchema.parse({ ...validNode, label: '' })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => LifeGraphNodeSchema.parse({ ...validNode, data: {} })).toThrow()
  })
})

describe('LifeGraphEdgeSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(LifeGraphEdgeSchema.parse(validEdge)).toEqual(validEdge)
  })

  it('relation ngoài 7 loại hợp lệ → từ chối', () => {
    expect(() => LifeGraphEdgeSchema.parse({ ...validEdge, relation: 'likes' })).toThrow()
  })

  it('fromNodeId === toNodeId (self-loop) → từ chối', () => {
    expect(() =>
      LifeGraphEdgeSchema.parse({ ...validEdge, toNodeId: validEdge.fromNodeId }),
    ).toThrow()
  })

  it('provenance rỗng → từ chối', () => {
    expect(() => LifeGraphEdgeSchema.parse({ ...validEdge, provenance: '' })).toThrow()
  })
})
