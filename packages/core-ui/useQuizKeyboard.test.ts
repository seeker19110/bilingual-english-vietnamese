import { describe, it, expect } from 'vitest'
import { resolveQuizKey, type QuizKeyInput } from './useQuizKeyboard.js'

/** Trạng thái mặc định: 4 đáp án, chưa trả lời, không gõ chữ, không giữ phím bổ trợ. */
function input(over: Partial<QuizKeyInput> = {}): QuizKeyInput {
  return { key: '1', modified: false, typing: false, answered: false, optionCount: 4, ...over }
}

describe('resolveQuizKey', () => {
  it('phím 1..n chọn đúng đáp án tương ứng (đếm từ 0)', () => {
    expect(resolveQuizKey(input({ key: '1' }))).toEqual({ kind: 'pick', index: 0 })
    expect(resolveQuizKey(input({ key: '4' }))).toEqual({ kind: 'pick', index: 3 })
  })

  it('phím ngoài khoảng đáp án không làm gì', () => {
    // Ca biên hai đầu: '0' cho index âm, '4' vượt quá khi chỉ có 3 đáp án.
    expect(resolveQuizKey(input({ key: '0' }))).toBeNull()
    expect(resolveQuizKey(input({ key: '4', optionCount: 3 }))).toBeNull()
    expect(resolveQuizKey(input({ key: 'a' }))).toBeNull()
  })

  it('chuỗi rỗng và khoảng trắng KHÔNG bị Number() hiểu thành số 0', () => {
    // Bẫy thật của JavaScript: Number('') === 0 và Number(' ') === 0, nên nếu chỉ kiểm
    // Number.isInteger thì phím Space lúc chưa trả lời sẽ chọn nhầm đáp án thứ -1 hoặc 0.
    expect(resolveQuizKey(input({ key: ' ' }))).toBeNull()
    expect(resolveQuizKey(input({ key: '' }))).toBeNull()
  })

  it('khi CHƯA trả lời thì Enter/Space không nhảy câu', () => {
    // Chặn cố ý: bấm Enter theo quán tính sẽ bỏ qua câu hỏi mà chưa kịp đọc.
    expect(resolveQuizKey(input({ key: 'Enter' }))).toBeNull()
    expect(resolveQuizKey(input({ key: ' ' }))).toBeNull()
  })

  it('khi ĐÃ trả lời thì Enter và Space sang câu tiếp, phím số ngừng tác dụng', () => {
    expect(resolveQuizKey(input({ key: 'Enter', answered: true }))).toEqual({ kind: 'next' })
    expect(resolveQuizKey(input({ key: ' ', answered: true }))).toEqual({ kind: 'next' })
    expect(resolveQuizKey(input({ key: '2', answered: true }))).toBeNull()
  })

  it('bỏ qua khi người học đang gõ vào ô nhập', () => {
    // Lỗi kinh điển của phím tắt toàn trang: gõ "1" vào ô tìm kiếm lại nhảy sang câu khác.
    expect(resolveQuizKey(input({ typing: true }))).toBeNull()
    expect(resolveQuizKey(input({ key: 'Enter', answered: true, typing: true }))).toBeNull()
  })

  it('bỏ qua khi có phím bổ trợ (Ctrl+1 là lệnh đổi tab của trình duyệt)', () => {
    expect(resolveQuizKey(input({ modified: true }))).toBeNull()
  })
})
