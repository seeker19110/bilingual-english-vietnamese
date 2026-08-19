import { describe, it, expect } from 'vitest'
import { detectWebGpuCapability, classifyIntentEdge, checkGrammarEdge } from './edgeAiService.js'

describe('edgeAiService', () => {
  it('phát hiện năng lực phần cứng WebGPU', async () => {
    const cap = await detectWebGpuCapability()
    expect(cap).toBeDefined()
    expect(['webgpu', 'wasm', 'cloud_fallback']).toContain(cap.inferenceMode)
  })

  it('phân loại đúng domain Learning, Career, Work, Startup, Life', () => {
    const r1 = classifyIntentEdge('Tôi muốn học từ vựng IELTS')
    expect(r1.domain).toBe('learning')
    expect(r1.source).toBe('edge_slm')
    expect(r1.executionTimeMs).toBeGreaterThanOrEqual(0)

    const r2 = classifyIntentEdge('Giúp tôi sửa CV để ứng tuyển Senior Developer')
    expect(r2.domain).toBe('career')

    const r3 = classifyIntentEdge('Tóm tắt nội dung cuộc họp sáng nay')
    expect(r3.domain).toBe('work')

    const r4 = classifyIntentEdge('Tôi muốn kiểm chứng mô hình kinh doanh startup')
    expect(r4.domain).toBe('startup')

    const r5 = classifyIntentEdge('Nhắc tôi duy trì thói quen tập gym mỗi ngày')
    expect(r5.domain).toBe('life')
  })

  it('kiểm tra và sửa lỗi ngữ pháp tiếng Anh chính xác', () => {
    const text = 'He don’t have a apple.'
    const result = checkGrammarEdge(text)

    expect(result.hasErrors).toBe(true)
    expect(result.issues.length).toBeGreaterThanOrEqual(1)
    expect(result.issues.some((i) => i.original.includes('a apple'))).toBe(true)
  })

  it('phát hiện lỗi lặp từ', () => {
    const text = 'This is is a test'
    const result = checkGrammarEdge(text)

    expect(result.hasErrors).toBe(true)
    expect(result.issues.some((i) => i.reason.includes('Trùng lặp'))).toBe(true)
  })
})
