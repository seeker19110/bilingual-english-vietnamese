import { describe, expect, it } from 'vitest'
import { SubjectManifestSchema, SUBJECT_MANIFEST_SCHEMA_VERSION } from './subjectManifest.js'

describe('SubjectManifestSchema', () => {
  it('validates a language subject manifest (English)', () => {
    const english = {
      id: 'english',
      label: 'Tiếng Anh',
      description: 'Luyện giao tiếp, ngữ pháp, phát âm và từ vựng tiếng Anh theo khung CEFR',
      category: 'language',
      taxonomyKind: 'cefr',
      standardLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      questionTypes: [
        'vocabulary_mcq',
        'fill_in_blank',
        'pronunciation_assessment',
        'dialogue_turn',
      ],
      evaluationModes: ['rubric_ielts', 'rubric_ai'],
      isDefault: true,
      schemaVersion: SUBJECT_MANIFEST_SCHEMA_VERSION,
    }

    const parsed = SubjectManifestSchema.parse(english)
    expect(parsed.id).toBe('english')
    expect(parsed.category).toBe('language')
    expect(parsed.standardLevels).toContain('B2')
  })

  it('validates a STEM subject manifest (Mathematics)', () => {
    const math = {
      id: 'mathematics',
      label: 'Toán học',
      description: 'Đại số, hình học, giải tích và xác suất thống kê theo chương trình chuẩn',
      category: 'stem',
      taxonomyKind: 'grade_curriculum',
      standardLevels: ['grade_10', 'grade_11', 'grade_12', 'university'],
      questionTypes: ['multiple_choice', 'step_by_step_proof', 'formula_calculation', 'graphing'],
      evaluationModes: ['exact_formula', 'step_analysis'],
      schemaVersion: SUBJECT_MANIFEST_SCHEMA_VERSION,
    }

    const parsed = SubjectManifestSchema.parse(math)
    expect(parsed.id).toBe('mathematics')
    expect(parsed.category).toBe('stem')
    expect(parsed.evaluationModes).toContain('step_analysis')
  })
})
