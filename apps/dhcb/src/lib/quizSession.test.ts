import { describe, it, expect, beforeEach } from 'vitest'
import { loadQuizSession, saveQuizSession, clearQuizSession, type QuizSession } from './quizSession'

const UID = 'u1'
const SCOPE = 'A1'

function session(over: Partial<QuizSession> = {}): QuizSession {
  return {
    questions: [
      { kind: 'vocab', prompt: 'top', correct: 'đỉnh', options: ['ba', 'rất', 'đỉnh'] },
      {
        kind: 'grammar',
        prompt: 'I ___ happy',
        correct: 'am',
        options: ['am', 'is'],
        lessonId: 'g1',
      },
    ],
    current: 1,
    selected: null,
    answers: [true],
    ...over,
  }
}

beforeEach(() => sessionStorage.clear())

describe('quizSession', () => {
  it('ghi rồi đọc lại đúng nguyên vẹn', () => {
    saveQuizSession(UID, SCOPE, session())
    expect(loadQuizSession(UID, SCOPE)).toEqual(session())
  })

  it('chưa có phiên nào → null', () => {
    expect(loadQuizSession(UID, SCOPE)).toBeNull()
  })

  it('tách theo người dùng và theo cấp, không trộn lẫn', () => {
    // Bộ câu hỏi của cấp A1 không được rơi sang B1, và của người này không sang người kia.
    saveQuizSession(UID, SCOPE, session())
    expect(loadQuizSession(UID, 'B1')).toBeNull()
    expect(loadQuizSession('u2', SCOPE)).toBeNull()
  })

  it('clear xoá đúng phiên đó', () => {
    saveQuizSession(UID, SCOPE, session())
    saveQuizSession(UID, 'B1', session())
    clearQuizSession(UID, SCOPE)
    expect(loadQuizSession(UID, SCOPE)).toBeNull()
    expect(loadQuizSession(UID, 'B1')).not.toBeNull()
  })

  it('dữ liệu hỏng → null chứ không ném lỗi ra màn hình đang học', () => {
    sessionStorage.setItem(`dhcb_quiz_session_v1_${UID}_${SCOPE}`, '{ không phải JSON')
    expect(loadQuizSession(UID, SCOPE)).toBeNull()
  })

  it('từ chối phiên sai hình dạng — đây là dữ liệu NGOÀI, sửa được bằng devtools', () => {
    const bad: Record<string, unknown>[] = [
      { ...session(), questions: [] }, // rỗng
      { ...session(), current: -1 }, // âm
      { ...session(), current: 99 }, // vượt số câu → sẽ dựng ra câu undefined
      { ...session(), current: 1.5 }, // không nguyên
      { ...session(), selected: 42 }, // sai kiểu
      { ...session(), answers: ['đúng'] }, // sai kiểu phần tử
      { ...session(), questions: [{ kind: 'khac', prompt: 'x', correct: 'y', options: [] }] },
      { ...session(), questions: [{ kind: 'vocab', prompt: 'x', correct: 'y', options: [1, 2] }] },
    ]
    for (const item of bad) {
      sessionStorage.setItem(`dhcb_quiz_session_v1_${UID}_${SCOPE}`, JSON.stringify(item))
      expect(loadQuizSession(UID, SCOPE), JSON.stringify(item).slice(0, 80)).toBeNull()
    }
  })
})
