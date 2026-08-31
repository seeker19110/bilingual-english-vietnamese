// Eval khói tối thiểu cho pathCheckPrompt — kiểm PROMPT chứa các ràng buộc bất biến, không
// kiểm hành vi model thật (đó là việc của eval:tutor cho prompt Companion chính).
import { describe, it, expect } from 'vitest'
import { pathCheckSystemPrompt } from './pathCheckPrompt'

describe('pathCheckSystemPrompt', () => {
  it('luôn yêu cầu trả lời bằng tiếng Việt', () => {
    const p = pathCheckSystemPrompt('Ứng dụng LLM', ['RAG', 'Guardrail'])
    expect(p).toContain('TIẾNG VIỆT')
  })

  it('cấm tuyệt đối tiết lộ đáp án quiz', () => {
    const p = pathCheckSystemPrompt('Ứng dụng LLM', ['RAG'])
    expect(p).toContain('KHÔNG')
    expect(p.toLowerCase()).toContain('đáp án')
  })

  it('nhúng tên chặng và chủ đề vào prompt', () => {
    const p = pathCheckSystemPrompt('Toán rời rạc', ['Bù 2', 'Bảng chân trị'])
    expect(p).toContain('Toán rời rạc')
    expect(p).toContain('Bù 2')
    expect(p).toContain('Bảng chân trị')
  })

  it('không có topics vẫn ra prompt hợp lệ, không rỗng, không ném lỗi', () => {
    const p = pathCheckSystemPrompt('Chặng nào đó', [])
    expect(p.trim().length).toBeGreaterThan(50)
  })

  it('chỉ hỏi ĐÚNG MỘT câu — giữ phản hồi ngắn, không phải bài giảng', () => {
    const p = pathCheckSystemPrompt('X', ['Y'])
    expect(p).toMatch(/ĐÚNG MỘT|NGẮN/i)
  })
})
