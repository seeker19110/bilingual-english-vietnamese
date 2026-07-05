import { describe, it, expect } from 'vitest'
import { parseWordsCefrCsv, buildWordsCefrIndex, lookupWordsCefrLevel } from './wordsCefrDataset'

describe('parseWordsCefrCsv', () => {
  it('bỏ qua dòng header', () => {
    const rows = parseWordsCefrCsv('word,pos_tag,level\nabandon,VB,3\n')
    expect(rows).toEqual([{ word: 'abandon', posTag: 'VB', level: 3 }])
  })

  it('đọc được level thập phân (nội suy)', () => {
    const rows = parseWordsCefrCsv('word,pos_tag,level\nrecord,JJ,2.5\n')
    expect(rows[0]?.level).toBe(2.5)
  })

  it('chuẩn hoá chữ thường + bỏ dòng thiếu cột/level ngoài khoảng 1-6', () => {
    const rows = parseWordsCefrCsv(
      'word,pos_tag,level\nABANDON,VB,3\nbroken,VB\nout-of-range,NN,9\n',
    )
    expect(rows).toEqual([{ word: 'abandon', posTag: 'VB', level: 3 }])
  })
})

describe('buildWordsCefrIndex + lookupWordsCefrLevel', () => {
  it('khớp đúng theo pos, số nguyên → confidence "confirmed"', () => {
    const index = buildWordsCefrIndex([
      { word: 'record', posTag: 'NN', level: 3 },
      { word: 'record', posTag: 'VB', level: 2 },
    ])
    expect(lookupWordsCefrLevel(index, 'record', 'n')).toEqual({
      level: 'B1',
      confidence: 'confirmed',
    })
    expect(lookupWordsCefrLevel(index, 'record', 'v')).toEqual({
      level: 'A2',
      confidence: 'confirmed',
    })
  })

  it('level thập phân → confidence "estimated"', () => {
    const index = buildWordsCefrIndex([{ word: 'record', posTag: 'JJ', level: 2.5 }])
    const result = lookupWordsCefrLevel(index, 'record', 'adj')
    expect(result?.confidence).toBe('estimated')
    expect(result?.level).toBe('B1') // Math.round(2.5) = 3 → B1
  })

  it('dùng cấp duy nhất của từ khi không khớp đúng pos đang tra', () => {
    const index = buildWordsCefrIndex([{ word: 'abandon', posTag: 'VB', level: 3 }])
    expect(lookupWordsCefrLevel(index, 'abandon', 'adj')).toEqual({
      level: 'B1',
      confidence: 'confirmed',
    })
  })

  it('không suy đoán khi các pos khác nhau ra nhãn CEFR khác nhau', () => {
    const index = buildWordsCefrIndex([
      { word: 'record', posTag: 'NN', level: 3 },
      { word: 'record', posTag: 'VB', level: 2 },
    ])
    expect(lookupWordsCefrLevel(index, 'record', 'adj')).toBeUndefined()
  })

  it('idiom (cụm nhiều từ) không khớp — dataset chỉ có từ đơn', () => {
    const index = buildWordsCefrIndex([{ word: 'kick', posTag: 'VB', level: 1 }])
    expect(lookupWordsCefrLevel(index, 'kick the bucket', 'idiom')).toBeUndefined()
  })

  it('trả về undefined khi không có từ trong index', () => {
    const index = buildWordsCefrIndex([{ word: 'abandon', posTag: 'VB', level: 3 }])
    expect(lookupWordsCefrLevel(index, 'zzzunknown', 'n')).toBeUndefined()
  })
})
