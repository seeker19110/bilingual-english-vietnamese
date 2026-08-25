// Test engine chấm — trọng tâm CA BIÊN (CLAUDE.md mục 4.9: mỗi nhánh logic ≥ 1 test ca biên).
import { describe, expect, it } from 'vitest'
import {
  normalizeOutput,
  gradeTestCase,
  allTestsPassed,
  checkParsonsOrder,
  parsonsShuffle,
} from './grading.js'
import { TestCaseSchema } from './lessonTypes.js'

const tc = (over: Record<string, unknown> = {}) =>
  TestCaseSchema.parse({ expected: 'xin chào', label: 'ca 1', ...over })

describe('normalizeOutput', () => {
  it('bỏ khoảng trắng cuối dòng, dòng trống cuối, CRLF', () => {
    expect(normalizeOutput('a  \r\nb\t\n\n\n')).toBe('a\nb')
  })
  it('chuỗi rỗng và chỉ toàn xuống dòng → rỗng', () => {
    expect(normalizeOutput('')).toBe('')
    expect(normalizeOutput('\n\n')).toBe('')
  })
  it('KHÔNG đụng khoảng trắng đầu dòng (thụt lề có nghĩa với người đọc)', () => {
    expect(normalizeOutput('  a\n')).toBe('  a')
  })
})

describe('gradeTestCase', () => {
  it('contains (mặc định): output chứa expected là đạt', () => {
    expect(gradeTestCase(tc(), 'Máy nói: xin chào bạn!\n').passed).toBe(true)
  })
  it('exact: phải bằng toàn bộ sau chuẩn hoá — khác 1 ký tự là rớt', () => {
    expect(gradeTestCase(tc({ match: 'exact' }), 'xin chào \n').passed).toBe(true)
    expect(gradeTestCase(tc({ match: 'exact' }), 'xin chào!').passed).toBe(false)
  })
  it('lỗi runtime → rớt kể cả output tình cờ chứa expected', () => {
    const r = gradeTestCase(tc(), 'xin chào', 'NameError: ...')
    expect(r.passed).toBe(false)
    expect(r.error).toContain('NameError')
  })
  it('ca rớt KHÔNG ẩn: trả actual để đối chiếu; ca ẨN rớt: không lộ actual lẫn error', () => {
    expect(gradeTestCase(tc(), 'sai rồi').actual).toBe('sai rồi')
    const hid = gradeTestCase(tc({ hidden: true }), 'sai rồi', 'Boom')
    expect(hid.actual).toBeUndefined()
    expect(hid.error).toBeUndefined()
  })
  it('output rỗng với expected không rỗng → rớt (không đạt "chứa chuỗi rỗng ngược")', () => {
    expect(gradeTestCase(tc(), '').passed).toBe(false)
  })
})

describe('allTestsPassed', () => {
  it('mảng rỗng KHÔNG tính là đạt (chặn bài soạn thiếu test)', () => {
    expect(allTestsPassed([])).toBe(false)
  })
  it('mọi ca pass → đạt; 1 ca rớt → không', () => {
    const ok = { label: 'x', hidden: false, passed: true }
    expect(allTestsPassed([ok, ok])).toBe(true)
    expect(allTestsPassed([ok, { ...ok, passed: false }])).toBe(false)
  })
})

describe('checkParsonsOrder', () => {
  const sol = ['a', 'b', 'c']
  it('đúng thứ tự → true; sai chỗ / thiếu dòng → false', () => {
    expect(checkParsonsOrder(['a', 'b', 'c'], sol)).toBe(true)
    expect(checkParsonsOrder(['b', 'a', 'c'], sol)).toBe(false)
    expect(checkParsonsOrder(['a', 'b'], sol)).toBe(false)
  })
})

describe('parsonsShuffle', () => {
  const lines = ['dòng 1', 'dòng 2', 'dòng 3', 'dòng 4']
  it('deterministic theo seed + giữ nguyên tập phần tử', () => {
    const a = parsonsShuffle(lines, 'p1-u4-l1')
    expect(parsonsShuffle(lines, 'p1-u4-l1')).toEqual(a)
    expect([...a].sort()).toEqual([...lines].sort())
  })
  it('không bao giờ trả về đúng thứ tự gốc (nếu có ≥2 phần tử khác nhau)', () => {
    for (const seed of ['a', 'b', 'c', 'p1-u1-l1', 'p9-u9-l9']) {
      expect(parsonsShuffle(lines, seed)).not.toEqual(lines)
    }
  })
  it('mảng toàn phần tử giống nhau: không kẹt vòng (ca biên)', () => {
    expect(parsonsShuffle(['x', 'x'], 's')).toEqual(['x', 'x'])
  })
})
