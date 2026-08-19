import { describe, it, expect } from 'vitest'
import {
  cleanBase64Image,
  parseAmbientVisionText,
  analyzeAmbientScreenFrame,
} from './ambientVisionService.js'

describe('ambientVisionService', () => {
  it('tách tiền tố data URL base64 chuẩn xác', () => {
    const raw = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA'
    const result = cleanBase64Image(raw)
    expect(result.mimeType).toBe('image/png')
    expect(result.data).toBe('iVBORw0KGgoAAAANSUhEUgAA')
  })

  it('phân tích text JSON từ AI thành cấu trúc AmbientContextInsight', () => {
    const aiText = `\`\`\`json
{
  "detectedApp": "code_editor",
  "summaryOfWork": "Đang xây dựng REST API service bằng TypeScript",
  "relevantDomain": "work",
  "tips": [
    {
      "title": "Tối ưu Index DB",
      "description": "Thêm composite index cho person_id và timestamp",
      "type": "code_refactor",
      "relevanceScore": 0.96
    }
  ],
  "extractedKeywords": ["TypeScript", "PostgreSQL", "Index"]
}
\`\`\``

    const parsed = parseAmbientVisionText(aiText)
    expect(parsed.detectedApp).toBe('code_editor')
    expect(parsed.relevantDomain).toBe('work')
    expect(parsed.tips.length).toBe(1)
    expect(parsed.tips[0]?.type).toBe('code_refactor')
  })

  it('fallback an toàn khi phân tích frame hình ảnh', async () => {
    const result = await analyzeAmbientScreenFrame('data:image/jpeg;base64,1234')
    expect(result.schemaVersion).toBe('v3.0.0')
    expect(result.tips.length).toBeGreaterThan(0)
  })
})
