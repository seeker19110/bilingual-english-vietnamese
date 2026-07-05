import { describe, it, expect } from 'vitest'
import { parseCefrjCsv, buildCefrjIndex, lookupCefrLevel } from './cefrjLookup'

describe('parseCefrjCsv', () => {
  it('bỏ qua dòng header ("CEFR" không phải cấp độ hợp lệ)', () => {
    const rows = parseCefrjCsv('headword,pos,CEFR\nabandon,verb,B1\n')
    expect(rows).toEqual([{ headwords: ['abandon'], pos: 'verb', level: 'B1' }])
  })

  it('tách biến thể viết cách nhau bằng "/" thành nhiều headword', () => {
    const rows = parseCefrjCsv('adviser/advisor,noun,B1\n')
    expect(rows[0]?.headwords).toEqual(['adviser', 'advisor'])
  })

  it('bỏ qua cột phía sau dù có chứa dấu phẩy trong ngoặc kép', () => {
    const rows = parseCefrjCsv('abuse,noun,B2,"News, lifestyles and current affairs",,\n')
    expect(rows).toEqual([{ headwords: ['abuse'], pos: 'noun', level: 'B2' }])
  })

  it('chuẩn hoá chữ thường + bỏ khoảng trắng, bỏ dòng rỗng', () => {
    const rows = parseCefrjCsv('\n  A , Determiner , a1 \n\n')
    expect(rows).toEqual([{ headwords: ['a'], pos: 'determiner', level: 'A1' }])
  })

  it('bỏ qua dòng thiếu cột hoặc cấp độ không hợp lệ', () => {
    const rows = parseCefrjCsv('broken,verb\nword,verb,X9\n')
    expect(rows).toEqual([])
  })
})

describe('buildCefrjIndex + lookupCefrLevel', () => {
  it('khớp đúng theo pos khi từ có nhiều cấp độ khác nhau theo từ loại', () => {
    const index = buildCefrjIndex([
      { headwords: ['record'], pos: 'noun', level: 'B1' },
      { headwords: ['record'], pos: 'verb', level: 'B2' },
    ])
    expect(lookupCefrLevel(index, 'record', 'n')).toBe('B1')
    expect(lookupCefrLevel(index, 'record', 'v')).toBe('B2')
  })

  it('dùng cấp duy nhất của từ khi không khớp đúng pos đang tra', () => {
    const index = buildCefrjIndex([{ headwords: ['abandon'], pos: 'verb', level: 'B1' }])
    // tra bằng pos "adj" (không có trong wordlist cho từ này) vẫn ra B1 vì không mâu thuẫn
    expect(lookupCefrLevel(index, 'abandon', 'adj')).toBe('B1')
  })

  it('không suy ra khi từ có NHIỀU cấp độ khác nhau và không khớp đúng pos', () => {
    const index = buildCefrjIndex([
      { headwords: ['record'], pos: 'noun', level: 'B1' },
      { headwords: ['record'], pos: 'verb', level: 'B2' },
    ])
    expect(lookupCefrLevel(index, 'record', 'adj')).toBeUndefined()
  })

  it('idiom là cụm nhiều từ nên không khớp wordlist đơn từ nào (fallback AI)', () => {
    const index = buildCefrjIndex([{ headwords: ['kick'], pos: 'verb', level: 'A1' }])
    expect(lookupCefrLevel(index, 'kick the bucket', 'idiom')).toBeUndefined()
  })

  it('trả về undefined khi wordlist không có từ này', () => {
    const index = buildCefrjIndex([{ headwords: ['abandon'], pos: 'verb', level: 'B1' }])
    expect(lookupCefrLevel(index, 'zzzunknown', 'n')).toBeUndefined()
  })

  it('gộp đúng biến thể viết cách nhau bằng "/" vào cùng index', () => {
    const rows = parseCefrjCsv('adviser/advisor,noun,B1\n')
    const index = buildCefrjIndex(rows)
    expect(lookupCefrLevel(index, 'adviser', 'n')).toBe('B1')
    expect(lookupCefrLevel(index, 'advisor', 'n')).toBe('B1')
  })
})
