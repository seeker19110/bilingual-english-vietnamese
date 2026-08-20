// packages/core-ai/visionSolverService.test.ts
import { describe, it, expect, vi } from 'vitest'
import {
  cleanBase64,
  parseVisionSolutionText,
  solveProblemWithVision,
} from './visionSolverService.js'

describe('VisionSolverService', () => {
  it('cleans data url headers from base64 strings', () => {
    const raw = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
    const cleaned = cleanBase64(raw)
    expect(cleaned.mimeType).toBe('image/png')
    expect(cleaned.data).toBe('iVBORw0KGgoAAAANSUhEUg==')
  })

  it('parses valid json block from AI response', () => {
    const aiText = `\`\`\`json
{
  "problemText": "Giải phương trình 2x + 4 = 0",
  "steps": [
    { "title": "Bước 1: Chuyển vế", "detail": "2x = -4", "formula": "2x = -4" },
    { "title": "Bước 2: Chia 2 vế cho 2", "detail": "x = -2", "formula": "x = -2" }
  ],
  "finalAnswer": "x = -2"
}
\`\`\``

    const parsed = parseVisionSolutionText(aiText, 'mathematics')
    expect(parsed.problemText).toBe('Giải phương trình 2x + 4 = 0')
    expect(parsed.steps).toHaveLength(2)
    expect(parsed.finalAnswer).toBe('x = -2')
  })

  it('provides structured fallback steps when AI response is unstructured', () => {
    const parsed = parseVisionSolutionText('Không thể parse JSON', 'chemistry')
    expect(parsed.steps.length).toBeGreaterThan(0)
    expect(parsed.steps[0]?.title).toContain('Bước 1')
  })

  it('solves problem in fallback simulation mode when no API key provided', async () => {
    const res = await solveProblemWithVision({
      imageBase64: 'iVBORw0KGgoAAAANSUhEUg==',
      subjectId: 'physics',
      userPrompt: 'Tính gia tốc a',
    })

    expect(res.problemText).toContain('physics')
    expect(res.steps.length).toBeGreaterThan(0)
    expect(res.finalAnswer).toBeTruthy()
    expect(res.confidence).toBeGreaterThan(0.9)
  })

  it('handles cleanBase64 without data prefix and empty aiText parsing', () => {
    const rawClean = cleanBase64('justbase64string')
    expect(rawClean.mimeType).toBe('image/jpeg')
    expect(rawClean.data).toBe('justbase64string')

    const emptyParsed = parseVisionSolutionText('', 'biology')
    expect(emptyParsed.problemText).toBe('Bài tập biology từ hình ảnh tải lên')
  })

  it('solves problem with apiKey and mock fetch responses', async () => {
    // 1. Mock fetch error
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => 'Quota exceeded',
    } as unknown as Response)

    await expect(
      solveProblemWithVision(
        {
          imageBase64: 'abc',
          subjectId: 'math',
          gradeLevel: 'Lớp 12',
          mimeType: 'image/png',
        },
        'mock-api-key',
      ),
    ).rejects.toThrow('Gemini Vision API error (403)')

    // 2. Mock fetch success
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    problemText: 'Tính tích phân',
                    steps: [
                      { title: 'B1', detail: 'Tích phân từng phần', formula: 'uv - \\int v du' },
                    ],
                    finalAnswer: 'I = 1',
                  }),
                },
              ],
            },
          },
        ],
        usageMetadata: { totalTokenCount: 420 },
      }),
    } as unknown as Response)

    const successRes = await solveProblemWithVision(
      {
        imageBase64: 'abc',
        subjectId: 'math',
      },
      'mock-api-key',
    )
    expect(successRes.problemText).toBe('Tính tích phân')
    expect(successRes.tokenUsed).toBe(420)
  })
})
