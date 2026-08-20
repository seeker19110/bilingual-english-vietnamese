import { describe, it, expect, vi } from 'vitest'
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

  it('cleanBase64Image xử lý chuỗi thô không có data prefix', () => {
    const res = cleanBase64Image('purebase64data==')
    expect(res.mimeType).toBe('image/jpeg')
    expect(res.data).toBe('purebase64data==')
  })

  it('parseAmbientVisionText xử lý JSON lỗi hoặc thiếu trường', () => {
    const fallback = parseAmbientVisionText('invalid json {')
    expect(fallback.detectedApp).toBe('browser')
    expect(fallback.extractedKeywords).toEqual(['Context', 'Focus', 'Workflow'])

    const withPayload = parseAmbientVisionText(
      JSON.stringify({
        summaryOfWork: 'Working',
        tips: [{ actionPayload: 'payload-123' }],
      }),
    )
    expect(withPayload.tips[0]?.actionPayload).toBe('payload-123')
  })

  it('analyzeAmbientScreenFrame khi có GEMINI_API_KEY mock fetch', async () => {
    const prevKey = process.env.GEMINI_API_KEY
    process.env.GEMINI_API_KEY = 'fake-gemini-key'

    try {
      // 1. Fetch error
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as unknown as Response)

      const failRes = await analyzeAmbientScreenFrame('data:image/png;base64,1234', 'Focus on Code')
      expect(failRes.detectedApp).toBe('browser')

      // 2. Fetch success
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      detectedApp: 'chat_app',
                      summaryOfWork: 'Chatting with team',
                      relevantDomain: 'work',
                      tips: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      } as unknown as Response)

      const successRes = await analyzeAmbientScreenFrame('data:image/png;base64,1234')
      expect(successRes.detectedApp).toBe('chat_app')
    } finally {
      process.env.GEMINI_API_KEY = prevKey
    }
  })
})
