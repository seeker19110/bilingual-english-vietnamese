// Unit test cho thẻ câu hỏi tick chọn — trọng tâm là câu trả lời gửi đi phải ĐÚNG những gì
// người dùng đã tick (đây là chỗ dữ liệu hồ sơ có thể bị ghi sai mà không ai phát hiện).
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import type { InteractiveQuestion } from '@dhcb/core-contracts/interactiveQuestion'
import InteractiveQuestionCard from './InteractiveQuestionCard'
import { buildAnswerText } from './interactiveAnswer'

const QUESTIONS: InteractiveQuestion[] = [
  {
    id: 'linh_vuc',
    text: 'Bạn muốn khám phá lĩnh vực nào nhất?',
    multi: true,
    options: [
      { id: 'ngon_ngu', label: 'Học một ngôn ngữ mới' },
      { id: 'cong_nghe', label: 'Công nghệ, lập trình' },
    ],
    allowFreeText: true,
  },
  {
    id: 'thoi_luong',
    text: 'Mỗi tuần bạn học được bao nhiêu giờ?',
    multi: false,
    options: [
      { id: 'duoi_3', label: 'Dưới 3 giờ' },
      { id: 'tren_3', label: 'Trên 3 giờ' },
    ],
    allowFreeText: false,
  },
]

describe('buildAnswerText', () => {
  it('gom nhiều lựa chọn của một câu thành một dòng', () => {
    const text = buildAnswerText(QUESTIONS, { linh_vuc: ['ngon_ngu', 'cong_nghe'] }, {})
    expect(text).toBe(
      'Bạn muốn khám phá lĩnh vực nào nhất? → Học một ngôn ngữ mới, Công nghệ, lập trình',
    )
  })

  it('mỗi câu đã trả lời là một dòng riêng', () => {
    const text = buildAnswerText(QUESTIONS, { linh_vuc: ['ngon_ngu'], thoi_luong: ['tren_3'] }, {})
    expect(text.split('\n')).toHaveLength(2)
    expect(text).toContain('Trên 3 giờ')
  })

  it('BỎ QUA câu chưa trả lời — không gửi dòng rỗng', () => {
    const text = buildAnswerText(QUESTIONS, { linh_vuc: ['ngon_ngu'] }, {})
    expect(text.split('\n')).toHaveLength(1)
    expect(text).not.toContain('bao nhiêu giờ')
  })

  it('nối thêm câu trả lời tự do ở ô "Khác…"', () => {
    const text = buildAnswerText(QUESTIONS, { linh_vuc: ['ngon_ngu'] }, { linh_vuc: '  Âm nhạc  ' })
    expect(text).toBe('Bạn muốn khám phá lĩnh vực nào nhất? → Học một ngôn ngữ mới, Âm nhạc')
  })

  it('ô "Khác…" chỉ có khoảng trắng thì không tính là đáp án', () => {
    expect(buildAnswerText(QUESTIONS, {}, { linh_vuc: '   ' })).toBe('')
  })

  it('id lựa chọn không có thật (dữ liệu lệch) bị bỏ qua, không sinh "undefined"', () => {
    const text = buildAnswerText(QUESTIONS, { linh_vuc: ['ngon_ngu', 'khong_ton_tai'] }, {})
    expect(text).not.toContain('undefined')
    expect(text).toBe('Bạn muốn khám phá lĩnh vực nào nhất? → Học một ngôn ngữ mới')
  })

  it('chưa chọn gì thì trả chuỗi rỗng (nút gửi sẽ bị khoá)', () => {
    expect(buildAnswerText(QUESTIONS, {}, {})).toBe('')
  })
})

describe('InteractiveQuestionCard', () => {
  it('render đủ câu hỏi, đúng loại ô tick và ô "Khác…" theo cấu hình', () => {
    const html = renderToStaticMarkup(
      React.createElement(InteractiveQuestionCard, { questions: QUESTIONS, onSubmit: () => {} }),
    )

    expect(html).toContain('Bạn muốn khám phá lĩnh vực nào nhất?')
    expect(html).toContain('Mỗi tuần bạn học được bao nhiêu giờ?')
    // Câu multi = checkbox, câu chọn một = radio
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('type="radio"')
    // Chỉ câu bật allowFreeText mới có ô tự viết
    expect(html).toContain('Khác…')
    expect(html).toContain('(chọn nhiều)')
    expect(html).toContain('(chọn một)')
  })

  it('nút gửi bị khoá khi chưa chọn đáp án nào', () => {
    const html = renderToStaticMarkup(
      React.createElement(InteractiveQuestionCard, { questions: QUESTIONS, onSubmit: () => {} }),
    )
    expect(html).toContain('disabled=""')
    expect(html).toContain('Gửi câu trả lời đã chọn')
  })
})
