import { describe, it, expect } from 'vitest'
import {
  type RagDocument,
  calculateCosineSimilarity,
  calculateKeywordScore,
  searchHybridRag,
} from './hybridRagEngine'

describe('hybridRagEngine (Hybrid RAG & RRF)', () => {
  it('calculates cosine similarity correctly', () => {
    const vecA = [1, 0, 0]
    const vecB = [1, 0, 0]
    expect(calculateCosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 4)

    const vecOrthogonal = [0, 1, 0]
    expect(calculateCosineSimilarity(vecA, vecOrthogonal)).toBeCloseTo(0.0, 4)

    const vecOpposite = [-1, 0, 0]
    expect(calculateCosineSimilarity(vecA, vecOpposite)).toBeCloseTo(-1.0, 4)
  })

  it('calculates keyword match score accurately', () => {
    const query = 'học IELTS phát âm'
    const text1 = 'Tôi muốn đăng ký khóa học IELTS cấp tốc luyện phát âm'
    const text2 = 'Nấu ăn món cơm sườn'

    const score1 = calculateKeywordScore(query, text1)
    const score2 = calculateKeywordScore(query, text2)

    expect(score1).toBeGreaterThan(score2)
    expect(score2).toBe(0)
  })

  it('performs Hybrid RRF ranking and fuses semantic + keyword scores', () => {
    const docs: RagDocument[] = [
      {
        id: 'doc-1',
        content: 'Mục tiêu học IELTS 7.5 trong năm 2026',
        embedding: [0.9, 0.1, 0.0],
      },
      {
        id: 'doc-2',
        content: 'Cách sửa CV ứng tuyển Software Engineer',
        embedding: [0.1, 0.9, 0.0],
      },
      {
        id: 'doc-3',
        content: 'Kế hoạch phát âm chuẩn IPA và shadow speaking',
        embedding: [0.8, 0.2, 0.0],
      },
    ]

    const query = 'IELTS và phát âm'
    const queryEmbedding = [0.9, 0.1, 0.0]

    const results = searchHybridRag(query, queryEmbedding, docs, { topK: 2 })

    expect(results.length).toBe(2)
    // doc-1 matches both query embedding and keyword 'IELTS'
    expect(results[0]?.document.id).toBe('doc-1')
    expect(results[0]?.rrfScore).toBeGreaterThan(0)
    expect(results[0]?.combinedConfidence).toBeGreaterThan(0)
  })

  it('handles edge cases in calculateCosineSimilarity', () => {
    expect(calculateCosineSimilarity([], [1, 2])).toBe(0)
    expect(calculateCosineSimilarity([1, 2], [])).toBe(0)
    expect(calculateCosineSimilarity([1, 2], [1, 2, 3])).toBe(0)
    expect(calculateCosineSimilarity([0, 0], [0, 0])).toBe(0)
  })

  it('handles edge cases in calculateKeywordScore', () => {
    expect(calculateKeywordScore('', 'Some text')).toBe(0)
    expect(calculateKeywordScore('query', '')).toBe(0)
  })

  it('handles searchHybridRag with empty docs, undefined queryEmbedding, and mismatched doc embeddings', () => {
    expect(searchHybridRag('query', undefined, [])).toEqual([])

    const docs: RagDocument[] = [
      { id: 'd1', content: 'hello world', embedding: [1, 0] },
      { id: 'd2', content: 'world peace' }, // no embedding
    ]

    // Without query embedding
    const noEmbResults = searchHybridRag('world', undefined, docs)
    expect(noEmbResults.length).toBe(2)

    // With query embedding of different length
    const mismatchResults = searchHybridRag('world', [1, 0, 0], docs)
    expect(mismatchResults.length).toBe(2)
  })
})
