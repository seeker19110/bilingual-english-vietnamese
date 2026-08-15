import { describe, it, expect } from 'vitest'
import { mergeSrsMap, mergeExamMap, mergeByTimestamp, mergeArrayUnion } from './progressMerge'

describe('mergeArrayUnion', () => {
  it('hợp 2 mảng, không trùng lặp — chỉ tăng, không mất phần tử nào', () => {
    expect(mergeArrayUnion(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('1 bên rỗng → giữ nguyên bên còn lại', () => {
    expect(mergeArrayUnion([], ['a'])).toEqual(['a'])
    expect(mergeArrayUnion(['a'], [])).toEqual(['a'])
  })

  it('phần tử bị "bỏ đánh dấu" ở client (không còn trong mảng gửi lên) vẫn được server giữ lại nếu đã từng có trên server', () => {
    // Mô phỏng: server đang có 'book' (máy A đã học), máy B đồng bộ gửi lên mảng không có 'book'
    // (do B chưa từng thấy 'book', không phải B chủ động bỏ đánh dấu) → 'book' KHÔNG được mất.
    expect(mergeArrayUnion(['book'], ['run'])).toEqual(['book', 'run'])
  })
})

describe('mergeSrsMap', () => {
  it('giữ thẻ có reps cao hơn giữa 2 bên', () => {
    const a = { book: { reps: 5 }, go: { reps: 1 } }
    const b = { book: { reps: 2 }, run: { reps: 3 } }
    expect(mergeSrsMap(a, b)).toEqual({ book: { reps: 5 }, go: { reps: 1 }, run: { reps: 3 } })
  })

  it('thẻ chỉ có ở 1 bên → giữ nguyên', () => {
    expect(mergeSrsMap({ book: { reps: 1 } }, {})).toEqual({ book: { reps: 1 } })
    expect(mergeSrsMap({}, { go: { reps: 1 } })).toEqual({ go: { reps: 1 } })
  })

  it('giá trị không đúng dạng (không có reps số) → vẫn không throw, ưu tiên bên b khi bằng/không xác định', () => {
    expect(mergeSrsMap({ book: 'garbage' }, { book: { reps: 1 } })).toEqual({ book: { reps: 1 } })
  })
})

describe('mergeExamMap', () => {
  it('hợp nhất theo cấp — passed=OR, bestPct/attempts=max, lastAt=mới hơn', () => {
    const a = { a1: { passed: false, bestPct: 40, attempts: 1, lastAt: '2026-08-01T00:00:00Z' } }
    const b = { a1: { passed: true, bestPct: 90, attempts: 2, lastAt: '2026-08-02T00:00:00Z' } }
    expect(mergeExamMap(a, b)).toEqual({
      a1: { passed: true, bestPct: 90, attempts: 2, lastAt: '2026-08-02T00:00:00Z' },
    })
  })

  it('cấp chỉ có ở 1 bên → giữ nguyên', () => {
    const a = { a1: { passed: true, bestPct: 90, attempts: 1, lastAt: '2026-08-01T00:00:00Z' } }
    expect(mergeExamMap(a, {})).toEqual(a)
    expect(mergeExamMap({}, a)).toEqual(a)
  })
})

describe('mergeByTimestamp', () => {
  it('giữ bản có mốc thời gian mới hơn', () => {
    const older = { goal: 5, updatedAt: '2026-08-01T00:00:00Z' }
    const newer = { goal: 10, updatedAt: '2026-08-02T00:00:00Z' }
    expect(mergeByTimestamp(older, newer, 'updatedAt')).toEqual(newer)
    expect(mergeByTimestamp(newer, older, 'updatedAt')).toEqual(newer)
  })

  it('bản rỗng {} (chưa từng có) luôn thua bản đã có dữ liệu', () => {
    const has = { cefr: 'A1', appLevel: 'A1', lastAt: '2026-08-01T00:00:00Z' }
    expect(mergeByTimestamp({}, has, 'lastAt')).toEqual(has)
    expect(mergeByTimestamp(has, {}, 'lastAt')).toEqual(has)
  })

  it('cả 2 rỗng → trả về rỗng, không throw', () => {
    expect(mergeByTimestamp({}, {}, 'lastAt')).toEqual({})
  })
})
