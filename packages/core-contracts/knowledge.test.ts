import { describe, it, expect } from 'vitest'
import { KnowledgeSchema, KNOWLEDGE_SCHEMA_VERSION } from './knowledge.js'

const validKnowledge = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  skillId: '123e4567-e89b-12d3-a456-426614174001',
  kind: 'word',
  content: 'abandon',
  cefrLevel: 'B2',
  schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
}

describe('KnowledgeSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(KnowledgeSchema.parse(validKnowledge)).toEqual(validKnowledge)
  })

  it('kind ngoài 4 giá trị cho phép → từ chối', () => {
    expect(() => KnowledgeSchema.parse({ ...validKnowledge, kind: 'idiom' })).toThrow()
  })

  it('content rỗng → từ chối', () => {
    expect(() => KnowledgeSchema.parse({ ...validKnowledge, content: '' })).toThrow()
  })

  it('content quá dài (>500 ký tự) → từ chối', () => {
    expect(() => KnowledgeSchema.parse({ ...validKnowledge, content: 'a'.repeat(501) })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => KnowledgeSchema.parse({ ...validKnowledge, translation: 'từ bỏ' })).toThrow()
  })
})
