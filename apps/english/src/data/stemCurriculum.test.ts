// apps/english/src/data/stemCurriculum.test.ts — Unit tests for STEM Curriculum & Question Banks
import { describe, it, expect } from 'vitest'
import { STEM_CURRICULUM } from './stemCurriculum'

describe('STEM_CURRICULUM dataset', () => {
  const subjects = ['mathematics', 'physics', 'chemistry', 'biology']

  it('contains entries for all 4 core STEM subjects', () => {
    for (const sub of subjects) {
      expect(STEM_CURRICULUM[sub]).toBeDefined()
      expect(Array.isArray(STEM_CURRICULUM[sub])).toBe(true)
      expect(STEM_CURRICULUM[sub]!.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('each subject contains grades with non-empty chapters, formulas and sample problems', () => {
    const seenChapterIds = new Set<string>()
    const seenProblemIds = new Set<string>()

    for (const sub of subjects) {
      const grades = STEM_CURRICULUM[sub]!
      for (const gradeItem of grades) {
        expect(['grade_10', 'grade_11', 'grade_12', 'university']).toContain(gradeItem.grade)
        expect(gradeItem.gradeLabel).toBeTruthy()
        expect(gradeItem.chapters.length).toBeGreaterThanOrEqual(1)

        for (const chapter of gradeItem.chapters) {
          expect(seenChapterIds.has(chapter.id)).toBe(false)
          seenChapterIds.add(chapter.id)

          expect(chapter.title).toBeTruthy()
          expect(chapter.description).toBeTruthy()
          expect(chapter.keyFormulas.length).toBeGreaterThanOrEqual(1)

          for (const kf of chapter.keyFormulas) {
            expect(kf.name).toBeTruthy()
            expect(kf.formula).toBeTruthy()
          }

          expect(chapter.sampleProblems.length).toBeGreaterThanOrEqual(1)
          for (const prob of chapter.sampleProblems) {
            expect(seenProblemIds.has(prob.id)).toBe(false)
            seenProblemIds.add(prob.id)

            expect(prob.title).toBeTruthy()
            expect(prob.prompt).toBeTruthy()
            expect(['basic', 'intermediate', 'advanced']).toContain(prob.difficulty)
            expect(prob.solutionSteps.length).toBeGreaterThanOrEqual(1)

            for (const step of prob.solutionSteps) {
              expect(step.title).toBeTruthy()
              expect(step.detail).toBeTruthy()
            }
          }
        }
      }
    }
  })
})
