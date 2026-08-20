import { describe, it, expect } from 'vitest'
import { STEM_QUESTION_BANK, filterStemQuestions, getStemQuestionById } from './stemQuestionBank.js'

describe('STEM Question Bank', () => {
  it('Bank has >= 60 questions', () => {
    expect(STEM_QUESTION_BANK.length).toBeGreaterThanOrEqual(60)
  })

  it('Each subject has >= 15 questions', () => {
    const subjects = ['math', 'physics', 'chemistry', 'biology']
    for (const sub of subjects) {
      const count = STEM_QUESTION_BANK.filter((q) => q.subject === sub).length
      expect(count).toBeGreaterThanOrEqual(15)
    }
  })

  it('Filter by subject works', () => {
    const mathQs = filterStemQuestions({ subject: 'math' })
    expect(mathQs.length).toBeGreaterThan(0)
    expect(mathQs.every((q) => q.subject === 'math')).toBe(true)
  })

  it('Filter by grade works', () => {
    const grade10 = filterStemQuestions({ grade: 10 })
    expect(grade10.length).toBeGreaterThan(0)
    expect(grade10.every((q) => q.grade === 10)).toBe(true)
  })

  it('Filter by difficulty works', () => {
    const hard = filterStemQuestions({ difficulty: 'hard' })
    expect(hard.length).toBeGreaterThan(0)
    expect(hard.every((q) => q.difficulty === 'hard')).toBe(true)
  })

  it('Filter combined works', () => {
    const res = filterStemQuestions({ subject: 'math', grade: 12, difficulty: 'medium' })
    expect(
      res.every((q) => q.subject === 'math' && q.grade === 12 && q.difficulty === 'medium'),
    ).toBe(true)
  })

  it('getStemQuestionById returns correct question', () => {
    const q = STEM_QUESTION_BANK[0]!
    expect(getStemQuestionById(q.id)).toEqual(q)
  })

  it('getStemQuestionById returns undefined for unknown id', () => {
    expect(getStemQuestionById('unknown-id-123')).toBeUndefined()
  })

  it('limit works correctly', () => {
    const res = filterStemQuestions({ limit: 5 })
    expect(res.length).toBe(5)
  })

  it('Each question has a unique id', () => {
    const ids = STEM_QUESTION_BANK.map((q) => q.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })

  it('problemLatex is not empty', () => {
    expect(STEM_QUESTION_BANK.every((q) => q.problemLatex.length > 0)).toBe(true)
  })

  it('solutionLatex is not empty', () => {
    expect(STEM_QUESTION_BANK.every((q) => q.solutionLatex.length > 0)).toBe(true)
  })
})
