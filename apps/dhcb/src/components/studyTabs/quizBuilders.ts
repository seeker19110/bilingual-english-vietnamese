// apps/dhcb/src/components/studyTabs/quizBuilders.ts — tách từ components/StudyTabs.tsx (2.071 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.
// Barrel `components/StudyTabs.tsx` re-export nên nơi dùng không đổi đường import.

import type { DictEntry } from '../../types'
import { getLearnedWords } from '../../lib/vocab'
import { getDueGrammarLessonIds } from '../../lib/srs'
import type { QuizItem } from '../../data/cefr'
import { shuffle } from '@dhcb/core-contracts/shuffle'

// ── Quiz (tab Kiểm tra) ──────────────────────────────────────────────────────
export const QUIZ_SIZE = 10
export const CHOICES = 4
// V8, docs/research/cai-tien-lo-trinh-hoc.md: trộn tối đa 2-3 câu quiz NGỮ PHÁP (lấy từ
// các bài đã "học xong") vào tab Kiểm tra — ngữ pháp trước đây không có vòng lặp củng cố
// như từ vựng (nút "Đã học xong" không yêu cầu gì, quiz trong bài không lưu kết quả).
export const GRAMMAR_QUIZ_COUNT = 3

// 1 câu quiz ngữ pháp lấy từ GrammarLesson.quiz (src/data/cefr.ts) + lessonId để "mở lại
// bài đó" khi trả lời sai.
export interface GrammarQuizSource {
  lessonId: string
  item: QuizItem
}

export interface QuizQuestion {
  kind: 'vocab' | 'grammar'
  prompt: string // vocab: từ tiếng Anh · grammar: câu có chỗ trống (item.q)
  correct: string
  options: string[]
  lessonId?: string // chỉ có ở kind 'grammar'
}

// Câu hỏi từ vựng lấy trong `pool` (từ vựng của cấp đang học); câu hỏi ngữ pháp lấy trong
// `grammarPool` (đã lọc sẵn CHỈ các bài đã học xong, xem CefrLevelPage.tsx).
// Đề xuất E (docs/research/danh-gia-tien-trien-hoc-2026-07-07.md): ưu tiên bài ngữ pháp ĐẾN
// HẠN ôn (getDueGrammarLessonIds, xem lib/srs.ts) trước — hết bài due mới rơi về ngẫu nhiên
// như cũ, để bài học lâu không bị "quên" trong lúc bài mới học liên tục được hỏi lại.
export function buildQuiz(
  userId: string,
  pool: DictEntry[],
  grammarPool: GrammarQuizSource[],
): QuizQuestion[] {
  const dueLessonIds = new Set(
    getDueGrammarLessonIds(
      userId,
      grammarPool.map((g) => g.lessonId),
    ),
  )
  const due = grammarPool.filter((g) => dueLessonIds.has(g.lessonId))
  const rest = grammarPool.filter((g) => !dueLessonIds.has(g.lessonId))
  const chosenGrammar = [...shuffle(due), ...shuffle(rest)].slice(0, GRAMMAR_QUIZ_COUNT)
  const grammarQs: QuizQuestion[] = chosenGrammar.map(({ lessonId, item }) => ({
    kind: 'grammar',
    prompt: item.q,
    correct: item.options[item.answer] ?? '',
    options: item.options,
    lessonId,
  }))

  const vocabSize = Math.max(QUIZ_SIZE - grammarQs.length, 0)
  const learned = getLearnedWords(userId)
  const shuffled = shuffle(pool)
  const learnedPool = shuffled.filter(
    (w) => learned.has(w.word) || learned.has(w.word.toLowerCase()),
  )
  const cands =
    learnedPool.length >= vocabSize
      ? learnedPool
      : [...learnedPool, ...shuffled.slice(0, vocabSize - learnedPool.length)]
  const meanings = pool.map((w) => w.vi)
  const vocabQs: QuizQuestion[] = cands.slice(0, vocabSize).map((q) => {
    const wrongs = shuffle(meanings.filter((m) => m !== q.vi)).slice(0, CHOICES - 1)
    return {
      kind: 'vocab',
      prompt: q.word,
      correct: q.vi,
      options: shuffle([q.vi, ...wrongs]),
    }
  })

  return shuffle([...vocabQs, ...grammarQs])
}

// ── Tab Hôm nay ───────────────────────────────────────────────────────────────
// Mini-quiz mở batch mới: hỏi ĐỦ cả batch (không chỉ 5/20 từ) để mọi từ vừa học
// đều được kiểm tra ít nhất 1 lần, trộn đều 2 chiều EN→VI và VI→EN (testing
// effect 2 chiều bền hơn 1 chiều nhận biết).
export const MINI_QUIZ_CHOICES = 4

export type QuizDirection = 'en-vi' | 'vi-en'

export interface MiniQuizQ {
  word: string // key để tra lại DictEntry gốc (map lỗi sai → flashcard ôn lại)
  direction: QuizDirection
  prompt: string // cái hiển thị lớn để hỏi (từ tiếng Anh hoặc nghĩa tiếng Việt)
  correct: string
  options: string[]
}

export function buildMiniQuiz(batch: DictEntry[], pool: DictEntry[]): MiniQuizQ[] {
  const allMeanings = pool.map((w) => w.vi)
  const allWords = pool.map((w) => w.word)
  const qs = shuffle(batch)
  return qs.map((q, i) => {
    // Xen kẽ 2 chiều theo thứ tự đã xáo trộn — mỗi từ chỉ hỏi 1 chiều/lượt.
    const direction: QuizDirection = i % 2 === 0 ? 'en-vi' : 'vi-en'
    if (direction === 'en-vi') {
      const wrongs = shuffle(allMeanings.filter((m) => m !== q.vi)).slice(0, MINI_QUIZ_CHOICES - 1)
      return {
        word: q.word,
        direction,
        prompt: q.word,
        correct: q.vi,
        options: shuffle([q.vi, ...wrongs]),
      }
    }
    const wrongs = shuffle(allWords.filter((w) => w !== q.word)).slice(0, MINI_QUIZ_CHOICES - 1)
    return {
      word: q.word,
      direction,
      prompt: q.vi,
      correct: q.word,
      options: shuffle([q.word, ...wrongs]),
    }
  })
}
