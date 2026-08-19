import { describe, it, expect } from 'vitest'
import {
  AmbientContextInsightSchema,
  AmbientScreenCaptureSchema,
  AMBIENT_SCHEMA_VERSION,
} from './ambientContext.js'

describe('core-contracts: ambientContext', () => {
  it('xác thực hợp lệ bản ghi phân tích ngữ cảnh màn hình', () => {
    const validInsight = {
      timestamp: new Date().toISOString(),
      detectedApp: 'browser',
      summaryOfWork: 'Đang đọc tài liệu kỹ thuật về Distributed Systems bằng tiếng Anh',
      relevantDomain: 'learning',
      tips: [
        {
          title: 'Thuật ngữ cốt lõi: Byzantine Fault Tolerance',
          description: 'Khả năng chịu lỗi phân tán trong môi trường không tin cậy.',
          type: 'concept_explainer',
          relevanceScore: 0.95,
        },
      ],
      extractedKeywords: ['Consensus', 'Raft', 'Paxos'],
      schemaVersion: AMBIENT_SCHEMA_VERSION,
    }

    const parsed = AmbientContextInsightSchema.parse(validInsight)
    expect(parsed.detectedApp).toBe('browser')
    expect(parsed.tips.length).toBe(1)
    expect(parsed.schemaVersion).toBe('v3.0.0')
  })

  it('xác thực hợp lệ bản ghi frame chụp màn hình', () => {
    const frame = {
      timestamp: new Date().toISOString(),
      imageDataBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      domainContext: 'work',
    }

    const parsed = AmbientScreenCaptureSchema.parse(frame)
    expect(parsed.domainContext).toBe('work')
  })
})
