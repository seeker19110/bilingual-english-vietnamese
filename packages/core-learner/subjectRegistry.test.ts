import { describe, expect, it } from 'vitest'
import {
  getSubjectManifest,
  listSupportedSubjects,
  isValidSubjectLevel,
} from './subjectRegistry.js'
import { NotFoundError } from '../core-errors/appError.js'

describe('subjectRegistry', () => {
  it('retrieves English manifest', () => {
    const english = getSubjectManifest('english')
    expect(english.id).toBe('english')
    expect(english.category).toBe('language')
    expect(english.taxonomyKind).toBe('cefr')
  })

  it('retrieves STEM manifests (Mathematics, Physics, Chemistry, Biology)', () => {
    const math = getSubjectManifest('mathematics')
    expect(math.category).toBe('stem')
    expect(math.evaluationModes).toContain('exact_formula')

    const physics = getSubjectManifest('physics')
    expect(physics.category).toBe('stem')

    const chemistry = getSubjectManifest('chemistry')
    expect(chemistry.category).toBe('stem')

    const biology = getSubjectManifest('biology')
    expect(biology.category).toBe('stem')
  })

  it('throws NotFoundError for unsupported subjects', () => {
    expect(() => getSubjectManifest('astronomy')).toThrow(NotFoundError)
  })

  it('lists subjects by category', () => {
    const stemSubjects = listSupportedSubjects('stem')
    expect(stemSubjects.length).toBe(4)
    expect(stemSubjects.map((s) => s.id)).toEqual([
      'mathematics',
      'physics',
      'chemistry',
      'biology',
    ])

    const languageSubjects = listSupportedSubjects('language')
    expect(languageSubjects.length).toBe(1)
    expect(languageSubjects[0]?.id).toBe('english')
  })

  it('validates subject level correctly', () => {
    expect(isValidSubjectLevel('english', 'B2')).toBe(true)
    expect(isValidSubjectLevel('english', 'grade_10')).toBe(false)
    expect(isValidSubjectLevel('mathematics', 'grade_12')).toBe(true)
    expect(isValidSubjectLevel('mathematics', 'B2')).toBe(false)
  })
})

describe('subjectRegistry — nhánh biên', () => {
  it('liệt kê toàn bộ môn khi không truyền category', () => {
    const all = listSupportedSubjects()
    expect(all.length).toBe(5)
    // Trả về BẢN SAO: sửa mảng nhận được không đụng tới registry gốc.
    all.pop()
    expect(listSupportedSubjects().length).toBe(5)
  })

  it('category không có môn nào → mảng rỗng', () => {
    expect(listSupportedSubjects('humanities')).toEqual([])
  })

  it('tra manifest không phân biệt hoa thường', () => {
    expect(getSubjectManifest('ENGLISH').id).toBe('english')
    expect(getSubjectManifest('Mathematics').id).toBe('mathematics')
  })

  it('isValidSubjectLevel trả false (không ném lỗi) khi môn học không tồn tại', () => {
    expect(isValidSubjectLevel('astronomy', 'B2')).toBe(false)
  })
})
