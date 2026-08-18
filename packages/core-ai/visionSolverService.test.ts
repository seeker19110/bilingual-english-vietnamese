// packages/core-ai/visionSolverService.test.ts
import { describe, it, expect } from 'vitest'
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
})
