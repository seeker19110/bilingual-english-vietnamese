import { describe, it, expect } from 'vitest'
import { WorkflowSchema, WORKFLOW_SCHEMA_VERSION } from './workflow.js'

const validWorkflow = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  kind: 'onboarding',
  state: 'awaiting_placement_test',
  learnerId: '123e4567-e89b-12d3-a456-426614174001',
  retries: 0,
  startedAt: '2026-08-15T00:00:00Z',
  updatedAt: '2026-08-15T00:00:00Z',
  schemaVersion: WORKFLOW_SCHEMA_VERSION,
}

describe('WorkflowSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(WorkflowSchema.parse(validWorkflow)).toEqual(validWorkflow)
  })

  it('retries âm → từ chối', () => {
    expect(() => WorkflowSchema.parse({ ...validWorkflow, retries: -1 })).toThrow()
  })

  it('retries không phải số nguyên → từ chối', () => {
    expect(() => WorkflowSchema.parse({ ...validWorkflow, retries: 1.5 })).toThrow()
  })

  it('kind rỗng → từ chối', () => {
    expect(() => WorkflowSchema.parse({ ...validWorkflow, kind: '' })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => WorkflowSchema.parse({ ...validWorkflow, priority: 1 })).toThrow()
  })
})
