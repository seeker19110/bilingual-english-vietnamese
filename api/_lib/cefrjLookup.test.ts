import { describe, it, expect } from 'vitest'
import {
  parseCefrjCsv,
  buildCefrjIndex,
  lookupCefrLevel,
  deriveLemmaCandidates,
  lookupCefrLevelWithLemma,
} from './cefrjLookup'

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

describe('deriveLemmaCandidates', () => {
  it('danh từ số nhiều: -ies→-y, -ves→-fe/-f, -es sau âm rít, -s thường', () => {
    expect(deriveLemmaCandidates('activities', 'n')).toContain('activity')
    expect(deriveLemmaCandidates('knives', 'n')).toEqual(expect.arrayContaining(['knife', 'knif']))
    expect(deriveLemmaCandidates('boxes', 'n')).toContain('box')
    expect(deriveLemmaCandidates('accounts', 'n')).toContain('account')
  })

  it('không áp quy tắc số nhiều cho từ kết thúc "ss"', () => {
    expect(deriveLemmaCandidates('class', 'n')).not.toContain('clas')
  })

  it('động từ: -ed/-ing (kể cả nhân đôi phụ âm + "e" câm), -ied, -s ngôi 3', () => {
    expect(deriveLemmaCandidates('accepted', 'v')).toContain('accept')
    expect(deriveLemmaCandidates('used', 'v')).toContain('use')
    expect(deriveLemmaCandidates('stopped', 'v')).toContain('stop')
    expect(deriveLemmaCandidates('running', 'v')).toContain('run')
    expect(deriveLemmaCandidates('applied', 'v')).toContain('apply')
    expect(deriveLemmaCandidates('tries', 'v')).toContain('try')
  })

  it('tính từ/trạng từ: -ier/-iest→-y, -er/-est', () => {
    expect(deriveLemmaCandidates('happier', 'adj')).toContain('happy')
    expect(deriveLemmaCandidates('happiest', 'adj')).toContain('happy')
    expect(deriveLemmaCandidates('faster', 'adj')).toContain('fast')
  })

  it('không sinh ứng viên cho pos không khớp quy tắc nào (idiom)', () => {
    expect(deriveLemmaCandidates('actions', 'idiom')).toEqual([])
  })

  it('không trả về chính từ gốc (đã lọc trùng)', () => {
    expect(deriveLemmaCandidates('cats', 'n')).not.toContain('cats')
  })
})

describe('lookupCefrLevelWithLemma', () => {
  it('khớp trực tiếp trước khi thử lemma', () => {
    const index = buildCefrjIndex([{ headwords: ['action'], pos: 'noun', level: 'A1' }])
    expect(lookupCefrLevelWithLemma(index, 'action', 'n')).toBe('A1')
  })

  it('khớp qua dạng gốc suy ra từ biến thể khi wordlist chỉ có dạng gốc', () => {
    const index = buildCefrjIndex([{ headwords: ['action'], pos: 'noun', level: 'A1' }])
    expect(lookupCefrLevelWithLemma(index, 'actions', 'n')).toBe('A1')
  })

  it('trả về undefined khi cả dạng gốc lẫn mọi ứng viên lemma đều không có trong wordlist', () => {
    const index = buildCefrjIndex([{ headwords: ['action'], pos: 'noun', level: 'A1' }])
    expect(lookupCefrLevelWithLemma(index, 'blockchain', 'n')).toBeUndefined()
  })
})
